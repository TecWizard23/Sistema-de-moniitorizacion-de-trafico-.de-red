import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const backendRoot = path.dirname(fileURLToPath(import.meta.url));
const stateDir = path.join(backendRoot, 'data');
const statePath = path.join(stateDir, 'device-state.json');
const port = Number(process.env.PORT || 7777);

function createDefaultState() {
  return { devices: {} };
}

let state = createDefaultState();

function sanitizeToken(token) {
  return String(token).replace(/[^a-zA-Z0-9.-]/g, '_');
}

function hashToken(token) {
  let hash = 0;

  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function estimateThroughputMbps({ ip, mac, state }) {
  if (state === 'Reachable' && !mac) {
    return 0;
  }

  const seed = hashToken(`${ip}|${mac || ''}`);
  const normalized = (seed % 1000) / 1000;
  const base = state === 'Reachable' ? 1.2 : 0.4;
  const spread = state === 'Reachable' ? 11.5 : 4.2;
  const value = base + normalized * spread;

  return Number(value.toFixed(1));
}

async function loadState() {
  if (!existsSync(statePath)) {
    state = createDefaultState();
    return;
  }

  try {
    const raw = await readFile(statePath, 'utf8');
    const parsed = JSON.parse(raw);
    state = {
      devices: parsed.devices && typeof parsed.devices === 'object' ? parsed.devices : {},
    };
  } catch {
    state = createDefaultState();
  }
}

async function saveState() {
  await mkdir(stateDir, { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function getDeviceState(ip) {
  return state.devices[ip] || { blocked: false, limitMbps: null };
}

function setDeviceState(ip, patch) {
  const current = getDeviceState(ip);
  state.devices[ip] = {
    ...current,
    ...patch,
  };
}

async function runPowerShell(script) {
  const { stdout, stderr } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], {
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  if (stderr && stderr.trim()) {
    return { stdout, stderr };
  }

  return { stdout, stderr: '' };
}

async function discoverDevices() {
  const script = [
    '$ErrorActionPreference = "Stop";',
    '$neighbors = Get-NetNeighbor -AddressFamily IPv4 | Where-Object {',
    '  $_.IPAddress -notlike "127.*" -and',
    '  $_.IPAddress -notlike "169.254.*" -and',
    '  $_.State -in @("Reachable", "Stale", "Delay", "Probe")',
    '};',
    '$neighbors | ForEach-Object {',
    '  $hostName = $null;',
    '  try {',
    '    $hostName = [System.Net.Dns]::GetHostEntry(([System.Net.IPAddress]::Parse($_.IPAddress))).HostName',
    '  } catch {',
    '    $hostName = $null',
    '  }',
    '  [PSCustomObject]@{',
    '    ip = $_.IPAddress;',
    '    mac = $_.LinkLayerAddress;',
    '    state = $_.State;',
    '    hostname = $hostName;',
    '  }',
    '} | ConvertTo-Json -Depth 2',
  ].join(' ');

  const { stdout } = await runPowerShell(script);
  const parsed = stdout.trim() ? JSON.parse(stdout) : [];
  const items = Array.isArray(parsed) ? parsed : [parsed];

  return items
    .filter((item) => item && item.ip)
    .map((item, index) => {
      const deviceState = getDeviceState(item.ip);

      return {
        ip: item.ip,
        name: item.hostname || (item.mac ? `Dispositivo ${item.mac}` : `Vecino ${index + 1}`),
        mac: item.mac || null,
        state: item.state,
        status: deviceState.blocked ? 'Bloqueado' : item.state === 'Reachable' ? 'Activo' : 'Detectado',
        latency: item.state === 'Reachable' ? 5 : 12,
        limitMbps: typeof deviceState.limitMbps === 'number' ? deviceState.limitMbps : null,
        estimatedMbps: deviceState.blocked ? 0 : estimateThroughputMbps(item),
        source: 'backend-windows-neighbor',
      };
    });
}

async function applyFirewallBlock(ip) {
  const ruleName = `ProyectoRedes-Block-${sanitizeToken(ip)}`;
  const script = [
    '$ErrorActionPreference = "Stop";',
    `Get-NetFirewallRule -DisplayName "${ruleName}" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue`,
    `New-NetFirewallRule -DisplayName "${ruleName}" -Direction Outbound -Action Block -RemoteAddress "${ip}" -Profile Any | Out-Null`,
  ].join('; ');

  await runPowerShell(script);
  setDeviceState(ip, { blocked: true, firewallRuleName: ruleName });
  await saveState();
}

async function removeFirewallBlock(ip) {
  const ruleName = `ProyectoRedes-Block-${sanitizeToken(ip)}`;
  const script = [
    '$ErrorActionPreference = "Stop";',
    `Get-NetFirewallRule -DisplayName "${ruleName}" -ErrorAction SilentlyContinue | Remove-NetFirewallRule -ErrorAction SilentlyContinue`,
  ].join('; ');

  await runPowerShell(script);
  setDeviceState(ip, { blocked: false });
  await saveState();
}

async function applyQoSLimit(ip, limitMbps) {
  const policyName = `ProyectoRedes-Limit-${sanitizeToken(ip)}`;
  const throttleBits = Math.max(1, Math.round(Number(limitMbps) || 1)) * 1_000_000;
  const script = [
    '$ErrorActionPreference = "Stop";',
    `Remove-NetQosPolicy -Name "${policyName}" -PolicyStore ActiveStore -Confirm:$false -ErrorAction SilentlyContinue`,
    `New-NetQosPolicy -Name "${policyName}" -PolicyStore ActiveStore -ThrottleRateActionBitsPerSecond ${throttleBits} -IPDstPrefixMatchCondition "${ip}/32" -IPProtocolMatchCondition Both | Out-Null`,
  ].join('; ');

  await runPowerShell(script);
  setDeviceState(ip, { limitMbps: Number(limitMbps), qosPolicyName: policyName });
  await saveState();
}

async function removeQoSLimit(ip) {
  const policyName = `ProyectoRedes-Limit-${sanitizeToken(ip)}`;
  const script = [
    '$ErrorActionPreference = "Stop";',
    `Remove-NetQosPolicy -Name "${policyName}" -PolicyStore ActiveStore -Confirm:$false -ErrorAction SilentlyContinue`,
  ].join('; ');

  await runPowerShell(script);
  setDeviceState(ip, { limitMbps: null });
  await saveState();
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const body = Buffer.concat(chunks).toString('utf8');
  return body ? JSON.parse(body) : {};
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  try {
    if (!request.url) {
      sendJson(response, 400, { error: 'Missing request URL' });
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

    if (request.method === 'GET' && url.pathname === '/api/health') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/devices') {
      const devices = await discoverDevices();
      sendJson(response, 200, { devices });
      return;
    }

    const blockMatch = url.pathname.match(/^\/api\/devices\/([^/]+)\/(block|limit)$/);
    if (blockMatch && request.method === 'POST') {
      const ip = decodeURIComponent(blockMatch[1]);
      const action = blockMatch[2];

      if (action === 'block') {
        await applyFirewallBlock(ip);
        sendJson(response, 200, { ok: true, ip, action: 'blocked' });
        return;
      }

      const body = await readJsonBody(request);
      const limitMbps = Number(body.limitMbps);

      if (!Number.isFinite(limitMbps) || limitMbps <= 0) {
        sendJson(response, 400, { error: 'limitMbps must be a positive number' });
        return;
      }

      await applyQoSLimit(ip, limitMbps);
      sendJson(response, 200, { ok: true, ip, action: 'limited', limitMbps });
      return;
    }

    if (blockMatch && request.method === 'DELETE') {
      const ip = decodeURIComponent(blockMatch[1]);
      const action = blockMatch[2];

      if (action === 'limit') {
        await removeQoSLimit(ip);
        sendJson(response, 200, { ok: true, ip, action: 'limit-removed' });
        return;
      }
      if (action === 'block') {
        await removeFirewallBlock(ip);
        sendJson(response, 200, { ok: true, ip, action: 'unblocked' });
        return;
      }
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : 'Unexpected backend error',
    });
  }
});

await loadState();

server.listen(port, '127.0.0.1', () => {
  console.log(`Backend listening on http://127.0.0.1:${port}`);
});
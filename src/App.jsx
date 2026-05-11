import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import SummaryCard from './components/SummaryCard';
import DeviceTable from './components/DeviceTable';
import TrafficSection from './components/TrafficSection';
import NetworkHealth from './components/NetworkHealth';
import AlertsPanel from './components/AlertsPanel';
import LiveActivity from './components/LiveActivity';
import LimitersPanel from './components/LimitersPanel';
import LimitModal from './components/LimitModal';
import {
  queryPrometheusInstant,
  queryPrometheusRange,
  readPrometheusScalar,
  readPrometheusSeries,
} from './services/prometheus';

const menu = ['Panel', 'Dispositivos', 'Tráfico', 'Configuración'];

const prometheusPlatform = import.meta.env.VITE_PROMETHEUS_PLATFORM || 'windows';

const prometheusQueriesByPlatform = {
  windows: {
    cpuUsage: '100 - (avg(rate(windows_cpu_time_total{mode="idle"}[2m])) * 100)',
    memoryUsage:
      '100 - (100 * windows_memory_physical_free_bytes / windows_memory_physical_total_bytes)',
    saturation:
      '100 * sum(rate(windows_net_bytes_total[2m])) / sum(windows_net_current_bandwidth_bytes)',
    trafficMbps: 'sum(rate(windows_net_bytes_total[2m])) * 8 / 1000000',
  },
  linux: {
    cpuUsage: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[2m])) * 100)',
    memoryUsage: '100 * (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes))',
    saturation: '100 * (node_load1 / count(node_cpu_seconds_total{mode="idle"}))',
    trafficMbps:
      'sum(rate(node_network_receive_bytes_total{device!~"lo|docker.*|veth.*|br-.*"}[2m]) + rate(node_network_transmit_bytes_total{device!~"lo|docker.*|veth.*|br-.*"}[2m])) * 8 / 1000000',
  },
};

const prometheusQueries = prometheusQueriesByPlatform[prometheusPlatform] || prometheusQueriesByPlatform.windows;

function clampPercentage(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
}

function formatMonitoringTime(timestamp) {
  if (!timestamp) {
    return 'pendiente de primer sondeo';
  }

  return new Date(timestamp).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function App() {
  const [activeSection, setActiveSection] = useState('Panel');
  const [devices, setDevices] = useState([]);
  const [devicesStatus, setDevicesStatus] = useState('loading');
  const [devicesError, setDevicesError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLimiterIp, setSelectedLimiterIp] = useState(null);
  const [limitDraft, setLimitDraft] = useState(20);
  const [monitoring, setMonitoring] = useState({
    status: 'loading',
    error: null,
    lastUpdatedAt: null,
    cpuUsage: null,
    memoryUsage: null,
    saturation: null,
    trafficPoints: [],
    trafficPeak: null,
    trafficAverage: null,
  });

  useEffect(() => {
    let cancelled = false;

    const refreshMonitoring = async () => {
      const now = Date.now();

      try {
        const [cpuResult, memoryResult, saturationResult, trafficResult, trafficRangeResult] = await Promise.all([
          queryPrometheusInstant(prometheusQueries.cpuUsage),
          queryPrometheusInstant(prometheusQueries.memoryUsage),
          queryPrometheusInstant(prometheusQueries.saturation),
          queryPrometheusInstant(prometheusQueries.trafficMbps),
          queryPrometheusRange(prometheusQueries.trafficMbps, {
            start: Math.floor((now - 10 * 60 * 1000) / 1000),
            end: Math.floor(now / 1000),
            step: '30s',
          }),
        ]);

        if (cancelled) {
          return;
        }

        const trafficPoints = readPrometheusSeries(trafficRangeResult).slice(-12);
        const trafficAverage = trafficPoints.length
          ? trafficPoints.reduce((sum, point) => sum + point, 0) / trafficPoints.length
          : readPrometheusScalar(trafficResult);
        const trafficPeak = trafficPoints.length ? Math.max(...trafficPoints) : readPrometheusScalar(trafficResult);

        setMonitoring({
          status: 'ready',
          error: null,
          lastUpdatedAt: now,
          cpuUsage: clampPercentage(readPrometheusScalar(cpuResult)),
          memoryUsage: clampPercentage(readPrometheusScalar(memoryResult)),
          saturation: clampPercentage(readPrometheusScalar(saturationResult)),
          trafficPoints,
          trafficPeak,
          trafficAverage,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setMonitoring((current) => ({
          ...current,
          status: 'error',
          error: error instanceof Error ? error.message : 'No se pudieron leer las métricas',
        }));
      }
    };

    refreshMonitoring();
    const intervalId = setInterval(refreshMonitoring, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        const payload = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(payload.error || `No se pudieron leer dispositivos (${response.status})`);
        }

        setDevices(Array.isArray(payload.devices) ? payload.devices : []);
        setDevicesStatus('ready');
        setDevicesError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setDevices([]);
        setDevicesStatus('error');
        setDevicesError(error instanceof Error ? error.message : 'No se pudieron leer los dispositivos');
      }
    };

    refreshDevices();
    const intervalId = setInterval(refreshDevices, 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const refreshDevices = async () => {
    const response = await fetch('/api/devices');
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || `No se pudieron leer dispositivos (${response.status})`);
    }

    setDevices(Array.isArray(payload.devices) ? payload.devices : []);
    setDevicesStatus('ready');
    setDevicesError(null);
  };

  const stats = useMemo(() => {
    const blockedDevices = devices.filter((item) => item.status === 'Bloqueado').length;
    const usage = devices.length > 0 ? (devices.length * 2.6).toFixed(1) : '0.0';
    const activeDevices = devices.filter((item) => item.status === 'Activo').length;
    const limitedDevices = devices.filter((item) => typeof item.limitMbps === 'number').length;

    return {
      totalDevices: devices.length,
      networkUsage: usage,
      blockedDevices,
      activeDevices,
      limitedDevices,
    };
  }, [devices]);

  const selectedLimiterDevice = useMemo(
    () => devices.find((device) => device.ip === selectedLimiterIp) || null,
    [devices, selectedLimiterIp]
  );

  const filteredDevices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return devices;
    }

    return devices.filter(
      (device) =>
        device.ip.toLowerCase().includes(term) ||
        device.name.toLowerCase().includes(term)
    );
  }, [devices, searchTerm]);

  const handleBlock = (ip) => {
    const targetDevice = devices.find((device) => device.ip === ip);
    const method = targetDevice?.status === 'Bloqueado' ? 'DELETE' : 'POST';

    fetch(`/api/devices/${encodeURIComponent(ip)}/block`, { method })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(
            payload.error ||
              (method === 'DELETE' ? `No se pudo desbloquear ${ip}` : `No se pudo bloquear ${ip}`)
          );
        }

        return refreshDevices();
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'No se pudo actualizar el estado del dispositivo');
      });
  };

  const handleLimit = (ip) => {
    const device = devices.find((item) => item.ip === ip);
    if (!device) {
      return;
    }

    setSelectedLimiterIp(ip);
    setLimitDraft(device.limitMbps ?? 20);
  };

  const handleSaveLimit = async () => {
    if (!selectedLimiterIp) {
      return;
    }

    const normalizedLimit = Math.max(1, Math.min(100, Number(limitDraft) || 1));

    try {
      const response = await fetch(`/api/devices/${encodeURIComponent(selectedLimiterIp)}/limit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ limitMbps: normalizedLimit }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || `No se pudo aplicar el limitador a ${selectedLimiterIp}`);
      }

      await refreshDevices();
      setSelectedLimiterIp(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo aplicar el limitador');
    }
  };

  const handleCloseLimitModal = () => {
    setSelectedLimiterIp(null);
  };

  const handleClearLimit = (ip) => {
    fetch(`/api/devices/${encodeURIComponent(ip)}/limit`, { method: 'DELETE' })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || `No se pudo quitar el limitador de ${ip}`);
        }

        return refreshDevices();
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'No se pudo quitar el limitador');
      });
  };

  const handleQuickApplyProfile = (profileLimit) => {
    const activeTargets = devices.filter((device) => device.status === 'Activo');

    Promise.all(
      activeTargets.map((device) =>
        fetch(`/api/devices/${encodeURIComponent(device.ip)}/limit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ limitMbps: profileLimit }),
        })
      )
    )
      .then(async (responses) => {
        const failures = [];

        for (const response of responses) {
          const payload = await response.json();
          if (!response.ok) {
            failures.push(payload.error || 'Error aplicando perfil');
          }
        }

        if (failures.length > 0) {
          throw new Error(failures[0]);
        }

        await refreshDevices();
      })
      .catch((error) => {
        alert(error instanceof Error ? error.message : 'No se pudo aplicar el perfil');
      });
  };

  const summaryIcons = {
    devices: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M8 18v2h8v-2" />
      </svg>
    ),
    traffic: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 17h4l3-9 4 12 3-7h4" />
      </svg>
    ),
    blocked: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="m6 6 12 12" />
      </svg>
    ),
    active: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v9" />
        <path d="M7.5 6.5a7 7 0 1 0 9 0" />
      </svg>
    ),
  };

  return (
    <div className="dashboard-bg min-h-screen bg-gray-950 bg-grid-dark bg-[size:22px_22px] text-white">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          menuItems={menu}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <main className="flex-1 px-4 py-6 sm:px-8 lg:px-10">
          <header className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100 sm:text-3xl">
              Centro de Operaciones de Red
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Monitorea dispositivos, tráfico y acciones de políticas en tiempo real.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
              <span
                className={`h-2 w-2 rounded-full ${
                  monitoring.status === 'error' || devicesStatus === 'error'
                    ? 'bg-rose-300'
                    : 'bg-cyan-300 animate-soft-pulse'
                }`}
              />
              {devicesStatus === 'error'
                ? `Inventario local sin respuesta - ${devicesError}`
                : monitoring.status === 'error'
                ? `Prometheus sin respuesta - ${monitoring.error}`
                : `Prometheus ${prometheusPlatform} conectado - último sondeo: ${formatMonitoringTime(monitoring.lastUpdatedAt)}`}
            </div>
          </header>

          {(activeSection === 'Panel' || activeSection === 'Dispositivos') && (
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                label="Dispositivos conectados"
                value={stats.totalDevices}
                accent="cyan"
                trend="+12.4%"
                icon={summaryIcons.devices}
              />
              <SummaryCard
                label="Uso de red (Mbps)"
                value={stats.networkUsage}
                accent="blue"
                trend="+4.8%"
                icon={summaryIcons.traffic}
              />
              <SummaryCard
                label="Dispositivos bloqueados"
                value={stats.blockedDevices}
                accent="red"
                trend="+1.1%"
                icon={summaryIcons.blocked}
              />
              <SummaryCard
                label="Con limitador"
                value={stats.limitedDevices}
                accent="emerald"
                trend="+3.6%"
                icon={summaryIcons.active}
              />
            </section>
          )}

          {(activeSection === 'Panel' || activeSection === 'Dispositivos') && (
            <section className="mb-8">
              <DeviceTable
                devices={filteredDevices}
                onBlock={handleBlock}
                onLimit={handleLimit}
                onClearLimit={handleClearLimit}
                filter={searchTerm}
                onFilterChange={setSearchTerm}
                sourceLabel={devicesStatus === 'ready' ? 'Detectados en Windows' : 'Sin inventario real'}
                emptyMessage={
                  devicesStatus === 'ready'
                    ? 'No se detectaron vecinos IPv4 activos en este momento.'
                    : 'Cargando inventario real desde Windows...'
                }
              />
            </section>
          )}

          {(activeSection === 'Panel' || activeSection === 'Dispositivos') && (
            <section className="mb-8">
              <LimitersPanel
                devices={devices}
                onQuickApply={handleQuickApplyProfile}
                onClearLimit={handleClearLimit}
              />
            </section>
          )}

          {(activeSection === 'Panel' || activeSection === 'Tráfico') && (
            <section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <TrafficSection
                  points={monitoring.trafficPoints}
                  peak={monitoring.trafficPeak}
                  average={monitoring.trafficAverage}
                  lastUpdatedAt={monitoring.lastUpdatedAt}
                  status={monitoring.status}
                />
              </div>
              <NetworkHealth
                cpuUsage={monitoring.cpuUsage}
                memoryUsage={monitoring.memoryUsage}
                saturation={monitoring.saturation}
                status={monitoring.status}
                error={monitoring.error}
              />
            </section>
          )}

          {activeSection === 'Panel' && (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <AlertsPanel />
              <LiveActivity />
            </section>
          )}

          {activeSection === 'Configuración' && (
            <section className="rounded-2xl border border-slate-800 bg-gray-900/70 p-6 shadow-glow">
              <h2 className="text-lg font-semibold text-slate-100">Configuración</h2>
              <p className="mt-2 text-sm text-slate-400">
                Este panel está listo para futuros controles de políticas y reglas de alerta.
              </p>
            </section>
          )}
        </main>
      </div>

      <LimitModal
        open={Boolean(selectedLimiterDevice)}
        device={selectedLimiterDevice}
        value={limitDraft}
        onChange={setLimitDraft}
        onClose={handleCloseLimitModal}
        onSave={handleSaveLimit}
      />
    </div>
  );
}

export default App;
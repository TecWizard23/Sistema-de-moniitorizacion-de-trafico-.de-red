const DEFAULT_PROMETHEUS_BASE_URL = import.meta.env.VITE_PROMETHEUS_BASE_URL || '/prometheus';
const DEFAULT_RANGE_STEP = import.meta.env.VITE_PROMETHEUS_RANGE_STEP || '30s';

//Al fin funciono esta wea, no se que hice pero ya jalo, creo que era el url del prometheus, lo deje como /prometheus y ya jalo, antes lo tenia con la ip y el puerto y no jalaba, pero ahora si, ya puedo hacer consultas a prometheus desde mi app
function getPrometheusBaseUrl() {
  return String(DEFAULT_PROMETHEUS_BASE_URL).replace(/\/$/, '');
}

async function fetchPrometheusJson(path) {
  const response = await fetch(`${getPrometheusBaseUrl()}${path}`);

  if (!response.ok) {
    throw new Error(`Prometheus respondió con ${response.status}`);
  }

  const payload = await response.json();

  if (payload.status !== 'success') {
    throw new Error(payload.error || 'Prometheus devolvió un estado no exitoso');
  }

  return payload.data;
}

export async function queryPrometheusInstant(query) {
  const data = await fetchPrometheusJson(`/api/v1/query?query=${encodeURIComponent(query)}`);
  return data.result ?? [];
}

export async function queryPrometheusRange(query, { start, end, step = DEFAULT_RANGE_STEP }) {
  const params = new URLSearchParams({
    query,
    start: String(start),
    end: String(end),
    step,
  });

  const data = await fetchPrometheusJson(`/api/v1/query_range?${params.toString()}`);
  return data.result ?? [];
}

export function readPrometheusScalar(result) {
  if (!Array.isArray(result) || result.length === 0) {
    return null;
  }

  const rawValue = result[0]?.value?.[1];
  const numericValue = Number.parseFloat(rawValue);

  return Number.isFinite(numericValue) ? numericValue : null;
}

export function readPrometheusSeries(result) {
  if (!Array.isArray(result) || result.length === 0) {
    return [];
  }

  const sampleSet = result[0]?.values ?? [];

  return sampleSet
    .map((sample) => Number.parseFloat(sample[1]))
    .filter((value) => Number.isFinite(value));
}
function TrafficSection({ points = [], peak, average, lastUpdatedAt, status }) {
  const max = points.length > 0 ? Math.max(...points) : null;
  const avg = points.length > 0 ? Math.round(points.reduce((sum, item) => sum + item, 0) / points.length) : null;
  const peakValue = Number.isFinite(peak) ? peak : max;
  const averageValue = Number.isFinite(average) ? Math.round(average) : avg;
  const hasData = points.length > 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-gray-900/70 p-5 shadow-xl animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Sección de tráfico</h2>
        <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-medium text-cyan-300">
          {status === 'ready' ? 'Prometheus en tiempo real' : 'Esperando Prometheus'}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Pico</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {Number.isFinite(peakValue) ? `${peakValue.toFixed(1)} Mbps` : 'N/D'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Promedio</p>
          <p className="mt-1 text-lg font-semibold text-slate-100">
            {Number.isFinite(averageValue) ? `${averageValue.toFixed(1)} Mbps` : 'N/D'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Paquetes perdidos</p>
          <p className="mt-1 text-lg font-semibold text-amber-300">N/D</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Jitter</p>
          <p className="mt-1 text-lg font-semibold text-cyan-300">N/D</p>
        </div>
      </div>

      {hasData ? (
        <div className="grid h-56 grid-cols-12 items-end gap-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          {points.map((point, index) => (
            <div
              key={`${point}-${index}`}
              className="relative rounded-md bg-gradient-to-t from-cyan-600 to-blue-400 transition-all duration-300 hover:scale-105 hover:from-cyan-500 hover:to-sky-300"
              style={{
                height: `${(point / Math.max(...points)) * 100}%`,
                animationDelay: `${index * 75}ms`,
              }}
              title={`${point.toFixed(1)} Mbps`}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400">
                {point.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid h-56 place-items-center rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-center">
          <div>
            <p className="text-sm font-medium text-slate-200">Sin series de tráfico disponibles</p>
            <p className="mt-2 text-xs text-slate-400">
              Verifica que Prometheus tenga métricas de red como node_network_* y acceso al exporter.
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Último refresco: {lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString('es-ES') : 'pendiente'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrafficSection;
function Gauge({ label, value, color }) {
  const isReady = Number.isFinite(value);
  const normalizedValue = isReady ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/75 p-4">
      <div className="relative mx-auto h-24 w-24 animate-float">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: isReady
              ? `conic-gradient(${color} ${normalizedValue * 3.6}deg, rgba(30,41,59,0.8) 0deg)`
              : 'conic-gradient(rgba(100,116,139,0.55) 0deg, rgba(30,41,59,0.8) 0deg)',
          }}
        />
        <div className="absolute inset-2 grid place-items-center rounded-full bg-slate-950 text-sm font-semibold text-slate-100">
          {isReady ? `${Math.round(normalizedValue)}%` : 'N/D'}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-300">{label}</p>
    </div>
  );
}

function NetworkHealth({ cpuUsage, memoryUsage, saturation, status, error }) {
  const statusLabel =
    status === 'ready' ? 'Conectado' : status === 'error' ? 'Sin datos' : 'Cargando';

  return (
    <section className="rounded-2xl border border-slate-800 bg-gray-900/70 p-5 shadow-xl animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Salud de red</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            status === 'ready'
              ? 'bg-emerald-500/20 text-emerald-300'
              : status === 'error'
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-slate-500/20 text-slate-300'
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {error ? <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p> : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Gauge label="CPU del router" value={cpuUsage} color="rgba(56,189,248,0.9)" />
        <Gauge label="Memoria" value={memoryUsage} color="rgba(14,165,233,0.9)" />
        <Gauge label="Saturación" value={saturation} color="rgba(16,185,129,0.9)" />
      </div>
    </section>
  );
}

export default NetworkHealth;

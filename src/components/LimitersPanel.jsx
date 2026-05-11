function LimitersPanel({ devices, onQuickApply, onClearLimit }) {
  const limitedDevices = devices.filter((device) => typeof device.limitMbps === 'number');

  return (
    <section className="rounded-2xl border border-slate-800 bg-gray-900/70 p-5 shadow-xl animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Limitadores activos</h2>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
          QoS en tiempo real
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onQuickApply(10)}
          className="rounded-lg border border-blue-500/40 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/25"
        >
          Perfil Streaming 10 Mbps
        </button>
        <button
          type="button"
          onClick={() => onQuickApply(25)}
          className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
        >
          Perfil Trabajo 25 Mbps
        </button>
        <button
          type="button"
          onClick={() => onQuickApply(40)}
          className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
        >
          Perfil Prioritario 40 Mbps
        </button>
      </div>

      {limitedDevices.length === 0 ? (
        <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400">
          No hay dispositivos con limitador configurado.
        </p>
      ) : (
        <div className="space-y-2">
          {limitedDevices.map((device) => (
            <div
              key={device.ip}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{device.name}</p>
                <p className="text-xs font-mono text-slate-400">{device.ip}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                  {device.limitMbps} Mbps
                </span>
                <button
                  type="button"
                  onClick={() => onClearLimit(device.ip)}
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default LimitersPanel;

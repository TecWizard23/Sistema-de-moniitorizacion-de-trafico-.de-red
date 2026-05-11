function LimitModal({ open, device, value, onChange, onClose, onSave }) {
  if (!open || !device) {
    return null;
  }

  const presets = [5, 10, 20, 35, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl animate-fade-up">
        <h3 className="text-lg font-semibold text-slate-100">Configurar limitador</h3>
        <p className="mt-1 text-sm text-slate-400">
          {device.name} - <span className="font-mono">{device.ip}</span>
        </p>

        <div className="mt-4">
          <label htmlFor="limit-speed" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
            Velocidad maxima (Mbps)
          </label>
          <input
            id="limit-speed"
            type="range"
            min="1"
            max="100"
            step="1"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full accent-cyan-400"
          />
          <div className="mt-2 flex items-center justify-between">
            <input
              type="number"
              min="1"
              max="100"
              value={value}
              onChange={(event) => onChange(Number(event.target.value))}
              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            />
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
              {value} Mbps
            </span>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Perfiles rapidos</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
              >
                {preset} Mbps
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Aplicar limitador
          </button>
        </div>
      </div>
    </div>
  );
}

export default LimitModal;

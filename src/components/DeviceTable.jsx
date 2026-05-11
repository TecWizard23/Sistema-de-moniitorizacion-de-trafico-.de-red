function DeviceTable({
  devices,
  onBlock,
  onLimit,
  onClearLimit,
  filter,
  onFilterChange,
  sourceLabel = 'Inventario en vivo',
  emptyMessage = 'No hay dispositivos disponibles.',
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gray-900/70 shadow-xl animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-100">Dispositivos conectados</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            {sourceLabel}
          </span>
          <input
            type="text"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            placeholder="Buscar por IP o nombre"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-300">
            <tr>
              <th className="px-5 py-3 font-medium">Dirección IP</th>
              <th className="px-5 py-3 font-medium">Nombre del dispositivo</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Latencia</th>
              <th className="px-5 py-3 font-medium">Consumo</th>
              <th className="px-5 py-3 font-medium">Limite</th>
              <th className="px-5 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm text-slate-400" colSpan={7}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              devices.map((device) => {
                const blocked = device.status === 'Bloqueado';

                return (
                  <tr
                    key={device.ip}
                    className="border-t border-slate-800 text-slate-200 transition-colors hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4 font-mono text-cyan-300">{device.ip}</td>
                    <td className="px-5 py-4">{device.name}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          blocked
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{device.latency} ms</td>
                    <td className="px-5 py-4">
                      {typeof device.estimatedMbps === 'number' ? (
                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                          {device.estimatedMbps} Mbps
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">N/D</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {typeof device.limitMbps === 'number' ? (
                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
                          {device.limitMbps} Mbps
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Sin limite</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onBlock(device.ip)}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-rose-500 hover:shadow-danger"
                        >
                          {blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onLimit(device.ip)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-glow"
                        >
                          Limitar velocidad
                        </button>
                        {typeof device.limitMbps === 'number' ? (
                          <button
                            type="button"
                            onClick={() => onClearLimit(device.ip)}
                            className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-100 transition-all hover:-translate-y-0.5 hover:bg-slate-600"
                          >
                            Quitar limite
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeviceTable;
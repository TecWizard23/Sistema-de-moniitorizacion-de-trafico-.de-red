const alerts = [
  {
    id: 1,
    title: 'Intentos de acceso fallidos',
    detail: '8 eventos en 5 minutos desde 192.168.1.44',
    level: 'Alta',
  },
  {
    id: 2,
    title: 'Pico de uso detectado',
    detail: 'Tramo de 94 Mbps en el segmento de invitados',
    level: 'Media',
  },
  {
    id: 3,
    title: 'Nuevo dispositivo en red',
    detail: 'Smart Cam Patio solicitando concesion DHCP',
    level: 'Baja',
  },
];

const levelStyles = {
  Alta: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  Media: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  Baja: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
};

function AlertsPanel() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-gray-900/70 p-5 shadow-xl animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Alertas de seguridad</h2>
        <span className="flex items-center gap-2 text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-rose-400 animate-soft-pulse" />
          Supervisando
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{alert.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{alert.detail}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${levelStyles[alert.level]}`}>
                {alert.level}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AlertsPanel;

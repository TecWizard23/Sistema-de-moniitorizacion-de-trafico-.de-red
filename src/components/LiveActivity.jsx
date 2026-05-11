const activity = [
  { time: '12:40:08', event: 'Regla anti-burst aplicada a 192.168.1.15', tone: 'cyan' },
  { time: '12:39:45', event: 'Dispositivo Desktop IT volvió a estado Activo', tone: 'emerald' },
  { time: '12:39:03', event: 'Latencia media en enlace WAN: 22 ms', tone: 'blue' },
  { time: '12:38:21', event: 'Bloqueo manual ejecutado en 192.168.1.22', tone: 'rose' },
];

const toneDot = {
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-400',
  blue: 'bg-blue-400',
  rose: 'bg-rose-400',
};

function LiveActivity() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-gray-900/70 p-5 shadow-xl animate-fade-up">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Actividad en vivo</h2>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300">
          Flujo continuo
        </span>
      </div>

      <ul className="space-y-3">
        {activity.map((item) => (
          <li
            key={`${item.time}-${item.event}`}
            className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
          >
            <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${toneDot[item.tone]}`} />
            <div>
              <p className="text-xs text-slate-300">{item.event}</p>
              <p className="mt-1 text-[11px] font-mono text-slate-500">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default LiveActivity;

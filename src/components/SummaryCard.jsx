const accentStyles = {
  cyan: 'from-cyan-500/30 to-cyan-900/20 border-cyan-500/30 text-cyan-300',
  blue: 'from-blue-500/30 to-blue-900/20 border-blue-500/30 text-blue-300',
  red: 'from-rose-500/30 to-rose-900/20 border-rose-500/30 text-rose-300',
  emerald: 'from-emerald-500/30 to-emerald-900/20 border-emerald-500/30 text-emerald-300',
};

function SummaryCard({ label, value, accent = 'cyan', trend = '+0.0%', icon }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${accentStyles[accent]} animate-fade-up`}
    >
      <div className="absolute left-0 top-0 h-full w-20 -skew-x-12 bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="h-full w-6 animate-sweep bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      </div>

      <div className="relative flex items-start justify-between">
        <p className="text-sm text-slate-300">{label}</p>
        {icon ? <span className="text-current/90">{icon}</span> : null}
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-300">Variacion 24h: {trend}</p>
    </article>
  );
}

export default SummaryCard;
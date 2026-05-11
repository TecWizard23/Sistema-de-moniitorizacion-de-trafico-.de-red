const icons = {
  Panel: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 13h8V3H3v10Zm10 8h8v-6h-8v6Zm0-10h8V3h-8v8ZM3 21h8v-6H3v6Z" />
    </svg>
  ),
  Dispositivos: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  Tráfico: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 17h4l3-10 4 14 3-8h4" />
    </svg>
  ),
  Configuración: (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2 2 0 1 1-2.83 2.83l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.1 1.65V21a2 2 0 0 1-4 0v-.06a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-1.98.36l-.04.04a2 2 0 0 1-2.83-2.83l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H2.9a2 2 0 1 1 0-4h.06A1.8 1.8 0 0 0 4.6 8.8a1.8 1.8 0 0 0-.36-1.98l-.04-.04a2 2 0 1 1 2.83-2.83l.04.04a1.8 1.8 0 0 0 1.98.36h.02A1.8 1.8 0 0 0 10.2 2.7V2.6a2 2 0 0 1 4 0v.06a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 1.98-.36l.04-.04a2 2 0 1 1 2.83 2.83l-.04.04a1.8 1.8 0 0 0-.36 1.98v.02a1.8 1.8 0 0 0 1.65 1.1h.06a2 2 0 0 1 0 4h-.06a1.8 1.8 0 0 0-1.65 1.1V15Z" />
    </svg>
  ),
};

function Sidebar({ menuItems, activeSection, onSelect }) {
  return (
    <aside className="w-full border-b border-slate-800 bg-gray-900/95 px-4 py-5 lg:w-72 lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
      <div className="mb-7 flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-300 animate-soft-pulse">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h10M4 17h16" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">Control de Red</h2>
          <p className="text-[11px] text-slate-400">SOC interno - Nivel empresarial</p>
        </div>
      </div>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {menuItems.map((item) => {
          const isActive = activeSection === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
              className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200 shadow-glow'
                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span className={`${isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {icons[item]}
              </span>
              <span>{item}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
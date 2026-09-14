const FOOTER_LINKS = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Inicio', href: '#inicio' },
      { label: 'Rifas', href: '#rifas' },
      { label: '¿Cómo funciona?', href: '#como-funciona' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', href: '#' },
      { label: 'Política de privacidad', href: '#' },
      { label: 'Bases del sorteo', href: '#' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: 'soporte@rifaya.com', href: 'mailto:soporte@rifaya.com' },
      { label: 'Preguntas frecuentes', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white">
                R
              </span>
              <span className="text-xl font-bold text-white">RifaYa</span>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              La forma más fácil y transparente de ganar el producto que
              siempre quisiste.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} RifaYa. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}

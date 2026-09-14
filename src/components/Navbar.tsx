import { useState } from 'react'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Rifas', href: '#rifas' },
  { label: '¿Cómo funciona?', href: '#como-funciona' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white">
            R
          </span>
          <span className="text-xl font-bold text-slate-900">RifaYa</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-indigo-600"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/login"
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Iniciar sesión
          </Link>
        </div>

        <button
          className="flex items-center justify-center rounded-md p-2 text-slate-700 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Abrir menú"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-full bg-indigo-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

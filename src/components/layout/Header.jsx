import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Moon, Sun, Search, User, Menu, X } from 'lucide-react'
import { useApp } from '../../context/app-context'

const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/despensa', label: 'Despensa' },
  { href: '/recetas', label: 'Recetas' },
  { href: '/colecciones', label: 'Colecciones' },
  { href:'/sobre-nosotros', label: 'Sobre Nosotros'}
]

export default function Header() {
  const { isDark, toggleTheme } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={isDark ? '/imgs/logo-dark.png' : '/imgs/logo.png'}
            alt="HestIA"
            className="h-10 w-auto"
          />

          <span className="font-newsreader text-2xl font-bold text-primary italic">
            HestIA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map(({ href, label }) => {
            const active = location.pathname === href

            return (
              <Link
                key={href}
                to={href}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Link
            to="/recetas"
            className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Search size={20} />
          </Link>

          <Link
            to="/perfil"
            className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <User size={20} />
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-xl px-4 py-3 text-foreground hover:bg-accent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}

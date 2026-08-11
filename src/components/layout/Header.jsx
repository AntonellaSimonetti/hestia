import { useState } from "react";
import { Link, useLocation } from "react-router";

import { Moon, Sun, User, Menu, X } from "lucide-react";

import { useApp } from "../../context/app-context";

const navLinks = [
  {
    href: "/",
    label: "Inicio",
  },
  {
    href: "/despensa",
    label: "Despensa",
  },
  {
    href: "/recetas",
    label: "Recetas",
  },
  {
    href: "/colecciones",
    label: "Colecciones",
  },
  {
    href: "/sobre-nosotros",
    label: "Sobre Nosotros",
  },
];

export default function Header() {
  const { isDark, toggleTheme } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={isDark ? "/imgs/logo-dark.png" : "/imgs/logo.png"}
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
            const active = location.pathname === href;

            return (
              <Link
                key={href}
                to={href}
                className={`
                    px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  `}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              text-muted-foreground
              hover:bg-accent
              hover:text-foreground
              transition-colors
            "
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* PERFIL - VISIBLE EN MOBILE Y DESKTOP */}
          <Link
            to="/perfil"
            aria-label="Perfil"
            title="Perfil"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              text-muted-foreground
              hover:bg-accent
              hover:text-foreground
              transition-colors
            "
          >
            <User size={20} />
          </Link>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="
              flex md:hidden
              h-10 w-10
              items-center justify-center
              rounded-xl
              text-muted-foreground
              hover:bg-accent
              hover:text-foreground
              transition-colors
            "
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="p-4 space-y-2">
            {navLinks.map(({ href, label }) => {
              const active = location.pathname === href;

              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-4 py-3 transition-colors ${
                    active
                      ? "bg-(--hestia-accent) text-white"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

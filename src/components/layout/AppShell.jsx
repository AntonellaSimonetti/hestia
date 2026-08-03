import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import {
  Home,
  ShoppingBasket,
  UtensilsCrossed,
  BookOpen,
  User,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  X,
  LogOut,
} from "lucide-react";

import { useApp } from "../../context/app-context";

const navItems = [
  {
    href: "/",
    label: "Inicio",
    icon: Home,
  },
  {
    href: "/despensa",
    label: "Despensa",
    icon: ShoppingBasket,
  },
  {
    href: "/recetas",
    label: "Recetas",
    icon: UtensilsCrossed,
  },
  {
    href: "/colecciones",
    label: "Colecciones",
    icon: BookOpen,
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: User,
  },
];

export default function AppShell({ children }) {
  const { isDark, toggleTheme } = useApp();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  function handleLogout() {
    localStorage.removeItem("hestia_token");
    localStorage.removeItem("hestia_user");

    setMobileOpen(false);

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col sticky top-0 h-screen z-30
          bg-(--hestia-sidebar) border-r border-(--hestia-border)
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-18" : "w-55"}
        `}
      >
        <div
          className={`flex items-center gap-3 px-4 py-5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <img
            src={isDark ? "/imgs/logo-dark.png" : "/imgs/logo.png"}
            alt="HestIA logo"
            className="w-10 h-10 shrink-0"
          />

          {!collapsed && (
            <span className="font-serif text-xl font-bold text-(--hestia-accent)">
              HestIA
            </span>
          )}
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium
                  transition-all duration-200 group relative
                  ${
                    isActive(href)
                      ? "bg-(--hestia-accent) text-white shadow-sm"
                      : "text-(--hestia-text) hover:bg-(--hestia-chip-bg) hover:text-(--hestia-accent)"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
            >
              <Icon size={20} />

              {!collapsed && <span>{label}</span>}

              {collapsed && (
                <span
                  className="
                      absolute left-full ml-2 px-2 py-1 rounded-lg text-xs
                      bg-(--hestia-card)
                      border border-(--hestia-border)
                      opacity-0 group-hover:opacity-100
                      whitespace-nowrap
                      pointer-events-none
                      transition-opacity
                    "
                >
                  {label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div
          className={`p-3 border-t border-(--hestia-border) flex ${
            collapsed ? "flex-col items-center gap-2" : "items-center gap-2"
          }`}
        >
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            title="Cambiar tema"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-(--hestia-muted) hover:bg-(--hestia-chip-bg) hover:text-(--hestia-accent) transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className={`flex h-9 items-center justify-center gap-2 rounded-lg text-(--hestia-muted) hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors ${
              collapsed ? "w-9" : "flex-1 px-3"
            }`}
          >
            <LogOut size={18} />

            {!collapsed && <span className="text-sm font-medium"></span>}
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            title={collapsed ? "Expandir menú" : "Contraer menú"}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-(--hestia-muted) hover:bg-(--hestia-chip-bg) hover:text-(--hestia-accent) transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 md:hidden
          bg-(--hestia-sidebar)
          border-r border-(--hestia-border)
          transition-transform duration-300
          flex flex-col
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-3">
            <img
              src={isDark ? "/imgs/logo-dark.png" : "/imgs/logo.png"}
              alt="HestIA logo"
              className="w-9 h-9"
            />

            <span className="font-serif text-xl font-bold text-(--hestia-accent)">
              HestIA
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-(--hestia-muted) hover:bg-(--hestia-chip-bg) transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={`
                  flex items-center gap-3 rounded-xl px-3 py-2.5
                  ${
                    isActive(href)
                      ? "bg-(--hestia-accent) text-white"
                      : "text-(--hestia-text) hover:bg-(--hestia-chip-bg)"
                  }
                `}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile actions */}
        <div className="border-t border-(--hestia-border) p-3 space-y-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-(--hestia-text) hover:bg-(--hestia-chip-bg) transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}

            <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}

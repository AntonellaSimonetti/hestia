import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import {
  Search,
  Plus,
  X,
  ShoppingBasket,
  AlertTriangle,
  Trash2,
  Minus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ChefHat,
  SlidersHorizontal,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CATEGORIES = [
  "Verduras",
  "Carnes",
  "Lácteos",
  "Secos",
  "Condimentos",
  "Frutas",
  "Bebidas",
];

const UNITS = [
  "unidades",
  "g",
  "kg",
  "ml",
  "litro",
  "taza",
  "frasco",
  "botella",
  "cabeza",
  "paquete",
];

const CATEGORY_ICONS = {
  Verduras: "🥦",
  Carnes: "🥩",
  Lácteos: "🥛",
  Secos: "🌾",
  Condimentos: "🧂",
  Frutas: "🍎",
  Bebidas: "🧃",
};

const CATEGORY_EMOJIS = {
  Verduras: ["🥬", "🥦", "🥕", "🍅", "🥔", "🧅", "🧄", "🌶️"],
  Carnes: ["🥩", "🍗", "🥓", "🐟", "🍤", "🥚"],
  Lácteos: ["🥛", "🧀", "🧈", "🥚"],
  Secos: ["🌾", "🍚", "🍝", "🍞", "🥖", "🫘", "🥜"],
  Condimentos: ["🧂", "🫙", "🍯", "🌶️", "🧄"],
  Frutas: ["🍎", "🍌", "🍊", "🍋", "🍓", "🍇", "🍐", "🍑"],
  Bebidas: ["💧", "🧃", "🥤", "☕", "🥛"],
};

const STATUS_LABEL = {
  fresh: "Fresco",
  expiring: "Por vencer",
  expired: "Vencido",
};

const STATUS_STYLE = {
  fresh: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",

  expiring:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",

  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function calculateExpirationDate(days) {
  const expirationDate = new Date();

  expirationDate.setDate(expirationDate.getDate() + Number(days));

  return expirationDate.toISOString();
}

function calculateExpiresIn(expirationDate) {
  if (!expirationDate) {
    return undefined;
  }

  const today = new Date();
  const expiration = new Date(expirationDate);

  today.setHours(0, 0, 0, 0);
  expiration.setHours(0, 0, 0, 0);

  const difference = expiration.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function normalizePantryItem(item) {
  return {
    ...item,
    id: item._id,
    name: item.displayName || item.name,
    expiresIn: calculateExpiresIn(item.expirationDate),
  };
}

function AddIngredientForm({ onClose, onAdd, saving }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Verduras");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unidades");
  const [expiresIn, setExpiresIn] = useState(7);
  const [icon, setIcon] = useState("🥬");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    const status =
      expiresIn < 0 ? "expired" : expiresIn <= 3 ? "expiring" : "fresh";

    const created = await onAdd({
      name: name.trim(),
      category,
      quantity,
      unit,
      status,
      icon,
      expirationDate: calculateExpirationDate(expiresIn),
    });

    if (created) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
            Agregar ingrediente
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors"
          >
            <X size={18} className="text-(--hestia-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--hestia-muted)">Nombre *</label>

            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Tomate cherry"
              required
              disabled={saving}
              className="w-full px-3 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors"
            />
          </div>

          {/* Categoría */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-(--hestia-muted)">Categoría</label>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((currentCategory) => (
                <button
                  key={currentCategory}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setCategory(currentCategory);
                    setIcon(CATEGORY_EMOJIS[currentCategory][0]);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    category === currentCategory
                      ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                      : "border-(--hestia-border) text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
                  }`}
                >
                  {CATEGORY_ICONS[currentCategory]}
                  {currentCategory}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de icono */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-(--hestia-muted)">Icono</label>

              <span className="text-xs text-(--hestia-muted)">
                Seleccionado: <span className="text-base">{icon}</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {CATEGORY_EMOJIS[category].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  disabled={saving}
                  onClick={() => setIcon(emoji)}
                  aria-label={`Seleccionar icono ${emoji}`}
                  className={`
            flex h-9 w-9 items-center justify-center
            rounded-xl border text-lg transition-all
            ${
              icon === emoji
                ? "border-(--hestia-accent) bg-(--hestia-chip-bg) scale-105"
                : "border-(--hestia-border) bg-transparent hover:border-(--hestia-accent) hover:bg-(--hestia-chip-bg)"
            }
          `}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad y unidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--hestia-muted)">Cantidad</label>

              <input
                type="number"
                min={0.1}
                step={0.1}
                value={quantity}
                disabled={saving}
                onChange={(event) =>
                  setQuantity(Number(event.target.value) || 1)
                }
                className="w-full px-3 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) outline-none focus:border-(--hestia-accent) transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-(--hestia-muted)">Unidad</label>

              <select
                value={unit}
                disabled={saving}
                onChange={(event) => setUnit(event.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) outline-none focus:border-(--hestia-accent) transition-colors"
              >
                {UNITS.map((currentUnit) => (
                  <option key={currentUnit} value={currentUnit}>
                    {currentUnit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vencimiento */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-(--hestia-muted)">
              Vence en (días, -1 = vencido)
            </label>

            <input
              type="number"
              min={-1}
              value={expiresIn}
              disabled={saving}
              onChange={(event) => setExpiresIn(Number(event.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) outline-none focus:border-(--hestia-accent) transition-colors"
            />
          </div>

          {/* Acciones */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl border border-(--hestia-border) text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) transition-all disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="flex-1 py-2.5 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold disabled:opacity-50 transition-all hover:opacity-90"
            >
              {saving ? "Agregando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PantryRow({ item, onUpdate, onRemove, busyId }) {
  const [expanded, setExpanded] = useState(false);

  const busy = busyId === item.id;

  async function adjust(delta) {
    const nextQuantity = Math.max(0, Number(item.quantity) + delta);

    await onUpdate(item.id, {
      quantity: nextQuantity,
    });
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-(--hestia-border) bg-(--hestia-card) transition-all ${
        item.status === "expired" ? "opacity-70" : ""
      }`}
    >
      {/* ================= MOBILE ================= */}
      <div className="sm:hidden px-3.5 py-3.5">
        {/* Fila superior */}
        <div className="flex items-start gap-3">
          <span className="w-8 shrink-0 text-center text-xl">{item.icon}</span>

          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm font-semibold leading-tight ${
                item.status === "expired"
                  ? "line-through text-(--hestia-muted)"
                  : "text-(--hestia-text)"
              }`}
            >
              {item.name}
            </p>

            <p className="mt-0.5 text-xs text-(--hestia-text)/65">
              {item.category}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              STATUS_STYLE[item.status]
            }`}
          >
            {STATUS_LABEL[item.status]}
          </span>
        </div>

        {/* Separador */}
        <div className="my-3 h-px bg-(--hestia-border)" />

        {/* Fila inferior */}
        <div className="flex items-center justify-between gap-3">
          {/* Cantidad */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={busy}
              aria-label="Reducir cantidad"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--hestia-border) bg-(--hestia-bg)/35 text-(--hestia-text)/70 transition-colors hover:bg-(--hestia-chip-bg) disabled:opacity-50"
            >
              <Minus size={11} />
            </button>

            <span className="min-w-18 text-center text-sm font-semibold text-(--hestia-text)">
              {item.quantity} {item.unit}
            </span>

            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={busy}
              aria-label="Aumentar cantidad"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-(--hestia-border) bg-(--hestia-bg)/35 text-(--hestia-text)/70 transition-colors hover:bg-(--hestia-chip-bg) disabled:opacity-50"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-label="Ver detalles"
              title="Ver detalles"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--hestia-text)/60 transition-colors hover:bg-(--hestia-chip-bg) hover:text-(--hestia-accent)"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              type="button"
              onClick={() => onRemove(item.id)}
              disabled={busy}
              aria-label="Eliminar ingrediente"
              title="Eliminar ingrediente"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--hestia-text)/55 transition-colors hover:bg-red-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-3">
        {/* Icono */}
        <span className="w-7 shrink-0 text-center text-xl">{item.icon}</span>

        {/* Nombre y categoría */}
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              item.status === "expired"
                ? "line-through text-(--hestia-muted)"
                : "text-(--hestia-text)"
            }`}
          >
            {item.name}
          </p>

          <p className="text-xs text-(--hestia-muted)">{item.category}</p>
        </div>

        {/* Cantidad */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => adjust(-1)}
            disabled={busy}
            aria-label="Reducir cantidad"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-(--hestia-border) text-(--hestia-muted) transition-colors hover:bg-(--hestia-chip-bg) disabled:opacity-50"
          >
            <Minus size={11} />
          </button>

          <span className="min-w-20 text-center text-sm font-medium text-(--hestia-text)">
            {item.quantity} {item.unit}
          </span>

          <button
            type="button"
            onClick={() => adjust(1)}
            disabled={busy}
            aria-label="Aumentar cantidad"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-(--hestia-border) text-(--hestia-muted) transition-colors hover:bg-(--hestia-chip-bg) disabled:opacity-50"
          >
            <Plus size={11} />
          </button>
        </div>

        {/* Estado */}
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLE[item.status]
          }`}
        >
          {STATUS_LABEL[item.status]}
        </span>

        {/* Expandir */}
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-label="Ver detalles"
          title="Ver detalles"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--hestia-muted) transition-colors hover:bg-(--hestia-chip-bg)"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Eliminar */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={busy}
          aria-label="Eliminar ingrediente"
          title="Eliminar ingrediente"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-(--hestia-muted) transition-colors hover:bg-red-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Detalle desplegable */}
      {expanded && (
        <div className="border-t border-(--hestia-border) px-4 py-2.5 text-xs text-(--hestia-text)/70 sm:text-(--hestia-muted)">
          {item.expiresIn < 0
            ? "Ya vencido"
            : item.expiresIn === 0
              ? "Vence hoy"
              : `Vence en ${item.expiresIn} día${
                  item.expiresIn !== 1 ? "s" : ""
                }`}
        </div>
      )}
    </article>
  );
}

export default function DespensaPage() {
  const navigate = useNavigate();

  const [pantryItems, setPantryItems] = useState([]);

  const [query, setQuery] = useState("");

  const [activeCategory, setActiveCategory] = useState("Todos");

  const [showCategoryFilters, setShowCategoryFilters] = useState(false);

  const [showAdd, setShowAdd] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInstructions, setAiInstructions] = useState("");
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [savingGeneratedRecipe, setSavingGeneratedRecipe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function getToken() {
    return localStorage.getItem("hestia_token");
  }

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      navigate("/login");

      throw new Error("Debes iniciar sesión para acceder a tu despensa.");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type");

    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : {};

    if (response.status === 401) {
      localStorage.removeItem("hestia_token");

      localStorage.removeItem("hestia_user");

      navigate("/login");

      throw new Error("Tu sesión expiró. Iniciá sesión nuevamente.");
    }

    if (!response.ok) {
      throw new Error(data.message || "No se pudo completar la solicitud.");
    }

    return data;
  }

  useEffect(() => {
    async function loadPantry() {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/api/pantry");

        setPantryItems((data.items || []).map(normalizePantryItem));
      } catch (requestError) {
        setError(requestError.message || "No se pudo cargar la despensa.");
      } finally {
        setLoading(false);
      }
    }

    loadPantry();
  }, []);

  async function addPantryItem(itemData) {
    try {
      setSaving(true);
      setError("");

      const data = await apiRequest("/api/pantry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      const newItem = normalizePantryItem(data.item);

      setPantryItems((currentItems) => [newItem, ...currentItems]);

      return true;
    } catch (requestError) {
      setError(requestError.message || "No se pudo agregar el ingrediente.");

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function updatePantryItem(itemId, updates) {
    try {
      setBusyId(itemId);
      setError("");

      const data = await apiRequest(`/api/pantry/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const updatedItem = normalizePantryItem(data.item);

      setPantryItems((currentItems) =>
        currentItems.map((item) => (item.id === itemId ? updatedItem : item)),
      );

      return true;
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar el ingrediente.");

      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function removePantryItem(itemId) {
    try {
      setBusyId(itemId);
      setError("");

      await apiRequest(`/api/pantry/${itemId}`, {
        method: "DELETE",
      });

      setPantryItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId),
      );
    } catch (requestError) {
      setError(requestError.message || "No se pudo eliminar el ingrediente.");
    } finally {
      setBusyId(null);
    }
  }

  function searchRecipesFromPantry() {
    navigate("/recetas", {
      state: {
        fromPantry: true,
      },
    });
  }

  async function generateAiRecipe() {
    try {
      setGeneratingRecipe(true);
      setError("");
      setSuccessMessage("");

      const data = await apiRequest("/api/ai/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extraIngredients: [],
          instructions: aiInstructions.trim(),
        }),
      });

      setGeneratedRecipe(data.recipe);
      setShowAiModal(false);
      setAiInstructions("");
    } catch (requestError) {
      setError(requestError.message || "No se pudo generar la receta.");
    } finally {
      setGeneratingRecipe(false);
    }
  }

  async function saveGeneratedRecipe() {
    if (!generatedRecipe) {
      return;
    }

    try {
      setSavingGeneratedRecipe(true);
      setError("");
      setSuccessMessage("");

      const data = await apiRequest("/api/ai/recipes/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipe: generatedRecipe,
        }),
      });

      setSuccessMessage(
        data.message || "Receta generada guardada correctamente.",
      );
    } catch (requestError) {
      setError(requestError.message || "No se pudo guardar la receta.");
    } finally {
      setSavingGeneratedRecipe(false);
    }
  }

  const filtered = useMemo(() => {
    let items = [...pantryItems];

    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();

      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(normalizedQuery) ||
          item.category.toLowerCase().includes(normalizedQuery),
      );
    }

    if (activeCategory !== "Todos") {
      items = items.filter((item) => item.category === activeCategory);
    }

    if (statusFilter === "expiring") {
      items = items.filter((item) => item.status === "expiring");
    }

    if (statusFilter === "expired") {
      items = items.filter((item) => item.status === "expired");
    }

    return items;
  }, [pantryItems, query, activeCategory, statusFilter]);

  const categoryCounts = useMemo(() => {
    const counts = {};

    pantryItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return counts;
  }, [pantryItems]);

  const expiringCount = pantryItems.filter(
    (item) => item.status === "expiring",
  ).length;

  const expiredCount = pantryItems.filter(
    (item) => item.status === "expired",
  ).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <p className="text-center text-(--hestia-muted)">
          Cargando despensa...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
            Mi Despensa
          </h1>

          <p className="text-(--hestia-muted)">
            {pantryItems.length} ingrediente
            {pantryItems.length !== 1 ? "s" : ""} en total
          </p>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:flex-wrap sm:justify-end gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={searchRecipesFromPantry}
            disabled={pantryItems.length === 0}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-(--hestia-accent) text-(--hestia-accent) text-sm font-semibold hover:bg-(--hestia-chip-bg) transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChefHat size={16} />
            <span className="text-xs sm:text-sm">Buscar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            disabled={pantryItems.length === 0}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span className="text-xs sm:text-sm">Generar IA</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-(--hestia-accent) text-(--hestia-accent) text-sm font-semibold hover:bg-(--hestia-chip-bg) transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            <span className="text-xs sm:text-sm">Agregar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
          {successMessage}
        </div>
      )}

      {generatedRecipe && (
        <section className="rounded-2xl border border-(--hestia-accent)/30 bg-(--hestia-card) p-4 sm:p-5 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-(--hestia-accent)">
                <Sparkles size={14} />
                Receta generada
              </div>

              <h2 className="mt-2 font-serif text-xl sm:text-2xl font-bold text-(--hestia-text)">
                {generatedRecipe.title}
              </h2>

              <p className="mt-1 text-sm text-(--hestia-muted)">
                {generatedRecipe.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setGeneratedRecipe(null);
                setSuccessMessage("");
              }}
              className="p-2 rounded-lg text-(--hestia-muted) hover:bg-(--hestia-chip-bg)"
              aria-label="Cerrar receta generada"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-(--hestia-chip-bg) px-3 py-1 text-(--hestia-chip-text)">
              {generatedRecipe.time} min
            </span>
            <span className="rounded-full bg-(--hestia-chip-bg) px-3 py-1 text-(--hestia-chip-text)">
              {generatedRecipe.difficulty}
            </span>
            <span className="rounded-full bg-(--hestia-chip-bg) px-3 py-1 text-(--hestia-chip-text)">
              {generatedRecipe.servings} porciones
            </span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Ingredientes */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-(--hestia-text)">
                Ingredientes
              </h3>

              <ul className="space-y-2">
                {(
                  generatedRecipe.ingredientDetails ||
                  generatedRecipe.ingredients ||
                  []
                ).map((ingredient, index) => {
                  const ingredientName =
                    typeof ingredient === "string"
                      ? ingredient
                      : ingredient.name;

                  const quantity =
                    typeof ingredient === "object" ? ingredient.quantity : "";

                  const available =
                    typeof ingredient === "object" &&
                    typeof ingredient.available === "boolean"
                      ? ingredient.available
                      : null;

                  return (
                    <li key={`${ingredientName}-${index}`} className="text-sm">
                      <span className="font-medium text-(--hestia-text)">
                        {ingredientName}
                      </span>

                      {quantity && (
                        <span className="text-(--hestia-text)/75">
                          {" "}
                          · {quantity}
                        </span>
                      )}

                      {available === true && (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {" "}
                          · Disponible
                        </span>
                      )}

                      {available === false && (
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          {" "}
                          · Falta comprar
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Preparación */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-(--hestia-text)">
                Preparación
              </h3>

              <ol className="space-y-3 text-sm">
                {(generatedRecipe.steps || []).map((step, index) => (
                  <li
                    key={`${index}-${step}`}
                    className="flex gap-2 leading-relaxed text-(--hestia-text)"
                  >
                    <span className="font-bold text-(--hestia-accent) shrink-0">
                      {index + 1}.
                    </span>

                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={saveGeneratedRecipe}
              disabled={savingGeneratedRecipe}
              className="w-full sm:w-auto rounded-xl bg-(--hestia-accent) px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {savingGeneratedRecipe ? "Guardando..." : "Guardar receta"}
            </button>

            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="w-full sm:w-auto rounded-xl border border-(--hestia-border) px-4 py-2.5 text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
            >
              Generar otra
            </button>
          </div>
        </section>
      )}

      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {expiringCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "expiring" ? "all" : "expiring",
                )
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                statusFilter === "expiring"
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400"
              }`}
            >
              <AlertTriangle size={14} />
              {expiringCount} por vencer
            </button>
          )}

          {expiredCount > 0 && (
            <button
              type="button"
              onClick={() =>
                setStatusFilter((current) =>
                  current === "expired" ? "all" : "expired",
                )
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                statusFilter === "expired"
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400"
              }`}
            >
              <X size={14} />
              {expiredCount} vencido
              {expiredCount !== 1 ? "s" : ""}
            </button>
          )}

          {statusFilter !== "all" && (
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className="px-3 py-2 rounded-xl text-sm text-(--hestia-muted) hover:text-(--hestia-accent) transition-colors"
            >
              Ver todos
            </button>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {/* Buscar ingrediente */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar ingrediente..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
                aria-label="Limpiar búsqueda"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros */}
          <button
            type="button"
            onClick={() => setShowCategoryFilters((current) => !current)}
            className={`shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showCategoryFilters || activeCategory !== "Todos"
                ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                : "bg-(--hestia-input) border-(--hestia-border) text-(--hestia-text)"
            }`}
          >
            <SlidersHorizontal size={16} />

            <span>Filtros</span>

            {activeCategory !== "Todos" && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs">
                1
              </span>
            )}
          </button>
        </div>

        {showCategoryFilters && (
          <div className="rounded-2xl bg-(--hestia-card) border border-(--hestia-border) p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--hestia-text)/70">
                Categoría
              </p>

              {activeCategory !== "Todos" && (
                <button
                  type="button"
                  onClick={() => setActiveCategory("Todos")}
                  className="text-xs font-medium text-(--hestia-accent) hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {["Todos", ...CATEGORIES].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);

                    if (window.innerWidth < 640) {
                      setShowCategoryFilters(false);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    activeCategory === category
                      ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                      : "border-(--hestia-border) text-(--hestia-text)/75 hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
                  }`}
                >
                  {category !== "Todos" && CATEGORY_ICONS[category]}

                  {category}

                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                      activeCategory === category
                        ? "bg-white/20 text-white"
                        : "bg-(--hestia-chip-bg) text-(--hestia-chip-text)"
                    }`}
                  >
                    {category === "Todos"
                      ? pantryItems.length
                      : categoryCounts[category] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 sm:py-20 text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-(--hestia-card) border border-(--hestia-border) flex items-center justify-center">
            <ShoppingBasket size={28} className="text-(--hestia-muted)" />
          </div>

          <div>
            <p className="font-semibold text-(--hestia-text)">
              {query || activeCategory !== "Todos"
                ? "Sin resultados"
                : "Despensa vacía"}
            </p>

            <p className="text-sm text-(--hestia-muted) mt-1">
              {query || activeCategory !== "Todos"
                ? "Intenta con otros términos o categorías"
                : "Agrega tus ingredientes para descubrir recetas"}
            </p>
          </div>

          {query || activeCategory !== "Todos" ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCategory("Todos");
              }}
              className="px-4 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-medium"
            >
              Limpiar filtros
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-medium"
            >
              <Plus size={14} />
              Agregar primer ingrediente
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5 stagger">
          {filtered.map((item) => (
            <PantryRow
              key={item.id}
              item={item}
              busyId={busyId}
              onUpdate={updatePantryItem}
              onRemove={removePantryItem}
            />
          ))}
        </div>
      )}

      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              if (!generatingRecipe) {
                setShowAiModal(false);
              }
            }}
          />

          <div className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--hestia-chip-bg)">
                  <Sparkles size={19} className="text-(--hestia-accent)" />
                </div>

                <div>
                  <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
                    Generar receta
                  </h2>

                  <p className="text-xs text-(--hestia-muted)">
                    Usaremos los ingredientes de tu despensa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                disabled={generatingRecipe}
                className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X size={18} className="text-(--hestia-muted)" />
              </button>
            </div>

            <div className="rounded-2xl bg-(--hestia-bg) border border-(--hestia-border) p-4">
              <p className="text-xs font-semibold text-(--hestia-muted) uppercase tracking-wide">
                Ingredientes disponibles
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {pantryItems
                  .filter(
                    (item) =>
                      item.status !== "expired" && Number(item.quantity) > 0,
                  )
                  .slice(0, 12)
                  .map((item) => (
                    <span
                      key={item.id}
                      className="rounded-full bg-(--hestia-chip-bg) px-2.5 py-1 text-xs text-(--hestia-chip-text)"
                    >
                      {item.icon} {item.name}
                    </span>
                  ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="aiInstructions"
                className="text-xs text-(--hestia-muted)"
              >
                ¿Qué te gustaría cocinar? Opcional
              </label>

              <textarea
                id="aiInstructions"
                value={aiInstructions}
                onChange={(event) => setAiInstructions(event.target.value)}
                maxLength={500}
                rows={4}
                disabled={generatingRecipe}
                placeholder="Ej: Una cena rápida, sin horno y para dos personas..."
                className="w-full resize-none rounded-xl bg-(--hestia-input) border border-(--hestia-border) px-3 py-2.5 text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) disabled:opacity-60"
              />

              <p className="text-right text-xs text-(--hestia-muted)">
                {aiInstructions.length}/500
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                disabled={generatingRecipe}
                className="flex-1 py-2.5 rounded-xl border border-(--hestia-border) text-sm font-medium text-(--hestia-muted) hover:border-(--hestia-accent) transition-all disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={generateAiRecipe}
                disabled={generatingRecipe}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
              >
                <Sparkles size={15} />
                {generatingRecipe ? "Generando..." : "Generar receta"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <AddIngredientForm
          saving={saving}
          onAdd={addPantryItem}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

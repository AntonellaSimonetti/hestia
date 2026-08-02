import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  BookOpen,
  Plus,
  X,
  Heart,
  Clock,
  Trash2,
  ChevronRight,
  Search,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EMOJI_PRESETS = [
  "📗",
  "⭐",
  "🍜",
  "🥗",
  "🍰",
  "🌮",
  "🍝",
  "🥘",
  "🍲",
  "🫕",
  "🎯",
  "💡",
];

function normalizeRecipe(recipe) {
  return {
    ...recipe,
    id: recipe.id || recipe._id,
    image: recipe.image || "/imgs/logo.png",
    tags: recipe.tags || [],
  };
}

function normalizeCollection(collection) {
  return {
    ...collection,
    id: collection._id || collection.id,
    recipeIds: collection.recipeIds || [],
  };
}

function NewCollectionModal({ onClose, onCreate, saving }) {
  const [name, setName] = useState("");

  const [emoji, setEmoji] = useState("📗");

  const [description, setDescription] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    const created = await onCreate({
      name: name.trim(),
      emoji,
      description: description.trim(),
    });

    if (created) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-md bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
            Nueva colección
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors disabled:opacity-60"
          >
            <X size={18} className="text-(--hestia-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-(--hestia-muted)">Icono</label>

            <div className="flex flex-wrap gap-2">
              {EMOJI_PRESETS.map((currentEmoji) => (
                <button
                  key={currentEmoji}
                  type="button"
                  onClick={() => setEmoji(currentEmoji)}
                  disabled={saving}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all disabled:opacity-60 ${
                    emoji === currentEmoji
                      ? "border-(--hestia-accent) bg-(--hestia-chip-bg)"
                      : "border-(--hestia-border) hover:border-(--hestia-accent)"
                  }`}
                >
                  {currentEmoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-(--hestia-muted)">Nombre *</label>

            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Recetas de verano"
              required
              disabled={saving}
              className="w-full px-3 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors disabled:opacity-60"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-(--hestia-muted)">
              Descripción (opcional)
            </label>

            <input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Una breve descripción..."
              disabled={saving}
              className="w-full px-3 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors disabled:opacity-60"
            />
          </div>

          <div className="flex gap-3 pt-1">
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
              {saving ? "Creando..." : "Crear colección"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CollectionPanel({
  collectionId,
  collections,
  recipes,
  favoriteIds,
  busy,
  onClose,
  onAddRecipe,
  onRemoveRecipe,
  onToggleFavorite,
}) {
  const [search, setSearch] = useState("");

  const collection = collections.find((item) => item.id === collectionId);

  if (!collection) {
    return null;
  }

  const collectionRecipes = recipes.filter((recipe) =>
    collection.recipeIds.includes(recipe.id),
  );

  const otherRecipes = recipes.filter(
    (recipe) => !collection.recipeIds.includes(recipe.id),
  );

  const filteredOther = search.trim()
    ? otherRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : otherRecipes;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-xl bg-(--hestia-card) border border-(--hestia-border) rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-(--hestia-border) shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{collection.emoji}</span>

            <div>
              <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
                {collection.name}
              </h2>

              <p className="text-xs text-(--hestia-muted)">
                {collection.recipeIds.length} receta
                {collection.recipeIds.length !== 1 ? "s" : ""}
                {collection.description && ` · ${collection.description}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors"
          >
            <X size={18} className="text-(--hestia-muted)" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-6">
          {collectionRecipes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-(--hestia-muted) uppercase tracking-wider">
                En esta colección
              </h3>

              <div className="space-y-2">
                {collectionRecipes.map((recipe) => {
                  const saved = favoriteIds.includes(recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-(--hestia-bg) border border-(--hestia-border)"
                    >
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-(--hestia-text) truncate">
                          {recipe.title}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-(--hestia-muted)">
                          <Clock size={10} />

                          <span>{recipe.time} min</span>

                          <span>·</span>

                          <span>{recipe.difficulty}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          to={`/recetas/${recipe.id}`}
                          onClick={onClose}
                          className="p-1.5 rounded-lg hover:bg-(--hestia-chip-bg) transition-colors text-(--hestia-muted) hover:text-(--hestia-accent)"
                        >
                          <ChevronRight size={15} />
                        </Link>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onToggleFavorite(recipe.id)}
                          aria-label={
                            saved
                              ? "Quitar de favoritos"
                              : "Guardar en favoritos"
                          }
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-60 ${
                            saved
                              ? "text-(--hestia-accent)"
                              : "text-(--hestia-muted) hover:text-(--hestia-accent)"
                          }`}
                        >
                          <Heart
                            size={15}
                            fill={saved ? "currentColor" : "none"}
                          />
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            onRemoveRecipe(collection.id, recipe.id)
                          }
                          aria-label="Quitar de colección"
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-(--hestia-muted) hover:text-red-500 disabled:opacity-60"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-(--hestia-muted) uppercase tracking-wider">
              Agregar recetas
            </h3>

            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar recetas..."
                className="w-full pl-8 pr-4 py-2 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors"
              />
            </div>

            <div className="space-y-2">
              {filteredOther.map((recipe) => (
                <button
                  key={recipe.id}
                  type="button"
                  disabled={busy}
                  onClick={() => onAddRecipe(collection.id, recipe.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-(--hestia-border) hover:border-(--hestia-accent) hover:bg-(--hestia-chip-bg) transition-all text-left disabled:opacity-60"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-(--hestia-text) truncate">
                      {recipe.title}
                    </p>

                    <p className="text-xs text-(--hestia-muted)">
                      {recipe.time} min
                      {" · "}
                      {recipe.difficulty}
                    </p>
                  </div>

                  <Plus size={16} className="text-(--hestia-accent) shrink-0" />
                </button>
              ))}

              {filteredOther.length === 0 && (
                <p className="text-sm text-(--hestia-muted) text-center py-4">
                  {search
                    ? "Sin resultados"
                    : "Todas las recetas ya están en esta colección"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCard({ collection, recipes, onOpen, onDelete, deletingId }) {
  const collectionRecipes = recipes.filter((recipe) =>
    collection.recipeIds.includes(recipe.id),
  );

  const previewRecipe = collectionRecipes[0];
  const count = collection.recipeIds.length;
  const deleting = deletingId === collection.id;

  function handleDelete(event) {
    event.stopPropagation();
    onDelete(collection);
  }

  return (
    <article className="group relative w-full max-w-sm overflow-hidden rounded-3xl border border-(--hestia-border) bg-(--hestia-card) shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <button
        type="button"
        onClick={() => onOpen(collection.id)}
        className="block w-full text-left"
      >
        <div className="relative h-44 overflow-hidden bg-(--hestia-chip-bg)">
          {previewRecipe ? (
            <img
              src={previewRecipe.image || "/imgs/logo.png"}
              alt={previewRecipe.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl">{collection.emoji}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />

          <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm backdrop-blur-sm">
            {collection.emoji}
          </div>

          <div className="absolute right-4 top-4 flex min-w-8 items-center justify-center rounded-full bg-black/55 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {count}
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div>
            <h3 className="font-serif text-xl font-bold text-(--hestia-text) transition-colors group-hover:text-(--hestia-accent)">
              {collection.name}
            </h3>

            {collection.description ? (
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-(--hestia-muted)">
                {collection.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-(--hestia-muted)">
                Colección personal de recetas
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-(--hestia-border) pt-3">
            <span className="text-xs text-(--hestia-muted)">
              {count} receta{count !== 1 ? "s" : ""}
            </span>

            <span className="pr-10 text-xs font-semibold text-(--hestia-accent)">
              Ver colección
            </span>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Eliminar colección ${collection.name}`}
        title="Eliminar colección"
        className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-(--hestia-muted) transition-colors hover:bg-red-100 hover:text-red-500 disabled:opacity-50 dark:hover:bg-red-900/20"
      >
        <Trash2 size={15} />
      </button>
    </article>
  );
}

export default function ColeccionesPage() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);

  const [recipes, setRecipes] = useState([]);

  const [favoriteRecipes, setFavoriteRecipes] = useState([]);

  const [showNew, setShowNew] = useState(false);

  const [openCollection, setOpenCollection] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const favoriteIds = useMemo(
    () => favoriteRecipes.map((recipe) => recipe.id),
    [favoriteRecipes],
  );

  function getToken() {
    return localStorage.getItem("hestia_token");
  }

  async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    if (!token) {
      navigate("/login");

      throw new Error("Debes iniciar sesión para ver tus colecciones.");
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
    async function loadCollectionsPage() {
      try {
        setLoading(true);
        setError("");

        const [
          collectionsData,
          favoritesData,
          publicRecipesData,
          aiRecipesData,
        ] = await Promise.all([
          apiRequest("/api/collections"),
          apiRequest("/api/users/me/favorites"),
          apiRequest("/api/recipes"),
          apiRequest("/api/ai/recipes/saved"),
        ]);

        const normalizedCollections = (collectionsData.collections || []).map(
          normalizeCollection,
        );

        const publicRecipes = (
          Array.isArray(publicRecipesData)
            ? publicRecipesData
            : publicRecipesData.recipes || []
        ).map(normalizeRecipe);

        const aiRecipes = (aiRecipesData.recipes || []).map(normalizeRecipe);

        const allRecipes = [...publicRecipes, ...aiRecipes];

        const uniqueRecipes = Array.from(
          new Map(allRecipes.map((recipe) => [recipe.id, recipe])).values(),
        );

        setCollections(normalizedCollections);

        setRecipes(uniqueRecipes);

        setFavoriteRecipes((favoritesData.recipes || []).map(normalizeRecipe));
      } catch (requestError) {
        setError(
          requestError.message || "No se pudieron cargar las colecciones.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollectionsPage();
  }, []);

  async function createCollection(collectionData) {
    try {
      setSaving(true);
      setError("");

      const data = await apiRequest("/api/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectionData),
      });

      const newCollection = normalizeCollection(data.collection);

      setCollections((currentCollections) => [
        newCollection,
        ...currentCollections,
      ]);

      return true;
    } catch (requestError) {
      setError(requestError.message || "No se pudo crear la colección.");

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function addRecipeToCollection(collectionId, recipeId) {
    try {
      setBusy(true);
      setError("");

      const data = await apiRequest(
        `/api/collections/${collectionId}/recipes/${recipeId}`,
        {
          method: "POST",
        },
      );

      const updatedCollection = normalizeCollection(data.collection);

      setCollections((currentCollections) =>
        currentCollections.map((collection) =>
          collection.id === collectionId ? updatedCollection : collection,
        ),
      );
    } catch (requestError) {
      setError(requestError.message || "No se pudo agregar la receta.");
    } finally {
      setBusy(false);
    }
  }

  async function removeRecipeFromCollection(collectionId, recipeId) {
    try {
      setBusy(true);
      setError("");

      const data = await apiRequest(
        `/api/collections/${collectionId}/recipes/${recipeId}`,
        {
          method: "DELETE",
        },
      );

      const updatedCollection = normalizeCollection(data.collection);

      setCollections((currentCollections) =>
        currentCollections.map((collection) =>
          collection.id === collectionId ? updatedCollection : collection,
        ),
      );
    } catch (requestError) {
      setError(requestError.message || "No se pudo quitar la receta.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleFavorite(recipeId) {
    const saved = favoriteIds.includes(recipeId);

    try {
      setBusy(true);
      setError("");

      await apiRequest(`/api/users/me/favorites/${recipeId}`, {
        method: saved ? "DELETE" : "POST",
      });

      if (saved) {
        setFavoriteRecipes((currentFavorites) =>
          currentFavorites.filter((recipe) => recipe.id !== recipeId),
        );
      } else {
        const recipe = recipes.find((item) => item.id === recipeId);

        if (recipe) {
          setFavoriteRecipes((currentFavorites) => [
            ...currentFavorites,
            recipe,
          ]);
        }
      }
    } catch (requestError) {
      setError(requestError.message || "No se pudo actualizar favoritos.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteCollection(collection) {
    const confirmed = window.confirm(
      `¿Querés eliminar la colección "${collection.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(collection.id);
      setError("");

      await apiRequest(`/api/collections/${collection.id}`, {
        method: "DELETE",
      });

      setCollections((currentCollections) =>
        currentCollections.filter((item) => item.id !== collection.id),
      );

      if (openCollection === collection.id) {
        setOpenCollection(null);
      }
    } catch (requestError) {
      setError(requestError.message || "No se pudo eliminar la colección.");
    } finally {
      setDeletingId(null);
    }
  }

  const totalSaved = favoriteRecipes.length;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <p className="text-center text-(--hestia-muted)">
          Cargando colecciones...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
            Colecciones
          </h1>

          <p className="text-(--hestia-muted)">
            {collections.length} colección
            {collections.length !== 1 ? "es" : ""}
            {" · "}
            {totalSaved} receta
            {totalSaved !== 1 ? "s" : ""} guardada
            {totalSaved !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--hestia-accent) text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-all shrink-0"
        >
          <Plus size={16} />

          <span className="hidden sm:inline">Nueva colección</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {favoriteRecipes.length > 0 && (
        <div className="bg-(--hestia-card) border border-(--hestia-border) rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Heart
              size={18}
              className="text-(--hestia-accent)"
              fill="currentColor"
            />

            <h2 className="font-serif text-lg font-bold text-(--hestia-text)">
              Recetas guardadas
            </h2>

            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-(--hestia-chip-bg) text-(--hestia-chip-text)">
              {totalSaved}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {favoriteRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recetas/${recipe.id}`}
                className="group flex flex-col gap-2 rounded-xl overflow-hidden border border-(--hestia-border) hover:border-(--hestia-accent) transition-all bg-(--hestia-bg)"
              >
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-20 object-cover"
                />

                <p className="px-2 pb-2 text-xs font-medium text-(--hestia-text) group-hover:text-(--hestia-accent) line-clamp-2 transition-colors">
                  {recipe.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {collections.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-(--hestia-card) border border-(--hestia-border) flex items-center justify-center">
            <BookOpen size={28} className="text-(--hestia-muted)" />
          </div>

          <div>
            <p className="font-semibold text-(--hestia-text)">
              Sin colecciones aún
            </p>

            <p className="text-sm text-(--hestia-muted) mt-1">
              Crea tu primera colección para organizar tus recetas favoritas
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-medium"
          >
            <Plus size={14} />
            Crear colección
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-(--hestia-text)">
            Mis colecciones
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                recipes={recipes}
                onOpen={setOpenCollection}
                onDelete={deleteCollection}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      )}

      {showNew && (
        <NewCollectionModal
          saving={saving}
          onCreate={createCollection}
          onClose={() => setShowNew(false)}
        />
      )}

      {openCollection && (
        <CollectionPanel
          collectionId={openCollection}
          collections={collections}
          recipes={recipes}
          favoriteIds={favoriteIds}
          busy={busy}
          onClose={() => setOpenCollection(null)}
          onAddRecipe={addRecipeToCollection}
          onRemoveRecipe={removeRecipeFromCollection}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}

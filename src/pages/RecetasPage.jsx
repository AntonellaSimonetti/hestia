import { useEffect, useMemo, useState } from "react";

import { Search, SlidersHorizontal, X, ChefHat } from "lucide-react";

import RecipeCard from "../components/recipes/RecipeCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const FILTER_TAGS = [
  "Económico",
  "Saludable",
  "Rápido",
  "Pocos Ingredientes",
  "Vegetariano",
  "Sin Gluten",
  "Latinoamericana",
  "Italiana",
];

const SORT_OPTIONS = [
  {
    value: "match",
    label: "Mayor coincidencia",
  },
  {
    value: "time",
    label: "Más rápidas",
  },
  {
    value: "az",
    label: "A – Z",
  },
];

function normalizeIngredientName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateRecipeMatch(recipe, pantryItems) {
  const ingredientDetails = Array.isArray(recipe.ingredientDetails)
    ? recipe.ingredientDetails
    : [];

  const sourceIngredients =
    ingredientDetails.length > 0
      ? ingredientDetails
      : (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map(
          (name) => ({
            name,
            quantity: "",
          }),
        );

  const pantryNames = pantryItems
    .filter((item) => Number(item.quantity) > 0 && item.status !== "expired")
    .map((item) => normalizeIngredientName(item.displayName || item.name))
    .filter(Boolean);

  const comparedIngredients = sourceIngredients.map((ingredient) => {
    const rawName = ingredient?.name || ingredient;
    const ingredientName = normalizeIngredientName(rawName);

    const available = pantryNames.some(
      (pantryName) =>
        pantryName === ingredientName ||
        pantryName.includes(ingredientName) ||
        ingredientName.includes(pantryName),
    );

    return {
      ...(typeof ingredient === "object" && ingredient !== null
        ? ingredient
        : {
            name: String(ingredient || ""),
            quantity: "",
          }),
      name: rawName,
      available,
    };
  });

  const availableIngredients = comparedIngredients
    .filter((ingredient) => ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const missingIngredients = comparedIngredients
    .filter((ingredient) => !ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const matchPercent =
    comparedIngredients.length > 0
      ? Math.round(
          (availableIngredients.length / comparedIngredients.length) * 100,
        )
      : 0;

  return {
    ...recipe,
    ingredientDetails: comparedIngredients,
    availableIngredients,
    missingIngredients,
    matchPercent,
  };
}

function normalizeRecipe(recipe) {
  const ingredientDetails = Array.isArray(recipe.ingredientDetails)
    ? recipe.ingredientDetails
    : [];

  const availableFromDetails = ingredientDetails
    .filter((ingredient) => ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const missingFromDetails = ingredientDetails
    .filter((ingredient) => !ingredient.available)
    .map((ingredient) =>
      ingredient.quantity
        ? `${ingredient.name} — ${ingredient.quantity}`
        : ingredient.name,
    );

  const calculatedMatchPercent =
    ingredientDetails.length > 0
      ? Math.round(
          (availableFromDetails.length / ingredientDetails.length) * 100,
        )
      : 0;

  return {
    ...recipe,
    id: recipe.id || recipe._id,
    image: recipe.image || "/imgs/logo.png",
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    availableIngredients: Array.isArray(recipe.availableIngredients)
      ? recipe.availableIngredients
      : availableFromDetails,
    missingIngredients: Array.isArray(recipe.missingIngredients)
      ? recipe.missingIngredients
      : ingredientDetails.length > 0
        ? missingFromDetails
        : Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [],
    matchPercent:
      recipe.matchPercent === null
        ? null
        : typeof recipe.matchPercent === "number"
          ? recipe.matchPercent
          : calculatedMatchPercent,
  };
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return {};
  }

  return response.json();
}

export default function RecetasPage() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("match");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("hestia_token");

        const publicResponse = await fetch(`${API_URL}/api/recipes`);
        const publicData = await readJsonResponse(publicResponse);

        if (!publicResponse.ok) {
          throw new Error(
            publicData.message || "No se pudieron cargar las recetas.",
          );
        }

        const publicRecipes = Array.isArray(publicData)
          ? publicData
          : publicData.recipes || [];

        if (!token) {
          const recipesWithoutPersonalMatch = publicRecipes.map((recipe) =>
            normalizeRecipe({
              ...recipe,
              matchPercent: null,
              availableIngredients: [],
              missingIngredients: [],
            }),
          );

          setRecipes(recipesWithoutPersonalMatch);
          return;
        }

        const authHeaders = {
          Authorization: `Bearer ${token}`,
        };

        const [pantryResponse, pantryMatchResponse, aiResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/pantry`, {
              headers: authHeaders,
            }),
            fetch(`${API_URL}/api/recipes/from-pantry`, {
              headers: authHeaders,
            }),
            fetch(`${API_URL}/api/ai/recipes/saved`, {
              headers: authHeaders,
            }),
          ]);

        if (pantryResponse.status === 401) {
          localStorage.removeItem("hestia_token");
          localStorage.removeItem("hestia_user");
          setRecipes(publicRecipes.map(normalizeRecipe));
          return;
        }

        const pantryData = pantryResponse.ok
          ? await readJsonResponse(pantryResponse)
          : { items: [] };

        const pantryMatchData = pantryMatchResponse.ok
          ? await readJsonResponse(pantryMatchResponse)
          : { recipes: [] };

        const aiData = aiResponse.ok
          ? await readJsonResponse(aiResponse)
          : { recipes: [] };

        const pantryItems = Array.isArray(pantryData)
          ? pantryData
          : pantryData.items || [];

        const pantryRecipes = Array.isArray(pantryMatchData)
          ? pantryMatchData
          : pantryMatchData.recipes || [];

        const aiRecipes = Array.isArray(aiData) ? aiData : aiData.recipes || [];

        const pantryRecipeMap = new Map(
          pantryRecipes.map((recipe) => [recipe.id || recipe._id, recipe]),
        );

        const matchedPublicRecipes = publicRecipes.map((recipe) => {
          const recipeId = recipe.id || recipe._id;
          const matchedRecipe = pantryRecipeMap.get(recipeId);

          if (matchedRecipe) {
            return matchedRecipe;
          }

          return {
            ...recipe,
            matchPercent: 0,
            availableIngredients: [],
            missingIngredients: Array.isArray(recipe.ingredients)
              ? recipe.ingredients
              : [],
          };
        });

        const matchedAiRecipes = aiRecipes.map((recipe) =>
          calculateRecipeMatch(recipe, pantryItems),
        );

        const combinedRecipes = [...matchedPublicRecipes, ...matchedAiRecipes];

        const uniqueRecipes = Array.from(
          new Map(
            combinedRecipes.map((recipe) => [recipe.id || recipe._id, recipe]),
          ).values(),
        );

        setRecipes(uniqueRecipes.map(normalizeRecipe));
      } catch (requestError) {
        setError(requestError.message || "No se pudieron cargar las recetas.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, []);

  function toggleFilter(filter) {
    setActiveFilters((currentFilters) =>
      currentFilters.includes(filter)
        ? currentFilters.filter((item) => item !== filter)
        : [...currentFilters, filter],
    );
  }

  const filtered = useMemo(() => {
    let list = [...recipes];

    if (query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();

      list = list.filter((recipe) => {
        const title = String(recipe.title || "").toLowerCase();
        const description = String(recipe.description || "").toLowerCase();
        const tags = Array.isArray(recipe.tags) ? recipe.tags : [];
        const ingredients = Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : [];

        return (
          title.includes(normalizedQuery) ||
          description.includes(normalizedQuery) ||
          tags.some((tag) =>
            String(tag).toLowerCase().includes(normalizedQuery),
          ) ||
          ingredients.some((ingredient) =>
            String(ingredient).toLowerCase().includes(normalizedQuery),
          )
        );
      });
    }

    if (activeFilters.length > 0) {
      list = list.filter((recipe) =>
        activeFilters.some((filter) => recipe.tags.includes(filter)),
      );
    }

    if (sortBy === "match") {
      list.sort(
        (firstRecipe, secondRecipe) =>
          Number(secondRecipe.matchPercent || 0) -
          Number(firstRecipe.matchPercent || 0),
      );
    }

    if (sortBy === "time") {
      list.sort(
        (firstRecipe, secondRecipe) =>
          Number(firstRecipe.time || 0) - Number(secondRecipe.time || 0),
      );
    }

    if (sortBy === "az") {
      list.sort((firstRecipe, secondRecipe) =>
        String(firstRecipe.title || "").localeCompare(
          String(secondRecipe.title || ""),
          "es",
        ),
      );
    }

    return list;
  }, [recipes, query, activeFilters, sortBy]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <p className="text-center text-(--hestia-muted)">Cargando recetas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-(--hestia-text)">
          Recetas
        </h1>

        <p className="text-(--hestia-muted)">
          {filtered.length} receta
          {filtered.length !== 1 ? "s" : ""} disponible
          {filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
          />

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, categoría o ingrediente..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) placeholder:text-(--hestia-muted) outline-none focus:border-(--hestia-accent) transition-colors"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--hestia-muted)"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="px-3 py-2.5 rounded-xl bg-(--hestia-input) border border-(--hestia-border) text-sm text-(--hestia-text) outline-none focus:border-(--hestia-accent) transition-colors"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters || activeFilters.length > 0
                ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                : "bg-(--hestia-input) border-(--hestia-border) text-(--hestia-muted)"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filtros
            {activeFilters.length > 0 && (
              <span className="bg-white text-(--hestia-accent) rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-(--hestia-card) border border-(--hestia-border)">
          {FILTER_TAGS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => toggleFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeFilters.includes(filter)
                  ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                  : "border-(--hestia-border) text-(--hestia-muted) hover:border-(--hestia-accent) hover:text-(--hestia-accent)"
              }`}
            >
              {filter}
            </button>
          ))}

          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveFilters([])}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-(--hestia-accent) hover:bg-(--hestia-chip-bg) transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-(--hestia-card) border border-(--hestia-border) flex items-center justify-center">
            <ChefHat size={28} className="text-(--hestia-muted)" />
          </div>

          <div>
            <p className="font-semibold text-(--hestia-text)">
              No encontramos recetas
            </p>

            <p className="text-sm text-(--hestia-muted) mt-1">
              Intenta con otros términos o elimina los filtros activos
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveFilters([]);
            }}
            className="px-4 py-2 rounded-xl bg-(--hestia-accent) text-white text-sm font-medium"
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

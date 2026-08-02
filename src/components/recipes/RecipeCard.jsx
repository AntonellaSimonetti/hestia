import { useEffect, useState } from "react";
import { Heart, Clock, ChefHat, Users } from "lucide-react";
import { Link, useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const token = localStorage.getItem("hestia_token");

  useEffect(() => {
    async function checkFavorite() {
      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/me/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");

        const data =
          contentType && contentType.includes("application/json")
            ? await response.json()
            : {};

        if (!response.ok) {
          return;
        }

        const isFavorite =
          data.recipes?.some(
            (favoriteRecipe) => favoriteRecipe.id === recipe.id,
          ) || false;

        setSaved(isFavorite);
      } catch {
        setSaved(false);
      }
    }

    checkFavorite();
  }, [recipe.id, token]);

  async function toggleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoadingFavorite(true);

      const response = await fetch(
        `${API_URL}/api/users/me/favorites/${recipe.id}`,
        {
          method: saved ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const contentType = response.headers.get("content-type");

      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : {};

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar favoritos.");
      }

      setSaved((current) => !current);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFavorite(false);
    }
  }

  const availableIngredients = recipe.availableIngredients || [];

  const missingIngredients = recipe.missingIngredients || [];

  const tags = recipe.tags || [];

  const matchPercent =
    typeof recipe.matchPercent === "number" ? recipe.matchPercent : null;

  return (
    <article className="group bg-(--hestia-card) rounded-2xl overflow-hidden border border-(--hestia-border) card-hover flex flex-col">
      {/* Image */}
      <Link
        to={`/recetas/${recipe.id}`}
        className="block relative overflow-hidden h-48"
      >
        <img
          src={recipe.image || "/imgs/logo.png"}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Match badge */}
        {matchPercent !== null && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                matchPercent >= 85
                  ? "match-high"
                  : matchPercent >= 70
                    ? "match-medium"
                    : "match-low"
              }`}
            >
              {matchPercent}% match
            </span>
          </div>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={loadingFavorite}
          aria-label={saved ? "Quitar de favoritos" : "Guardar receta"}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
            backdrop-blur-sm border transition-all duration-200 disabled:opacity-60
            ${
              saved
                ? "bg-(--hestia-accent) border-(--hestia-accent) text-white"
                : "bg-black/20 border-white/30 text-white hover:bg-(--hestia-accent) hover:border-(--hestia-accent)"
            }`}
        >
          <Heart size={14} fill={saved ? "currentColor" : "none"} />
        </button>

        {/* Difficulty */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white text-xs">
            {recipe.difficulty}
          </span>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <Link to={`/recetas/${recipe.id}`}>
          <h3 className="font-serif text-lg font-bold text-(--hestia-text) leading-tight text-balance hover:text-(--hestia-accent) transition-colors line-clamp-2">
            {recipe.title}
          </h3>
        </Link>

        <p className="text-sm text-(--hestia-muted) line-clamp-2 leading-relaxed flex-1">
          {recipe.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-(--hestia-muted) pt-1 border-t border-(--hestia-border)">
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-(--hestia-accent)" />
            {recipe.time} min
          </span>

          <span className="flex items-center gap-1">
            <Users size={12} className="text-(--hestia-accent)" />
            {recipe.servings} porciones
          </span>

          <span className="flex items-center gap-1">
            <ChefHat size={12} className="text-(--hestia-accent)" />
            {recipe.isAiGenerated ? "IA" : "Receta"}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full text-xs bg-(--hestia-chip-bg) text-(--hestia-chip-text) font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Ingredients */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-(--hestia-muted)">
            <span className="font-semibold text-(--hestia-text)">
              {availableIngredients.length}
            </span>{" "}
            disponibles
          </span>

          {missingIngredients.length > 0 && (
            <span className="text-(--hestia-muted)">
              ·{" "}
              <span className="font-semibold text-(--hestia-accent)">
                {missingIngredients.length}
              </span>{" "}
              faltantes
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

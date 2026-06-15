import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  defaultPantryItems,
  defaultCollections,
  defaultProfile,
} from '../data/mock-data'

const AppContext = createContext(null)

function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore
  }
}

export function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  const [pantryItems, setPantryItems] = useState(defaultPantryItems)
  const [savedRecipeIds, setSavedRecipeIds] = useState(['r1', 'r5', 'r4'])
  const [collections, setCollections] = useState(defaultCollections)
  const [profile, setProfile] = useState(defaultProfile)
  const [generatedIngredients, setGeneratedIngredients] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const storedDark = loadFromStorage('hestia-dark', false)
    const storedPantry = loadFromStorage('hestia-pantry', defaultPantryItems)
    const storedSaved = loadFromStorage('hestia-saved', ['r1', 'r5', 'r4'])
    const storedCollections = loadFromStorage('hestia-collections', defaultCollections)
    const storedProfile = loadFromStorage('hestia-profile', defaultProfile)

    setIsDark(storedDark)
    setPantryItems(storedPantry)
    setSavedRecipeIds(storedSaved)
    setCollections(storedCollections)
    setProfile(storedProfile)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const html = document.documentElement
    if (isDark) html.classList.add('dark')
    else html.classList.remove('dark')
    saveToStorage('hestia-dark', isDark)
  }, [isDark, mounted])

  const toggleTheme = useCallback(() => setIsDark((d) => !d), [])

  const addPantryItem = useCallback((item) => {
    setPantryItems((prev) => {
      const next = [item, ...prev]
      saveToStorage('hestia-pantry', next)
      return next
    })
  }, [])

  const removePantryItem = useCallback((id) => {
    setPantryItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      saveToStorage('hestia-pantry', next)
      return next
    })
  }, [])

  const updatePantryItem = useCallback((id, updates) => {
    setPantryItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
      saveToStorage('hestia-pantry', next)
      return next
    })
  }, [])

  const toggleSaveRecipe = useCallback((id) => {
    setSavedRecipeIds((prev) => {
      const next = prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
      saveToStorage('hestia-saved', next)
      return next
    })
  }, [])

  const isSaved = useCallback((id) => savedRecipeIds.includes(id), [savedRecipeIds])

  const addRecipeToCollection = useCallback((collectionId, recipeId) => {
    setCollections((prev) => {
      const next = prev.map((c) =>
        c.id === collectionId && !c.recipeIds.includes(recipeId)
          ? { ...c, recipeIds: [...c.recipeIds, recipeId] }
          : c
      )
      saveToStorage('hestia-collections', next)
      return next
    })
  }, [])

  const removeRecipeFromCollection = useCallback((collectionId, recipeId) => {
    setCollections((prev) => {
      const next = prev.map((c) =>
        c.id === collectionId
          ? { ...c, recipeIds: c.recipeIds.filter((r) => r !== recipeId) }
          : c
      )
      saveToStorage('hestia-collections', next)
      return next
    })
  }, [])

  const createCollection = useCallback((name, emoji, description) => {
    setCollections((prev) => {
      const next = [
        ...prev,
        {
          id: `c-${Date.now()}`,
          name,
          emoji,
          description,
          recipeIds: [],
          color: '#8A2E16',
        },
      ]
      saveToStorage('hestia-collections', next)
      return next
    })
  }, [])

  const updateProfile = useCallback((updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates }
      saveToStorage('hestia-profile', next)
      return next
    })
  }, [])

  const toggleDietaryPref = useCallback((pref) => {
    setProfile((prev) => {
      const has = prev.dietaryPreferences.includes(pref)
      const next = {
        ...prev,
        dietaryPreferences: has
          ? prev.dietaryPreferences.filter((p) => p !== pref)
          : [...prev.dietaryPreferences, pref],
      }
      saveToStorage('hestia-profile', next)
      return next
    })
  }, [])

  const toggleCuisinePref = useCallback((pref) => {
    setProfile((prev) => {
      const has = prev.cuisinePreferences.includes(pref)
      const next = {
        ...prev,
        cuisinePreferences: has
          ? prev.cuisinePreferences.filter((p) => p !== pref)
          : [...prev.cuisinePreferences, pref],
      }
      saveToStorage('hestia-profile', next)
      return next
    })
  }, [])

  const addRecentlyViewed = useCallback((id) => {
    setProfile((prev) => {
      const filtered = prev.recentlyViewed.filter((r) => r !== id)
      const next = { ...prev, recentlyViewed: [id, ...filtered].slice(0, 8) }
      saveToStorage('hestia-profile', next)
      return next
    })
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8F5]">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="HestIA" className="w-16 h-16 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        pantryItems,
        addPantryItem,
        removePantryItem,
        updatePantryItem,
        savedRecipeIds,
        toggleSaveRecipe,
        isSaved,
        collections,
        addRecipeToCollection,
        removeRecipeFromCollection,
        createCollection,
        profile,
        updateProfile,
        toggleDietaryPref,
        toggleCuisinePref,
        addRecentlyViewed,
        generatedIngredients,
        setGeneratedIngredients,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

/* eslint-disable react-refresh/only-export-components */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
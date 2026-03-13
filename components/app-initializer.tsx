"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/use-auth-store"

/**
 * Componente client-side que hidrata a auth store
 * ao carregar a aplicação (restaura sessão do localStorage).
 * É renderizado no layout raiz para executar antes de qualquer página.
 */
export function AppInitializer() {
  const loadFromStorage = useAuthStore((state: { loadFromStorage: () => Promise<void> }) => state.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return null
}

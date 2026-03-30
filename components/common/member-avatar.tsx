"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface MemberAvatarProps {
  name: string
  photoUrl?: string | null
  size?: "xs" | "sm" | "md"
  className?: string
}

/**
 * Gera iniciais a partir de um nome completo (máx. 2 caracteres).
 * Ex: "João Silva" → "JS", "Ana" → "AN"
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Gera uma cor de fundo determinística e harmoniosamente baseada no nome.
 * Utiliza hash simples sobre a string para derivar um tom HSL.
 */
function getDeterministicColor(name: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }

  // Paleta de cores harmoniosas (marrom, dourado, terra) que combinam com o tema Monettra
  const palette: { bg: string; text: string }[] = [
    { bg: "#c4a35a22", text: "#8b6914" }, // dourado
    { bg: "#a63d2f22", text: "#a63d2f" }, // terracota
    { bg: "#5a7a5a22", text: "#3d5a3d" }, // verde sálvia
    { bg: "#8b691422", text: "#6b4f10" }, // âmbar escuro
    { bg: "#7a5a3a22", text: "#5a3e22" }, // marrom médio
    { bg: "#3b5a8b22", text: "#2a4060" }, // azul ardósia
    { bg: "#8b3a5a22", text: "#6b2a42" }, // vinho
    { bg: "#3a7a6522", text: "#2a5a4a" }, // jade
  ]

  const index = Math.abs(hash) % palette.length
  return palette[index]
}

const sizeClasses = {
  xs: "size-6 text-[10px]",
  sm: "size-7 text-xs",
  md: "size-8 text-xs",
}

export function MemberAvatar({ name, photoUrl, size = "sm", className }: MemberAvatarProps) {
  const initials = getInitials(name)
  const colors = getDeterministicColor(name)

  return (
    <Avatar className={cn(sizeClasses[size], "shrink-0", className)}>
      {photoUrl && (
        <AvatarImage src={photoUrl} alt={name} />
      )}
      <AvatarFallback
        style={{ backgroundColor: colors.bg, color: colors.text }}
        className="font-semibold border border-current/20"
        title={name}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

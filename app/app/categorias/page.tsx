"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Home,
  ShoppingCart,
  Car,
  Heart,
  Gamepad2,
  Briefcase,
  GraduationCap,
  Utensils,
  Zap,
  Wifi,
  Droplets,
  Phone,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCategoriesStore } from "@/stores/use-categories-store"
import type { Category, CreateCategoryPayload } from "@/lib/types"

// ─── Opções de ícones disponíveis ──────────────────────────
const iconOptions = [
  { name: "Home", icon: Home },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Car", icon: Car },
  { name: "Heart", icon: Heart },
  { name: "Gamepad2", icon: Gamepad2 },
  { name: "Briefcase", icon: Briefcase },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Utensils", icon: Utensils },
  { name: "Zap", icon: Zap },
  { name: "Wifi", icon: Wifi },
  { name: "Droplets", icon: Droplets },
  { name: "Phone", icon: Phone },
]

// ─── Paleta de cores do design system Monettra ─────────────
const colorOptions = [
  "#8b6914",
  "#c4a35a",
  "#a63d2f",
  "#5a7a5a",
  "#4a6a8a",
  "#7a6b5a",
  "#9b4dca",
  "#e67e22",
  "#2c3e50",
  "#16a085",
]

function getIconComponent(iconName: string) {
  const found = iconOptions.find((i) => i.name === iconName)
  return found ? found.icon : Home
}

export default function CategoriasPage() {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formName, setFormName] = useState("")
  const [formColor, setFormColor] = useState(colorOptions[0])
  const [formIcon, setFormIcon] = useState("Home")

  // ─── Inicialização ─────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ─── Reset do formulário ────────────────────────────────────
  function resetForm() {
    setFormName("")
    setFormColor(colorOptions[0])
    setFormIcon("Home")
    setEditingCategory(null)
  }

  function openNewDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(cat: Category) {
    setEditingCategory(cat)
    setFormName(cat.title)
    setFormColor(cat.color)
    setFormIcon(cat.icon_name)
    setDialogOpen(true)
  }

  // ─── Submit (criar ou editar) ───────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    const payload: CreateCategoryPayload = {
      title: formName,
      color: formColor,
      icon_name: formIcon,
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.code, payload)
        toast.success("Categoria atualizada com sucesso!")
      } else {
        await createCategory(payload)
        toast.success("Categoria criada com sucesso!")
      }
      setDialogOpen(false)
      resetForm()
    } catch {
      toast.error("Erro ao salvar categoria. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Deletar categoria ──────────────────────────────────────
  async function handleDelete(code: string) {
    try {
      await deleteCategory(code)
      toast.success("Categoria removida.")
    } catch {
      toast.error("Erro ao remover categoria.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Categorias</h1>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 transition-all hover:scale-105" onClick={openNewDialog}>
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
              {/* Nome */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="catName"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Nome
                </Label>
                <Input
                  id="catName"
                  placeholder="Ex: Educação"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              {/* Cor */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Cor
                </Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`h-8 w-8 cursor-pointer rounded-full border-2 transition-all ${formColor === color
                        ? "scale-110 border-foreground"
                        : "border-transparent hover:scale-105"
                        }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Cor ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Ícone */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Ícone
                </Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormIcon(opt.name)}
                        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border transition-colors ${formIcon === opt.name
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          }`}
                        aria-label={opt.name}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: formColor + "20" }}
                >
                  {(() => {
                    const PreviewIcon = getIconComponent(formIcon)
                    return <PreviewIcon className="h-5 w-5" style={{ color: formColor }} />
                  })()}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formName || "Pré-visualização"}
                </span>
              </div>

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingCategory ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Categoria"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">
            {isLoading
              ? "Carregando..."
              : `${categories.length} ${categories.length === 1 ? "categoria" : "categorias"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            /* Skeleton loading */
            <div className="flex flex-col">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                    <div className="h-8 w-8 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-muted-foreground">
              <Home className="h-10 w-10 opacity-20" />
              <p className="text-sm">Nenhuma categoria cadastrada</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={openNewDialog}>
                Criar primeira categoria
              </Button>
            </div>
          ) : (
            <div className="flex flex-col">
              {categories.map((cat: Category) => {
                const Icon = getIconComponent(cat.icon_name)
                return (
                  <div
                    key={cat.code}
                    className="flex items-center justify-between border-b border-border px-6 py-4 transition-colors last:border-b-0 hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: cat.color + "20" }}
                      >
                        <Icon className="h-5 w-5" style={{ color: cat.color }} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{cat.title}</span>
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(cat)}
                        className="h-8 w-8 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Editar categoria"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-muted-foreground transition-colors hover:text-destructive"
                            aria-label="Remover categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-heading">
                              Remover categoria
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {"Tem certeza que deseja remover a categoria "}
                              <span className="font-medium">{cat.title}</span>
                              {"? Esta ação não pode ser desfeita."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cat.code)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

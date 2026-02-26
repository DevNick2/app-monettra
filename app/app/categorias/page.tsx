"use client"

import { useState } from "react"
import {
  Plus, Pencil, Trash2,
  Home, ShoppingCart, Car, Heart, Gamepad2, Briefcase,
  GraduationCap, Utensils, Zap, Wifi, Droplets, Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const colorOptions = [
  "#8b6914", "#c4a35a", "#a63d2f", "#5a7a5a", "#4a6a8a",
  "#7a6b5a", "#9b4dca", "#e67e22", "#2c3e50", "#16a085",
]

interface Category {
  id: string
  name: string
  color: string
  iconName: string
}

const initialCategories: Category[] = [
  { id: "1", name: "Moradia", color: "#8b6914", iconName: "Home" },
  { id: "2", name: "Alimentacao", color: "#c4a35a", iconName: "Utensils" },
  { id: "3", name: "Transporte", color: "#5a7a5a", iconName: "Car" },
  { id: "4", name: "Saude", color: "#a63d2f", iconName: "Heart" },
  { id: "5", name: "Lazer", color: "#4a6a8a", iconName: "Gamepad2" },
  { id: "6", name: "Trabalho", color: "#7a6b5a", iconName: "Briefcase" },
]

function getIcon(iconName: string) {
  const found = iconOptions.find((i) => i.name === iconName)
  return found ? found.icon : Home
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formColor, setFormColor] = useState(colorOptions[0])
  const [formIcon, setFormIcon] = useState("Home")

  function openNewDialog() {
    setEditingId(null)
    setFormName("")
    setFormColor(colorOptions[0])
    setFormIcon("Home")
    setDialogOpen(true)
  }

  function openEditDialog(cat: Category) {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormColor(cat.color)
    setFormIcon(cat.iconName)
    setDialogOpen(true)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, name: formName, color: formColor, iconName: formIcon }
            : c
        )
      )
    } else {
      setCategories([
        ...categories,
        { id: Date.now().toString(), name: formName, color: formColor, iconName: formIcon },
      ])
    }
    setDialogOpen(false)
  }

  function handleDelete(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Categorias
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={openNewDialog}>
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingId ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Altere os dados da categoria"
                  : "Crie uma nova categoria para organizar seus lancamentos"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="catName">Nome</Label>
                <Input
                  id="catName"
                  placeholder="Ex: Educacao"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        formColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Cor ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Icone</Label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((opt) => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormIcon(opt.name)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                          formIcon === opt.name
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

              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 p-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: formColor + "20" }}
                >
                  {(() => {
                    const PreviewIcon = getIcon(formIcon)
                    return <PreviewIcon className="h-5 w-5" style={{ color: formColor }} />
                  })()}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {formName || "Pre-visualizacao"}
                </span>
              </div>

              <Button type="submit" className="w-full">
                {editingId ? "Salvar Alteracoes" : "Criar Categoria"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">
            {categories.length} {categories.length === 1 ? "categoria" : "categorias"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {categories.map((cat) => {
              const Icon = getIcon(cat.iconName)
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between border-b border-border px-6 py-4 last:border-b-0 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: cat.color + "20" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
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
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label="Editar categoria"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
                            <span className="font-medium">{cat.name}</span>
                            {"? Esta acao nao pode ser desfeita."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(cat.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}

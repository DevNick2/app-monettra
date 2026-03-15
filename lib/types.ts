// ============================================================
// Monettra — Tipos TypeScript Globais
// Baseados no contrato da API FastAPI (api/)
// ============================================================

export type TransactionType = "income" | "expense"

export interface Transaction {
  code: string // UUID
  title: string
  amount: string
  type: TransactionType
  description: string | null
  due_date: string // "DD/MM/YYYY"
  is_paid: boolean
  created_at: string
  updated_at: string
  category: Category
  category_code?: string | null
}

export interface Category {
  code: string
  title: string
  color: string
  icon_name: string
  created_at: string
  type: string
}

export interface User {
  code: string
  name: string
  email: string
  type: "user" | "admin"
  created_at: string
}

export interface ApiError {
  error: true
  status: number
  message: string
  details?: { field: string; issue: string }[]
}

// Payloads de request

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface CreateTransactionPayload {
  title: string
  amount: string
  type: TransactionType
  description?: string | null
  due_date: string
  category_code?: string | null
  is_paid?: boolean
}

export interface UpdateTransactionPayload {
  title?: string
  amount?: string
  type?: TransactionType
  description?: string | null
  due_date?: string
  category_code?: string | null
  is_paid?: boolean
}

export interface CreateCategoryPayload {
  title: string
  color: string
  icon_name: string
  type: TransactionType
}

export interface UpdateCategoryPayload {
  title?: string
  color?: string
  icon_name?: string
  type?: TransactionType
}

export interface PlanningEntry {
  code: string
  title: string
  amount: string
  type: TransactionType
  description: string | null
  due_date: string
  is_materialized: boolean
  materialized_transaction_code: string | null
  created_at: string
  category: Category | null
  group_code: string | null
  installment_index: number | null
  installment_total: number | null
  installment_label: string | null
}

export interface CreatePlanningEntryPayload {
  title: string
  amount: string
  type: TransactionType
  description?: string | null
  due_date: string
  category_code?: string | null
  installments?: number
}

export interface UpdatePlanningEntryPayload {
  title?: string
  amount?: string
  type?: TransactionType
  description?: string | null
  due_date?: string
  category_code?: string | null
  scope: "this" | "this_and_future"
}

export interface CategoryHorizonData {
  category_code: string | null
  category_name: string
  category_color: string | null
  real_income: number
  real_expense: number
  projected_income: number
  projected_expense: number
}

export interface PlanningHorizonMonthlyData {
  year_month: string
  categories: CategoryHorizonData[]
  net_balance: number
}

export interface PlanningHorizonResponse {
  horizon: PlanningHorizonMonthlyData[]
}

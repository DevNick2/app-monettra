// ============================================================
// Monettra — Tipos TypeScript Globais
// Baseados no contrato da API FastAPI (api/)
// ============================================================

export type TransactionType = "income" | "expense"

export type SubscriptionPaymentMethod = "default" | "credit_card"

export interface OwnerInfo {
  code: string
  name: string
  photo_url: string | null
}

export interface Transaction {
  code: string // UUID
  title: string
  amount: string
  type: TransactionType
  type_of_transaction: "default" | "subscription" | "credit_card"
  description: string | null
  due_date: string // "DD/MM/YYYY"
  is_paid: boolean
  created_at: string
  updated_at: string
  category: Category
  category_code?: string | null
  recurrence_id?: string | null // UUID do grupo de recorrência
  subscription_payment_method?: SubscriptionPaymentMethod | null
  invoice_code?: string | null // UUID da fatura (para transações de cartão)
  invoice_reference_month?: number | null
  invoice_reference_year?: number | null
  credit_card_name?: string | null
  owner?: OwnerInfo | null
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
  owner_code?: string | null
}

export interface BatchCreateTransactionPayload {
  title: string
  amount: string
  type: TransactionType
  description?: string | null
  start_date: string // "DD/MM/YYYY" — o backend faz o loop até Dez
  category_code?: string | null
  is_paid?: boolean
  owner_code?: string | null
}

export type RecurrenceScope = "single" | "forward" | "all"

/** Agregação retornada por GET /transactions/summary */
export interface TransactionSummary {
  total_income: number
  total_expense: number
  net_balance: number
  paid_income: number
  paid_expense: number
  paid_net_balance: number
}

export interface UpdateTransactionPayload {
  title?: string
  amount?: string
  type?: TransactionType
  description?: string | null
  due_date?: string
  category_code?: string | null
  is_paid?: boolean
  owner_code?: string | null
  scope?: RecurrenceScope
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

// Assinaturas (Subscriptions)

export type RecurrenceType = "monthly" | "yearly"

export interface Subscription {
  code: string
  provider: string
  amount: string
  recurrence: RecurrenceType
  billing_date: string | null // "DD/MM/YYYY"
  has_trial: boolean
  is_active: boolean
  description: string | null
  icon_name: string | null
  payment_method: SubscriptionPaymentMethod
  created_at: string
}

export interface CreateSubscriptionPayload {
  provider: string
  amount: string
  recurrence: RecurrenceType
  billing_date?: string | null // "DD/MM/YYYY"
  has_trial?: boolean
  is_active?: boolean
  description?: string | null
  payment_method?: SubscriptionPaymentMethod
}

export interface UpdateSubscriptionPayload {
  provider?: string
  amount?: string
  recurrence?: RecurrenceType
  billing_date?: string | null
  has_trial?: boolean
  is_active?: boolean
  description?: string | null
  payment_method?: SubscriptionPaymentMethod
}

// Contas compartilhadas (Accounts)

export interface AccountMember {
  code: string
  user_code: string
  user_name: string
  user_email: string
  role: "owner" | "user"
  is_accepted: boolean
  created_at: string
}

export interface Account {
  code: string
  name: string
  max_members: number
  is_active: boolean
  created_at: string
  members: AccountMember[]
}

export interface InviteMemberPayload {
  email: string
}

// IA Engine

// Cartões de Crédito

export interface CreditCard {
  code: string
  name: string
  credit_limit: string // "1.500,00"
  closing_day: number
  due_day: number
  created_at: string
}

export interface CreateCreditCardPayload {
  name: string
  credit_limit: string // "1.500,00"
  closing_day: number
  due_day: number
}

export interface UpdateCreditCardPayload {
  name?: string
  credit_limit?: string
  closing_day?: number
  due_day?: number
}

export interface InvoiceTransaction {
  code: string
  title: string
  amount: string
  due_date: string
  is_paid: boolean
  description: string | null
  installment_label?: string | null
}

export interface Invoice {
  code: string
  reference_month: number
  reference_year: number
  total_amount: string
  is_paid: boolean
  credit_card_code: string
  credit_card_name: string
  transactions: InvoiceTransaction[]
  created_at: string
}

export interface CreateCreditCardChargePayload {
  title: string
  amount: string // "1.500,00"
  purchase_date: string // "DD/MM/YYYY"
  credit_card_code: string
  installments: number
  category_code?: string | null
  description?: string | null
}

export interface ChatMessage {
  id?: string
  role: "user" | "assistant"
  content: string
  kind?: "text" | "system" | "ui"
  ui_block?: ChatUIBlock | null
  tool_name?: string | null
  status?: string | null
  timestamp?: string
}

export interface ChatActionConfirmationBlock {
  type: "action-confirmation"
  title: string
  description: string
  entity_code: string
}

export interface ChatTransactionsListBlock {
  type: "transactions-list"
  title: string
  count: number
  items: Array<{
    code: string
    title: string
    amount: string
    type: TransactionType
    due_date: string
    is_paid: boolean
    category?: Category | null
  }>
}

export interface ChatFinancialSummaryBlock {
  type: "financial-summary"
  title: string
  summary: {
    income: string
    expense: string
    balance: string
    transaction_count: number
    top_categories: Array<{
      name: string
      total: string
      total_cents: number
    }>
    month?: number | null
    year?: number | null
  }
}

export interface ChatCategoriesListBlock {
  type: "categories-list"
  title: string
  count: number
  items: Category[]
}

export interface ChatSubscriptionsListBlock {
  type: "subscriptions-list"
  title: string
  count: number
  items: Subscription[]
}

export type ChatUIBlock =
  | ChatActionConfirmationBlock
  | ChatTransactionsListBlock
  | ChatFinancialSummaryBlock
  | ChatCategoriesListBlock
  | ChatSubscriptionsListBlock

export type OfxImportStatusType = "pending" | "processing" | "completed" | "error"

export interface OfxImportStatus {
  code: string
  filename: string
  status: OfxImportStatusType
  source: string
  total_transactions: number | null
  processed_transactions: number | null
  error_message: string | null
  created_at: string
}

export interface ChatSseEvent {
  type:
    | "token"
    | "status"
    | "tool_started"
    | "tool_finished"
    | "ui_block"
    | "import_status"
  token?: string
  status?: string
  label?: string
  tool_name?: string
  result_text?: string
  block?: ChatUIBlock
  import?: OfxImportStatus
}


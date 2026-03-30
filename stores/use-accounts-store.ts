import { create } from "zustand"
import { api } from "@/lib/api"
import type { Account } from "@/lib/types"

interface AccountsState {
  account: Account | null
  isLoading: boolean
}

interface AccountsActions {
  fetchMyAccount: () => Promise<void>
}

type AccountsStore = AccountsState & AccountsActions

export const useAccountsStore = create<AccountsStore>((set) => ({
  account: null,
  isLoading: false,

  fetchMyAccount: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get<Account>("/accounts/me")
      set({ account: data, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },
}))

import { create } from 'zustand'

interface AppStore {
  initialized: boolean
}

export const useAppStore = create<AppStore>(() => ({
  initialized: true,
}))

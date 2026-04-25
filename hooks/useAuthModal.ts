import { create } from 'zustand'

export type Tab = 'login' | 'signup'

interface AuthModalStore {
  isOpen: boolean
  defaultTab: Tab
  openModal: (tab: Tab) => void
  closeModal: () => void
}

export const useAuthModal = create<AuthModalStore>((set) => ({
  isOpen: false,
  defaultTab: 'login',
  openModal: (tab) => set({ isOpen: true, defaultTab: tab }),
  closeModal: () => set({ isOpen: false }),
}))

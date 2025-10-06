import { create } from 'zustand';

import type { ModalStore } from '@/src/types/auth';

export const useModalStore = create<ModalStore>((set) => ({
  // State
  isOpen: false,
  mode: 'login',

  // Actions
  openModal: (mode) => set({ isOpen: true, mode }),
  closeModal: () => set({ isOpen: false }),
  switchMode: (mode) => set({ mode }),
}));

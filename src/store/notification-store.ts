import { create } from 'zustand';

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
};

interface NotificationState {
  items: NotificationItem[];
  open: boolean;
  addNotification: (title: string, message: string) => void;
  markAllRead: () => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  open: false,
  addNotification: (title, message) =>
    set((state) => ({
      items: [
        {
          id: crypto.randomUUID(),
          title,
          message,
          createdAt: Date.now(),
          read: false,
        },
        ...state.items,
      ].slice(0, 20),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),
  toggleOpen: () => set((state) => ({ open: !state.open })),
  setOpen: (open) => set({ open }),
}));

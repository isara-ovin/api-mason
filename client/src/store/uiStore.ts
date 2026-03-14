import { create } from 'zustand';

interface UIState {
    theme: 'dark' | 'light';
    isSidebarOpen: boolean;
    selectedBlockId: string | null;

    toggleTheme: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleSidebar: () => void;
    setSelectedBlock: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'dark',
    isSidebarOpen: true,
    selectedBlockId: null,

    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        return { theme: newTheme };
    }),

    setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
    },

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSelectedBlock: (id) => set({ selectedBlockId: id }),
}));

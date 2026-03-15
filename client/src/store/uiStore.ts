import { create } from 'zustand';

interface UIState {
    theme: 'dark' | 'light';
    isSidebarOpen: boolean;
    isEnvPanelOpen: boolean;
    selectedBlockId: string | null;

    toggleTheme: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
    toggleSidebar: () => void;
    toggleEnvPanel: () => void;
    setEnvPanelOpen: (open: boolean) => void;
    setSelectedBlock: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    theme: 'dark',
    isSidebarOpen: true,
    isEnvPanelOpen: false,
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
    toggleEnvPanel: () => set((state) => ({ isEnvPanelOpen: !state.isEnvPanelOpen })),
    setEnvPanelOpen: (open) => set({ isEnvPanelOpen: open }),
    setSelectedBlock: (id) => set({ selectedBlockId: id }),
}));

import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';

export function useTheme() {
    const { theme, toggleTheme, setTheme } = useUIStore();

    useEffect(() => {
        // Initial theme setup
        const savedTheme = localStorage.getItem('apimason-theme') as 'dark' | 'light' | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    }, [setTheme]);

    useEffect(() => {
        localStorage.setItem('apimason-theme', theme);
    }, [theme]);

    return { theme, toggleTheme };
}

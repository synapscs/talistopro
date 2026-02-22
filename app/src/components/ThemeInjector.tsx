import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

export const ThemeInjector = () => {
    const { organization } = useAuthStore();
    const themeKey = organization?.themeKey || 'obsidian';

    useEffect(() => {
        // Eliminar clases de temas anteriores
        const htmlElement = document.documentElement;
        const themeClasses = ['theme-obsidian', 'theme-emerald', 'theme-industrial', 'theme-ruby'];
        themeClasses.forEach(cls => htmlElement.classList.remove(cls));

        // Aplicar el nuevo tema
        htmlElement.classList.add(`theme-${themeKey}`);


    }, [themeKey]);

    return null; // Este componente no renderiza nada visualmente
};

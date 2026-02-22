# Sistema de Estilos y Personalización "Elite" 🎨✨

TaListo Pro utiliza un sistema de tematización avanzado diseñado para ofrecer una experiencia de usuario premium, coherente y altamente personalizable.

## Arquitectura de Temas

El sistema se basa en tres pilares fundamentales:

### 1. Definición de Variables (`themes.css`)
Todas las paletas (Obsidian, Emerald, Industrial, Ruby) están definidas mediante variables CSS nativas en `app/src/themes.css`. Cada tema define dos juegos de tokens:
- **Brand Tokens**: Colores de marca y acento (primarios).
- **Surface Tokens**: Colores de fondo, bordes y superficies.

### 2. Inyección Dinámica (`ThemeInjector.tsx`)
El componente `ThemeInjector` escucha los cambios en `themeKey` dentro del `useAuthStore` y aplica la clase correspondiente (`.theme-obsidian`, `.theme-emerald`, etc.) al elemento `<html>`. Esto permite cambiar el aspecto de toda la aplicación instantáneamente sin recargar.

### 3. Integración con Tailwind v4 (`index.css`)
Tailwind v4 consume estas variables dinámicas mediante el bloque `@theme`:
```css
@theme {
  --color-primary-500: var(--brand-500);
  --color-slate-900: var(--surface-900);
}
```

## Paletas Maestras Disponibles

| ID | Nombre | Descripción | Estética |
|:---|:---|:---|:---|
| `obsidian` | Obsidian Original | Indigo + Slate | Lujo técnico y profundidad. |
| `emerald` | Emerald Elite | Emerald + Zinc | Elegancia natural y claridad. |
| `industrial` | Industrial Gray | Zinc + Slate | Robusto y puramente funcional. |
| `ruby` | Ruby Professional | Rose + Zinc | Energía, pasión y precisión. |

## Persistencia y Sincronización

1. **Persistencia**: El `themeKey` se guarda directamente en el modelo `Organization` de la base de datos PostgreSQL.
2. **Sincronización**: Al guardar cambios en `GeneralSettings`, la aplicación realiza una re-sincronización silenciosa del `authStore` para que el nuevo tema se aplique de inmediato en todas las pestañas abiertas.
3. **Escalabilidad**: Añadir un nuevo tema solo requiere definir sus variables en `themes.css` y registrarlo en el `PaletteSelector`.

---
> [!TIP]
> Todas las paletas han sido diseñadas para cumplir con estándares de accesibilidad y contraste "Elite", asegurando legibilidad tanto en condiciones de mucha luz como en modo oscuro.

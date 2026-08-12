import { Colors } from "./Colors";
import { Fonts } from "./Fonts";

/** Shared visual language for all product screens. */
export const Theme = {
    colors: Colors,
    fonts: Fonts,
    spacing: {
        xs: 8,
        sm: 12,
        md: 20,
        lg: 32,
        xl: 48
    },
    radius: {
        small: 12,
        medium: 18,
        large: 28,
        pill: 999
    },
    motion: {
        fast: 110,
        normal: 220,
        entrance: 480
    },
    layout: {
        width: 1280,
        height: 720,
        safeMargin: 24
    }
} as const;

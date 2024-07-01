import { useContext } from "react";
import { AppStateContext } from "../appStateBackend";
import { Scheme, hexFromArgb, Hct, SchemeTonalSpot, DynamicScheme, MaterialDynamicColors } from "@material/material-color-utilities";
const cols = [
    "primaryPaletteKeyColor",
    "secondaryPaletteKeyColor",
    "tertiaryPaletteKeyColor",
    "neutralPaletteKeyColor",
    "neutralVariantPaletteKeyColor",
    "background",
    "onBackground",
    "surface",
    "surfaceDim",
    "surfaceBright",
    "surfaceContainerLowest",
    "surfaceContainerLow",
    "surfaceContainer",
    "surfaceContainerHigh",
    "surfaceContainerHighest",
    "onSurface",
    "surfaceVariant",
    "onSurfaceVariant",
    "inverseSurface",
    "inverseOnSurface",
    "outline",
    "outlineVariant",
    "shadow",
    "scrim",
    "surfaceTint",
    "primary",
    "onPrimary",
    "primaryContainer",
    "onPrimaryContainer",
    "inversePrimary",
    "secondary",
    "onSecondary",
    "secondaryContainer",
    "onSecondaryContainer",
    "tertiary",
    "onTertiary",
    "tertiaryContainer",
    "onTertiaryContainer",
    "error",
    "onError",
    "errorContainer",
    "onErrorContainer",
    "primaryFixed",
    "primaryFixedDim",
    "onPrimaryFixed",
    "onPrimaryFixedVariant",
    "secondaryFixed",
    "secondaryFixedDim",
    "onSecondaryFixed",
    "onSecondaryFixedVariant",
    "tertiaryFixed",
    "tertiaryFixedDim",
    "onTertiaryFixed",
    "onTertiaryFixedVariant"
]

export default function DynamicStylesheet(){
    // context is in AppStateContext'
    const ctx = useContext(AppStateContext);
    console.log(MaterialDynamicColors)
    const theme = ctx.theme
    console.log("new theme?", new DynamicScheme(theme))
    // console.log(theme)
    // Hct.fromInt(theme.primary).hue

    let bg = Hct.fromInt(theme.background)
    if (theme.isDark) bg.tone = 1
    bg = bg.toInt()
    
    return <style>
        :root {"{"}
            {cols.map((key)=>`--${key}: ${key == "background" ? hexFromArgb(bg) : hexFromArgb(theme[key])}`).join(";\n")}
        {"}"}
        {theme.isDark ? "" : `p b, a, h1 b, span b {
            text-shadow: 2px 2px #000000, 0 0px 4px #000000 !important;
            color: var(--background) !important;
        }`}
        </style>
    // :root {
    //     --primary: ${ctx.theme.type}
    // }
    
}
import { useContext } from "react";
import { AppStateContext, defaultColor } from "../appStateBackend";
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

// I should just be using a class name like `dark`  as a top level container... but whatever, allow it
// TODOL: Use custom classname for aesthetics specific to dark and light mode
export default function DynamicStylesheet({config}){
    // context is in AppStateContext'
    const ctx = useContext(AppStateContext);
    
    // console.log(MaterialDynamicColors)
    const theme = ctx.theme
    let color = localStorage.getItem("color")

    let bg = Hct.fromInt(theme.background)
    if (theme.isDark) bg.tone = 0.2
    bg = bg.toInt()
    
    return <style>
        :root {"{"}
            {cols.map((key)=>`--${key}: ${key == "background" ? hexFromArgb(bg) : hexFromArgb(theme[key])}`).join(";\n")}
        {"}"}

        {`
        
        .card {
            border:2px solid ${color}1f;
        }

        *::-webkit-scrollbar-track {
            background: ${color}09;
        }

        `}

        {theme.isDark ? `
        p b, a, h1 b, span b, .boldified {color: #fff; text-shadow: 2px 2px "+color+";}
        .sliderButton .main { background: ${hexFromArgb(theme["inverseSurface"])}1f }
        ` 
        : 
        `p b, a, h1 b, span b, .subheader, b, .boldified {
            text-shadow: 2px 2px  var(--secondaryPaletteKeyColor), 0 0px 4px  var(--secondaryPaletteKeyColor) !important;
            color: var(--background) !important;
        }
        .card.api_path b {
            color: white;
            text-shadow: 2px 2px var(--inversePrimary),-0.5px -0.5px 4px var(--inversePrimary);
            font-size: 1.1em;
        }
        .sliderButton .main { background: ${hexFromArgb(theme["inverseSurface"])}1f }
        .detail-bar {
            background: rgba(255,255,255,0.2) !important;
        }
        `}
        {config.boxShadow ? "" : "body {box-shadow: none !important; -webkit-box-shadow: none !important;}"}
        </style>
    // :root {
    //     --primary: ${ctx.theme.type}
    // }
    
}
import { createContext, useContext, useEffect, useState } from "react";
import { argbFromHex, Hct, hexFromArgb, SchemeFidelity, SchemeTonalSpot, SchemeVibrant, themeFromSourceColor, TonalPalette,  } from '@material/material-color-utilities';
import { loggers } from "./utils/loggers";

export const defaultColor = "#867cff"
const docDefault = localStorage.getItem('color') ?? defaultColor

/**
 * @type {"dark" | "light"}
 */
let prefs = "dark" 

export const AppStateContext = createContext({
  harContent: null,
  serverURL: "",
  preference: prefs,
  theme:{},
  highlightedNodes:{},
  filter:"all",
  setHighlightedNodes:()=>{},
  setHarContent: (content) => {},
  setServerURL: (url) => {},
  setTheme: (theme) => {},
  setPreference: (preference) => {},
  setFilter: ()=>{}
});
let seedColor = docDefault;
export const AppStateProvider = ({ children }) => {
  const [harContent, setHarContent_core] = useState(null);
  const [serverURL, setServerURL] = useState("");
  const [preference, setPreference_core] = useState(localStorage.getItem('preference')  ?? "dark")
  const dark = preference == "dark"
  const [theme, setTheme] = useState(new SchemeFidelity(Hct.fromInt(argbFromHex(docDefault)), dark, 0))

  const [filter, setFilter] = useState("all")
  const [highlightedNodes, setHighlightedNodes] = useState({})


  // -- Middleware --

  /**
   * Original HAR Log, untouched by Harambe middleware
   * @param {HARLog} har_original 
   */
  let setHarContent = (har_original)=>{

    /**
     * @type {HARLog_Harambe}
     */
    let har_modified = har_original;
    
    // `connection` in spec claims to be unique - it is NOT(!!) unique in the sense that it'll be a unique identifier!!
    har_modified.log.entries = har_original.log.entries.map((entry, index)=>{
      return {...entry, id:index.toString()}
    })
    console.log(har_modified)

    setHarContent_core(har_modified)
  }

  let themeOverride = undefined
  const setPreference = (preference) => {
    loggers.appstate(preference, "is the new Theme.")
    localStorage.setItem('preference', preference)
    setPreference_core(preference)
    themeOverride = preference == "dark"
    setThemeMiddleware(seedColor)
  }

  const setThemeMiddleware = (seed)=>{
    let m3ThemeJSON = new SchemeFidelity(Hct.fromInt(argbFromHex(seed)), themeOverride ?? dark, 0)
    seedColor = seed;
    localStorage.setItem('color', seed)
    loggers.appstate(preference)
    setTheme(m3ThemeJSON);
  }
  return (
    <AppStateContext.Provider
      value={{
        harContent,
        serverURL,
        theme,
        preference,
        filter,
        setFilter,
        setHarContent,
        setServerURL,
        setTheme:setThemeMiddleware,
        setPreference,
        highlightedNodes, 
        setHighlightedNodes
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// export default {AppStateProvider, AppStateContext};

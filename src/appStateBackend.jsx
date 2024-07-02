import { createContext, useContext, useEffect, useState } from "react";
import { argbFromHex, Hct, hexFromArgb, SchemeFidelity, SchemeTonalSpot, SchemeVibrant, themeFromSourceColor, TonalPalette,  } from '@material/material-color-utilities';

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
  setHarContent: (content) => {},
  setServerURL: (url) => {},
  setTheme: (theme) => {},
  setPreference: (preference) => {},
});
let seedColor = docDefault;
export const AppStateProvider = ({ children }) => {
  const [harContent, setHarContent] = useState(null);
  const [serverURL, setServerURL] = useState("");
  const [preference, setPreference_core] = useState(localStorage.getItem('preference')  ?? "dark")
  const dark = preference == "dark"
  const [theme, setTheme] = useState(new SchemeFidelity(Hct.fromInt(argbFromHex(docDefault)), dark, 0))

  let themeOverride = undefined
  const setPreference = (preference) => {
    console.log(preference, "is the new Theme.")
    localStorage.setItem('preference', preference)
    setPreference_core(preference)
    themeOverride = preference == "dark"
    setThemeMiddleware(seedColor)
  }



  const setThemeMiddleware = (seed)=>{
    let m3ThemeJSON = new SchemeFidelity(Hct.fromInt(argbFromHex(seed)), themeOverride ?? dark, 0)
    seedColor = seed;
    localStorage.setItem('color', seed)
    console.log(preference)
    setTheme(m3ThemeJSON);
  }
  return (
    <AppStateContext.Provider
      value={{
        harContent,
        serverURL,
        theme,
        preference,
        setHarContent,
        setServerURL,
        setTheme:setThemeMiddleware,
        setPreference
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// export default {AppStateProvider, AppStateContext};

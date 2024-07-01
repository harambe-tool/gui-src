import { createContext, useContext, useEffect, useState } from "react";
import { argbFromHex, Hct, hexFromArgb, SchemeFidelity, SchemeTonalSpot, SchemeVibrant, themeFromSourceColor, TonalPalette,  } from '@material/material-color-utilities';

const defaultColor = "#867cff"

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
let seedColor = defaultColor;
export const AppStateProvider = ({ children }) => {
  const [harContent, setHarContent] = useState(null);
  const [serverURL, setServerURL] = useState("");
  const [preference, setPreference_core] = useState(localStorage.getItem('preference')  ?? "dark")
  const dark = preference == "dark"
  const [theme, setTheme] = useState(new SchemeFidelity(Hct.fromInt(argbFromHex(defaultColor)), dark, 0))

  
  const setPreference = (preference) => {
    setPreference_core(preference)
    setThemeMiddleware(seedColor)
    localStorage.setItem('preference', preference)
  }



  const setThemeMiddleware = (seed)=>{
    let m3ThemeJSON = new SchemeFidelity(Hct.fromInt(argbFromHex(seed)), dark, 0)
    seedColor = seed;
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

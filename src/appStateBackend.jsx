import { createContext, useContext, useState } from "react";
import { argbFromHex, hexFromArgb, themeFromSourceColor, TonalPalette } from '@material/material-color-utilities';

export const AppStateContext = createContext({
  harContent: null,
  serverURL: "",
  theme:{},
  setHarContent: (content) => {},
  setServerURL: (url) => {},
  setTheme: (theme) => {}
});

export const AppStateProvider = ({ children }) => {
  const [harContent, setHarContent] = useState(null);
  const [serverURL, setServerURL] = useState("");
  const [theme, setTheme] = useState({})

  const setThemeMiddleware = (seed)=>{
    const m3ThemeJSON = themeFromSourceColor(argbFromHex(seed), []);
    setTheme(m3ThemeJSON);
  }
  return (
    <AppStateContext.Provider
      value={{
        harContent,
        serverURL,
        theme,
        setHarContent,
        setServerURL,
        setTheme:setThemeMiddleware
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// export default {AppStateProvider, AppStateContext};

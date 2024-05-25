import { createContext, useContext, useState } from "react";

export const AppStateContext = createContext({
  harContent: null,
  serverURL: "",
  setHarContent: (content) => {},
  setServerURL: (url) => {},
});

export const AppStateProvider = ({ children }) => {
  const [harContent, setHarContent] = useState(null);
  const [serverURL, setServerURL] = useState("");

  return (
    <AppStateContext.Provider
      value={{
        harContent,
        serverURL,
        setHarContent,
        setServerURL,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

// export default {AppStateProvider, AppStateContext};

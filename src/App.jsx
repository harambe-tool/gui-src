import {Routes, Route, HashRouter } from "react-router-dom";
import "./App.css";
import Importer from "./pages/GettingStarted";
import { AppStateProvider } from "./appStateBackend";
import Viewer from "./pages/Viewer";
import Settings from "./pages/Settings";
import DynamicStylesheet from "./components/DynamicStylesheet";
import { useState } from "react";
// import { createContext, useContext, useState } from "react";

function App() {
  // const [count, setCount] = useState(0)

  const [boxShadow, setBoxShadow] = useState(false)

  return (
    <AppStateProvider>
      <div style={{ minHeight: "100vh", minWidth: "100vw" }}>
        <DynamicStylesheet config={{boxShadow}}></DynamicStylesheet>
        <HashRouter>
          <Routes>
            <Route path="/" index={true} element={<Importer />} />
            <Route exact path="/viewer" element={<Viewer />} />
            <Route exact path="/settings" element={<Settings boxShadowOpts={{boxShadow,setBoxShadow}} />}  />
          </Routes>
        </HashRouter>
      </div>
    </AppStateProvider>
  );
}

export default App;

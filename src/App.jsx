import {Routes, Route, HashRouter } from "react-router-dom";
import "./App.css";
import Importer from "./pages/GettingStarted";
import { AppStateProvider } from "./appStateBackend";
import Viewer from "./pages/Viewer";
// import { createContext, useContext, useState } from "react";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <AppStateProvider>
      <div style={{ minHeight: "100vh" }}>
        <HashRouter>
          <Routes>
            <Route path="/" index={true} element={<Importer />} />
            <Route exact path="/viewer" element={<Viewer />} />
          </Routes>
        </HashRouter>
      </div>
    </AppStateProvider>
  );
}

export default App;

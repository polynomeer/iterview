import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./app/styles/global.css";
import "./shared/theme/tokens.css";
import "./shared/ui/primitives/primitives.css";
import "./widgets/layout/shell.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

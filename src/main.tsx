import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./print-build-info";

import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

import { createRoot } from "react-dom/client";
import App from "./App.static";
import "./index.css";

// Inicializar a aplicação
createRoot(document.getElementById("root")!).render(<App />);
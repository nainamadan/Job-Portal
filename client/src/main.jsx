import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./theme-dark.css";
import "./styles/responsive.css";
import "./utils/theme";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import { ClerkProvider } from "@clerk/clerk-react";

// When this key is missing, vite.config.js swaps in a no-login stand-in instead of crashing.
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </ClerkProvider>
);

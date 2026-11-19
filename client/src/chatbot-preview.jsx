// TEMPORARY test page for the Help chatbot (works without the Clerk key). Safe to delete.
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import HelpChatbot from "./components/HelpChatbot";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-2xl font-bold text-gray-800">Help chatbot preview</h1>
      <p className="text-gray-600 mt-2">
        Click the 🤖 button in the bottom-right corner to try the chatbot.
      </p>
    </div>
    <HelpChatbot />
  </BrowserRouter>
);

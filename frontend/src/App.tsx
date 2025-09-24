// App.tsx
import { BrowserRouter as Router } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "./pages/AppShell";

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
          <Router>
            <AppShell />
          </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

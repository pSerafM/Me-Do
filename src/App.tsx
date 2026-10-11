import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppProvider";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <AppRoutes />
            </AppProvider>
        </BrowserRouter>
    );
}

export default App;

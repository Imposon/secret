import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Studio from "./pages/Studio";
import History from "./pages/History";
import Auth from "./pages/Auth";
import Pricing from "./pages/Pricing";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/history" element={<History />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
}

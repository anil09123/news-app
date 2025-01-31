import { ThemeProvider } from "./context/ThemeContext";
import NavigationBar from "./components/NavigationBar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import News from "./components/News";
import Notfound from "./components/Notfound";
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NavigationBar />
        <Routes>
          <Route path="/" element={<News />} />
          <Route path="/category/:category" element={<News />} /> 
          <Route path="/search/:query" element={<News />} />
          <Route path="*" element={<Notfound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

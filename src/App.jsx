import { ThemeProvider } from './context/ThemeContext';
import NavigationBar from './components/NavigationBar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import News from './components/News';
import Notfound from './components/Notfound';
import CustomCursor from './components/CustomCursor';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="app-shell">
          <CustomCursor />
          <NavigationBar />
          <main>
            <Routes>
              <Route path="/" element={<News />} />
              <Route path="/category/:category" element={<News />} />
              <Route path="/search/:query" element={<News />} />
              <Route path="*" element={<Notfound />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <span>NewsPulse</span>
            <span>Fast headlines, clean reading, zero clutter.</span>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

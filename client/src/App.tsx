import { useTheme } from './hooks/useTheme';
import FlowCanvas from './components/Canvas/FlowCanvas';
import Sidebar from './components/Sidebar/Sidebar';
import Toolbar from './components/Toolbar/Toolbar';
import ExecutionLogPanel from './components/Panels/ExecutionLogPanel';
import { Toaster } from 'react-hot-toast';
import { LazyMotion, domAnimation } from 'framer-motion';
import { Box, Sun, Moon } from 'lucide-react';
import './styles/index.css';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <LazyMotion features={domAnimation}>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <header className="main-header">
            <div className="logo">
              <Box className="logo-accent" size={24} strokeWidth={2.5} />
              APIMason
            </div>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </header>
          <Toolbar />
          <section className="canvas-container">
            <div className="layout-horizontal">
              <div className="layout-vertical-main">
                <div className="canvas-pane">
                  <FlowCanvas />
                </div>
                <div className="resize-handle-h"></div>
                <div className="log-pane">
                  <ExecutionLogPanel />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1e1e1e',
            color: '#fff',
            border: '1px solid #333',
          },
        }} />
      </div>
    </LazyMotion>
  );
}

export default App;

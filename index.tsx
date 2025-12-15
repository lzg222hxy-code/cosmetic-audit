import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

// 错误边界组件：如果程序崩溃，显示错误信息而不是白屏
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#dc2626', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>⚠️ 系统启动中断 (System Crash)</h1>
          <p style={{ marginBottom: '1rem' }}>程序遇到了一个阻碍运行的错误。这通常是由于依赖冲突或配置问题引起的。</p>
          <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', border: '1px solid #fca5a5', marginBottom: '1.5rem' }}>
            <code style={{ fontSize: '0.875rem' }}>{this.state.error?.toString()}</code>
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '0.75rem 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
            尝试刷新页面
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

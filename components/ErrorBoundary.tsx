import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-in fade-in bg-slate-50 rounded-[40px] m-4 border border-slate-200">
          <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-inner border border-red-100">⚠️</div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">حدث خطأ غير متوقع</h3>
          <p className="text-gray-500 mb-8 max-w-md font-medium text-sm">نعتذر عن هذا الخلل. لقد قام النظام بتسجيل الخطأ. يرجى محاولة تحديث الصفحة.</p>
          
          <div className="flex gap-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all hover:scale-105"
              >
                تحديث النظام 🔄
              </button>
              <button 
                onClick={() => this.setState({ hasError: false })} 
                className="px-8 py-4 bg-white border border-gray-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                محاولة مرة أخرى
              </button>
          </div>

          {this.state.error && (
              <div className="mt-10 p-6 bg-red-50/50 border border-red-100 rounded-2xl text-left dir-ltr max-w-lg w-full">
                  <p className="text-[10px] font-mono text-red-600 break-words font-bold">
                    Error: {this.state.error.toString()}
                  </p>
              </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
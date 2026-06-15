import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

type RootErrorBoundaryState = {
  error: Error | null;
};

export default class RootErrorBoundary extends Component<
  { children: ReactNode },
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error", error, errorInfo);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-[#eef5fb] px-5 py-10 text-slate-950">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <section className="w-full rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl shadow-blue-950/10 md:p-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
              <AlertTriangle size={13} />
              Error
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              Something went wrong
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              The app hit an unexpected error. Refresh the page to try again.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-800"
              >
                <RefreshCw size={14} />
                Refresh Page
              </button>
              <a
                href="/leagues"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                <Home size={14} />
                Back to Leagues
              </a>
            </div>
          </section>
        </div>
      </main>
    );
  }
}

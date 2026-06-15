import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

function getErrorDetails(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText || "Application Error"}`,
      message:
        typeof error.data === "string"
          ? error.data
          : error.data?.message || "The requested page could not be loaded.",
    };
  }

  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      message: error.message || "The app hit an unexpected error.",
    };
  }

  return {
    title: "Something went wrong",
    message: "The app hit an unexpected error.",
  };
}

export default function AppErrorBoundary() {
  const error = useRouteError();
  const { title, message } = getErrorDetails(error);
  const showDetails = import.meta.env.DEV;

  return (
    <main className="min-h-screen bg-[#eef5fb] px-5 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl shadow-blue-950/10 md:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
            <AlertTriangle size={13} />
            Error
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            {message}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-400">
            Try refreshing the page. If this keeps happening, send the page URL and what you were
            doing before the error happened.
          </p>

          {showDetails && error instanceof Error && error.stack && (
            <pre className="mt-5 max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
              {error.stack}
            </pre>
          )}

          <div className="mt-7 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-xs font-black text-white transition hover:bg-blue-800"
            >
              <RefreshCw size={14} />
              Refresh Page
            </button>
            <Link
              to="/leagues"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
            >
              <Home size={14} />
              Back to Leagues
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

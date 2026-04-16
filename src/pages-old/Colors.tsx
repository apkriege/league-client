export default function Colors() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Colors Page</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div className="bg-primary text-primary-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Primary</h2>
          <p>bg-primary</p>
          <p>text-primary-content</p>
        </div>
        <div className="bg-secondary text-secondary-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Secondary</h2>
          <p>bg-secondary</p>
          <p>text-secondary-content</p>
        </div>
        <div className="bg-accent text-accent-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Accent</h2>
          <p>bg-accent</p>
          <p>text-accent-content</p>
        </div>
        <div className="bg-neutral text-neutral-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Neutral</h2>
          <p>bg-neutral</p>
          <p>text-neutral-content</p>
        </div>
        <div className="bg-base-100 text-base-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Base 100</h2>
          <p>bg-base-100</p>
          <p>text-base-content</p>
        </div>
        <div className="bg-base-200 text-base-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Base 200</h2>
          <p>bg-base-200</p>
          <p>text-base-content</p>
        </div>
        <div className="bg-base-300 text-base-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Base 300</h2>
          <p>bg-base-300</p>
          <p>text-base-content</p>
        </div>
        <div className="bg-info text-info-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Info</h2>
          <p>bg-info</p>
          <p>text-info-content</p>
        </div>
        <div className="bg-success text-success-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Success</h2>
          <p>bg-success</p>
          <p>text-success-content</p>
        </div>
        <div className="bg-warning text-warning-content p-4 rounded-lg shadow">
          <h2 className="font-semibold">Warning</h2>
          <p>bg-warning</p>
          <p>text-warning-content</p>
        </div>
        <div className="bg-error text-error-content p-4 rounded-lg shadow ">
          <h2 className="font-semibold">Error</h2>
          <p>bg-error</p>
          <p>text-error-content</p>
        </div>
      </div>
    </div>
  );
}

// const colors = [
//   "primary",
//   "primary-content",
//   "secondary",
//   "secondary-content",
//   "accent",
//   "accent-content",
//   "neutral",
//   "neutral-content",
//   "base-100",
//   "base-200",
//   "base-300",
//   "base-content",
//   "info",
//   "info-content",
//   "success",
//   "success-content",
//   "warning",
//   "warning-content",
//   "error",
//   "error-content",
// ];

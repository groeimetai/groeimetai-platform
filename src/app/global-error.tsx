'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="nl">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full px-6 py-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Er is iets misgegaan
            </h2>
            <p className="text-gray-600 mb-6">
              We konden de pagina niet laden. Probeer het later opnieuw.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
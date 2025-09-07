import { useEffect, useState } from "react";

// Temporarily comment out the imports to test basic functionality
// import {
//   analyzeLorcanaData,
//   getCardStatistics,
// } from "@total-path/analyser/browser.js";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Temporarily set some mock data to test the UI
    setAnalysis({
      totalCards: 1837,
      averageCost: 3.52,
      recommendations: [
        {
          type: "test",
          message: "This is a test recommendation",
          priority: "medium",
        },
      ],
    });
    setStats({
      total: 1837,
      byType: { character: 1387, action: 163, item: 149, location: 60 },
      byColor: {
        Amber: 286,
        Amethyst: 287,
        Emerald: 286,
        Ruby: 286,
        Sapphire: 286,
        Steel: 286,
      },
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Lorcana data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-red-700 mb-4">
            Error Loading Data
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Make sure to run{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              pnpm run build:data
            </code>{" "}
            first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Total Path Analyser
          </h1>
          <p className="text-gray-600">Disney Lorcana Card Analysis</p>
        </div>

        {analysis && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Total Cards
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {stats.total.toLocaleString()}
              </p>
            </div>

            {/* Average Cost */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Average Cost
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {analysis.averageCost}
              </p>
            </div>

            {/* Card Types */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Card Types
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize text-gray-600">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Colors */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Top Colors
              </h3>
              <div className="space-y-2">
                {Object.entries(stats.byColor)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([color, count]) => (
                    <div key={color} className="flex justify-between">
                      <span className="text-gray-600">{color}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Recommendations
              </h3>
              {analysis.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        rec.priority === "high"
                          ? "bg-red-50 border-l-4 border-red-400"
                          : rec.priority === "medium"
                            ? "bg-yellow-50 border-l-4 border-yellow-400"
                            : "bg-blue-50 border-l-4 border-blue-400"
                      }`}
                    >
                      <p className="text-gray-700">{rec.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No specific recommendations at this time.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

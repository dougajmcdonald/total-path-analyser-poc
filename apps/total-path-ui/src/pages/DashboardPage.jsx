import { useEffect, useState } from "react";

import {
  analyzeLorcanaData,
  getCardStatistics,
} from "@total-path/analyser/browser.js";

function DashboardPage({ ruleConfig, availableConfigs }) {
  const [analysis, setAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data when rule config changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [analysisData, statsData] = await Promise.all([
          analyzeLorcanaData(ruleConfig),
          getCardStatistics(ruleConfig),
        ]);

        setAnalysis(analysisData);
        setStats(statsData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [ruleConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {analysis && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Cards */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Total Cards
            </h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">
              {availableConfigs[ruleConfig]?.name} format
            </p>
          </div>

          {/* Average Cost */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Average Cost
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analysis.averageCost}
            </p>
            <p className="text-sm text-gray-600 mt-1">Ink cost per card</p>
          </div>

          {/* Card Types */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Card Types
            </h3>
            <div className="space-y-1">
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {type}
                  </span>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Color Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Colors</h3>
            <div className="space-y-1">
              {Object.entries(stats.byColor)
                .slice(0, 6)
                .map(([color, count]) => (
                  <div key={color} className="flex justify-between">
                    <span className="text-sm text-gray-600">{color}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Strategy Recommendations
            </h3>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${
                    rec.priority === "high"
                      ? "bg-red-50 border-l-4 border-red-400"
                      : rec.priority === "medium"
                        ? "bg-yellow-50 border-l-4 border-yellow-400"
                        : "bg-blue-50 border-l-4 border-blue-400"
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          rec.priority === "high"
                            ? "bg-red-400"
                            : rec.priority === "medium"
                              ? "bg-yellow-400"
                              : "bg-blue-400"
                        }`}
                      ></span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-800">{rec.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;

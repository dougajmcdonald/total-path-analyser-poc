import { useEffect, useState } from "react";
import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { loadRuleConfigs } from "@total-path/lorcana-data-import/browser.js";
import CardsPage from "./pages/CardsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  const [ruleConfig, setRuleConfig] = useState("core-constructed");
  const [availableConfigs, setAvailableConfigs] = useState({});
  const [configLoading, setConfigLoading] = useState(true);

  // Load available rule configurations
  useEffect(() => {
    async function loadConfigs() {
      try {
        const configs = await loadRuleConfigs();
        setAvailableConfigs(configs);
        setConfigLoading(false);
      } catch (err) {
        console.error("Error loading rule configs:", err);
        setConfigLoading(false);
      }
    }
    loadConfigs();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation */}
          <nav className="mb-8">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Total Path Analyser
                </h1>
                <p className="text-gray-600 mb-6">
                  Disney Lorcana Card Analysis
                </p>
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/cards"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Browse Cards
                </Link>
              </div>
            </div>

            {/* Rule Config Selector */}
            <div className="max-w-md mx-auto mt-6">
              <label
                htmlFor="rule-config"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Game Format
              </label>
              <select
                id="rule-config"
                value={ruleConfig}
                onChange={(e) => setRuleConfig(e.target.value)}
                disabled={configLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {configLoading ? (
                  <option>Loading formats...</option>
                ) : (
                  Object.entries(availableConfigs).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.name} - {config.description}
                    </option>
                  ))
                )}
              </select>
              {!configLoading && availableConfigs[ruleConfig] && (
                <p className="mt-2 text-sm text-gray-600">
                  Valid sets:{" "}
                  {availableConfigs[ruleConfig].validSetNums.join(", ")}
                </p>
              )}
            </div>
          </nav>

          {/* Routes */}
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  ruleConfig={ruleConfig}
                  availableConfigs={availableConfigs}
                />
              }
            />
            <Route
              path="/cards"
              element={
                <CardsPage
                  ruleConfig={ruleConfig}
                  availableConfigs={availableConfigs}
                />
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

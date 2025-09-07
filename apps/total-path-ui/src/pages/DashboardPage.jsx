import { useEffect, useState } from "react"

import {
  analyzeLorcanaData,
  getCardStatistics,
} from "../utils/dataLoader.js"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

function DashboardPage ({ ruleConfig, availableConfigs }) {
  const [analysis, setAnalysis] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data when rule config changes
  useEffect(() => {
    async function loadData () {
      setLoading(true)
      setError(null)

      try {
        const [analysisData, statsData] = await Promise.all([
          analyzeLorcanaData(ruleConfig),
          getCardStatistics(ruleConfig),
        ])

        setAnalysis(analysisData)
        setStats(statsData)
      } catch (err) {
        console.error("Error loading data:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [ruleConfig])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">Loading data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-destructive text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">
                Error Loading Data
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      {analysis && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalCards || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {availableConfigs[ruleConfig]?.name} format
              </p>
            </CardContent>
          </Card>

          {/* Average Cost */}
          <Card>
            <CardHeader>
              <CardTitle>Average Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {analysis?.averageCost || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Ink cost per card</p>
            </CardContent>
          </Card>

          {/* Card Types */}
          <Card>
            <CardHeader>
              <CardTitle>Card Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats?.typeDistribution ? Object.entries(stats.typeDistribution).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-sm text-muted-foreground capitalize">
                      {type}
                    </span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Color Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats?.colorDistribution ? Object.entries(stats.colorDistribution)
                  .slice(0, 6)
                  .map(([color, count]) => (
                    <div key={color} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{color}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  )) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cost Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats?.costDistribution ? Object.entries(stats.costDistribution)
                  .slice(0, 6)
                  .map(([cost, count]) => (
                    <div key={cost} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cost {cost}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  )) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default DashboardPage

export default function AdminHeatmapTab({ heatmap }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Donation Density Heatmap</h2>
      <p className="text-xs text-gray-400 mb-4">Top 200 donation clusters (last 30 days) — grouped by ~1km grid cells</p>

      {heatmap.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No geospatial data available yet</p>
      ) : (
        <>
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1 mb-6">
            {heatmap.slice(0, 50).map((cell, i) => {
              const maxIntensity = Math.max(...heatmap.map((h) => h.intensity)) || 1;
              const opacity = Math.max(0.15, cell.intensity / maxIntensity);
              return (
                <div
                  key={i}
                  className="aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold text-white cursor-default transition-transform hover:scale-110"
                  style={{ backgroundColor: `rgba(239, 68, 68, ${opacity})` }}
                  title={`Lat: ${cell.lat}, Lng: ${cell.lng}\nDonations: ${cell.intensity}\nQuantity: ${cell.quantity}`}
                >
                  {cell.intensity}
                </div>
              );
            })}
          </div>

          <h3 className="text-xs font-semibold text-gray-600 mb-2">Top Hotspots</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">#</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Location</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Donations</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Total Qty</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Density</th>
                </tr>
              </thead>
              <tbody>
                {heatmap.slice(0, 15).map((cell, i) => {
                  const maxI = Math.max(...heatmap.map((h) => h.intensity)) || 1;
                  const densityPct = Math.round((cell.intensity / maxI) * 100);
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2 text-gray-400 tabular-nums">{i + 1}</td>
                      <td className="py-2 text-gray-700 font-mono text-[10px] tabular-nums">{cell.lat.toFixed(2)}, {cell.lng.toFixed(2)}</td>
                      <td className="py-2 text-right font-medium text-gray-900 tabular-nums">{cell.intensity}</td>
                      <td className="py-2 text-right text-gray-600 tabular-nums">{cell.quantity}</td>
                      <td className="py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <div className="w-12 bg-gray-100 rounded-full h-1.5">
                            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${densityPct}%` }} />
                          </div>
                          <span className="text-gray-500 tabular-nums">{densityPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

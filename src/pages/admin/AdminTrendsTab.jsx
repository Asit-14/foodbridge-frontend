export default function AdminTrendsTab({ trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Waste Reduction Trend (12 weeks)</h2>
      {trend.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No trend data available yet</p>
      ) : (
        <>
          <div className="flex items-end gap-1 h-40 mb-4">
            {trend.map((w) => {
              const maxCreated = Math.max(...trend.map((t) => t.created)) || 1;
              const deliveredH = Math.max(4, (w.delivered / maxCreated) * 100);
              const expiredH = Math.max(2, (w.expired / maxCreated) * 100);
              return (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-0.5" title={`${w.week}: ${w.delivered} delivered, ${w.expired} expired`}>
                  <div className="w-full flex flex-col items-center justify-end h-full gap-0.5">
                    <div className="w-full max-w-[20px] bg-emerald-400 rounded-t" style={{ height: `${deliveredH}%` }} />
                    <div className="w-full max-w-[20px] bg-rose-400 rounded-t" style={{ height: `${expiredH}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded" /> Delivered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-400 rounded" /> Expired</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">Week</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Created</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Delivered</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Expired</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Saved</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Wasted</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((w) => (
                  <tr key={w.week} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2 font-medium text-gray-700">{w.week}</td>
                    <td className="py-2 text-right text-gray-600 tabular-nums">{w.created}</td>
                    <td className="py-2 text-right text-emerald-600 font-medium tabular-nums">{w.delivered}</td>
                    <td className="py-2 text-right text-rose-500 tabular-nums">{w.expired}</td>
                    <td className="py-2 text-right text-gray-600 tabular-nums">{w.quantitySaved}</td>
                    <td className="py-2 text-right text-gray-600 tabular-nums">{w.quantityWasted}</td>
                    <td className="py-2 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        parseInt(w.wasteReductionRate) >= 70
                          ? 'bg-emerald-100 text-emerald-700'
                          : parseInt(w.wasteReductionRate) >= 40
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {w.wasteReductionRate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

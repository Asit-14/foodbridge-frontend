export default function AdminImpactTab({ impact }) {
  if (!impact) return null;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-3xl font-bold text-emerald-600 tabular-nums">{impact.totalDelivered}</p>
          <p className="text-xs text-gray-500 mt-1">Successful Deliveries</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-3xl font-bold text-primary-600 tabular-nums">{impact.totalBeneficiaries.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">People Fed</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-3xl font-bold text-amber-600 tabular-nums">{impact.estimatedCO2SavedKg.toLocaleString()} kg</p>
          <p className="text-xs text-gray-500 mt-1">CO2 Emissions Prevented</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Environmental Impact Summary</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Donations Created</p>
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{impact.totalDonations}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Waste Reduction Rate</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">{impact.wasteReductionRate}</p>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: impact.wasteReductionRate }}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Food Quantity Saved</p>
            <p className="text-2xl font-bold text-primary-600 tabular-nums">{impact.totalQuantitySaved.toLocaleString()} servings</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Donations Expired</p>
            <p className="text-2xl font-bold text-rose-500 tabular-nums">{impact.totalExpired}</p>
            <p className="text-[10px] text-gray-400">Every expired donation is a missed opportunity</p>
          </div>
        </div>
      </div>

      {/* CO2 equivalence */}
      <div className="bg-primary-50 rounded-2xl border border-primary-200 p-6">
        <h2 className="text-sm font-semibold text-primary-800 mb-3">What does {impact.estimatedCO2SavedKg} kg CO2 saved mean?</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-2xl mb-1">🌳</p>
            <p className="text-lg font-bold text-primary-700 tabular-nums">{Math.round(impact.estimatedCO2SavedKg / 22)}</p>
            <p className="text-[10px] text-gray-600">Trees worth of CO2 absorbed/year</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-2xl mb-1">🚗</p>
            <p className="text-lg font-bold text-primary-700 tabular-nums">{Math.round(impact.estimatedCO2SavedKg / 0.21).toLocaleString()}</p>
            <p className="text-[10px] text-gray-600">km of driving avoided</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-2xl mb-1">💡</p>
            <p className="text-lg font-bold text-primary-700 tabular-nums">{Math.round(impact.estimatedCO2SavedKg / 0.4).toLocaleString()}</p>
            <p className="text-[10px] text-gray-600">kWh of energy equivalent</p>
          </div>
        </div>
      </div>
    </>
  );
}

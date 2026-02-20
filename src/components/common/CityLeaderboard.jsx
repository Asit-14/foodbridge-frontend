import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { adminService } from '../../services/endpoints';

const RANK_COLORS = {
  1: 'bg-amber-400 text-white',
  2: 'bg-gray-300 text-white',
  3: 'bg-amber-600 text-white',
};

function RankBadge({ rank }) {
  const color = RANK_COLORS[rank] || 'bg-gray-100 text-gray-600';
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${color}`}
    >
      {rank}
    </span>
  );
}

function LeaderboardCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function DonorCitiesTable({ cities }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-sm font-medium text-gray-500 px-5 py-2.5 w-10">#</th>
          <th className="text-left text-sm font-medium text-gray-500 px-3 py-2.5">City</th>
          <th className="text-right text-sm font-medium text-gray-500 px-5 py-2.5">Donations</th>
        </tr>
      </thead>
      <tbody>
        {cities.map((city, i) => (
          <tr key={city.citySlug} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-2.5">
              <RankBadge rank={i + 1} />
            </td>
            <td className="px-3 py-2.5">
              <div className="text-sm font-semibold text-gray-800">{city.city}</div>
              <div className="text-xs text-gray-500">{city.state}</div>
            </td>
            <td className="text-right px-5 py-2.5 text-sm text-gray-800 tabular-nums">
              {city.totalDonations.toLocaleString()}
            </td>
          </tr>
        ))}
        {cities.length === 0 && (
          <tr>
            <td colSpan={3} className="text-center text-sm text-gray-400 py-6">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function NGOCitiesTable({ cities }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-sm font-medium text-gray-500 px-5 py-2.5 w-10">#</th>
          <th className="text-left text-sm font-medium text-gray-500 px-3 py-2.5">City</th>
          <th className="text-right text-sm font-medium text-gray-500 px-5 py-2.5 w-36">
            Success Rate
          </th>
        </tr>
      </thead>
      <tbody>
        {cities.map((city, i) => (
          <tr key={city.citySlug} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-2.5">
              <RankBadge rank={i + 1} />
            </td>
            <td className="px-3 py-2.5">
              <div className="text-sm font-semibold text-gray-800">{city.city}</div>
              <div className="text-xs text-gray-500">{city.state}</div>
            </td>
            <td className="px-5 py-2.5">
              <div className="flex items-center justify-end gap-2">
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(city.successRate, 100)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-800 tabular-nums w-12 text-right">
                  {city.successRate}%
                </span>
              </div>
            </td>
          </tr>
        ))}
        {cities.length === 0 && (
          <tr>
            <td colSpan={3} className="text-center text-sm text-gray-400 py-6">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function PeopleFedTable({ cities }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left text-sm font-medium text-gray-500 px-5 py-2.5 w-10">#</th>
          <th className="text-left text-sm font-medium text-gray-500 px-3 py-2.5">City</th>
          <th className="text-right text-sm font-medium text-gray-500 px-5 py-2.5">
            Beneficiaries
          </th>
        </tr>
      </thead>
      <tbody>
        {cities.map((city, i) => (
          <tr key={city.citySlug} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-2.5">
              <RankBadge rank={i + 1} />
            </td>
            <td className="px-3 py-2.5">
              <div className="text-sm font-semibold text-gray-800">{city.city}</div>
              <div className="text-xs text-gray-500">{city.state}</div>
            </td>
            <td className="text-right px-5 py-2.5 text-sm text-gray-800 tabular-nums">
              {city.totalBeneficiaries.toLocaleString()}
            </td>
          </tr>
        ))}
        {cities.length === 0 && (
          <tr>
            <td colSpan={3} className="text-center text-sm text-gray-400 py-6">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default function CityLeaderboard({ className = '' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getCityLeaderboard()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load leaderboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 py-8 text-center">Loading city leaderboard...</div>
    );
  }

  if (!data) return null;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      <LeaderboardCard title="Top Donor Cities (Most Active)" icon="1">
        <DonorCitiesTable cities={data.topDonorCities || []} />
      </LeaderboardCard>

      <LeaderboardCard title="Top NGO Cities (Most Efficient)" icon="2">
        <NGOCitiesTable cities={data.topNGOCities || []} />
      </LeaderboardCard>

      <LeaderboardCard title="Most People Fed by City" icon="3">
        <PeopleFedTable cities={data.mostPeopleFedCities || []} />
      </LeaderboardCard>
    </div>
  );
}

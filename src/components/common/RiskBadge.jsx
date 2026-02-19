import { useState, useEffect } from 'react';
import { donationService } from '../../services/endpoints';

const RISK_CONFIG = {
  LOW:    { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Low Risk' },
  MEDIUM: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Med Risk' },
  HIGH:   { bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500',    label: 'High Risk' },
};

export default function RiskBadge({ donationId, transportKm = 0, compact = false }) {
  const [risk, setRisk] = useState(null);

  useEffect(() => {
    if (!donationId) return;
    donationService
      .getRisk(donationId, { transportKm })
      .then(({ data }) => setRisk(data.data.risk))
      .catch(() => {});
  }, [donationId, transportKm]);

  if (!risk) return null;

  const cfg = RISK_CONFIG[risk.riskLevel] || RISK_CONFIG.LOW;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }

  return (
    <div className={`rounded-xl p-3 ${cfg.bg} border border-opacity-20`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${cfg.text} flex items-center gap-1.5`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
          {cfg.label} — {risk.riskScore}/100
        </span>
      </div>
      <p className={`text-[10px] ${cfg.text} opacity-80`}>{risk.recommendation}</p>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {Object.entries(risk.factors).map(([key, val]) => (
          <div key={key} className="text-[9px] text-gray-600">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
            <span>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

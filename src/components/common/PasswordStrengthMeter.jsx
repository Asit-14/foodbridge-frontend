import { useMemo } from 'react';

const RULES = [
  { test: (pw) => pw.length >= 8, label: 'At least 8 characters' },
  { test: (pw) => /[A-Z]/.test(pw), label: 'Uppercase letter' },
  { test: (pw) => /[a-z]/.test(pw), label: 'Lowercase letter' },
  { test: (pw) => /\d/.test(pw), label: 'Number' },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), label: 'Special character' },
];

const STRENGTH_COLORS = [
  'bg-gray-200',      // 0 rules
  'bg-rose-500',      // 1 rule
  'bg-orange-500',    // 2 rules
  'bg-amber-400',     // 3 rules
  'bg-lime-500',      // 4 rules
  'bg-emerald-500',   // 5 rules (all)
];

const STRENGTH_LABELS = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

/**
 * Password strength meter with real-time feedback.
 * Shows a progress bar and a checklist of password requirements.
 */
export default function PasswordStrengthMeter({ password }) {
  const { passed, score } = useMemo(() => {
    if (!password) return { passed: [], score: 0 };
    const results = RULES.map((r) => ({ ...r, ok: r.test(password) }));
    return { passed: results, score: results.filter((r) => r.ok).length };
  }, [password]);

  if (!password) return null;

  const pct = (score / RULES.length) * 100;

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${STRENGTH_COLORS[score]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-500 min-w-[60px] text-right">
          {STRENGTH_LABELS[score]}
        </span>
      </div>

      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
        {passed.map((rule) => (
          <li
            key={rule.label}
            className={`text-xs flex items-center gap-1.5 ${
              rule.ok ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <span className="flex-shrink-0">{rule.ok ? '✓' : '○'}</span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Validate password meets minimum strength (all 5 rules).
 * Returns array of unmet rule labels, or empty if all pass.
 */
export function validatePasswordStrength(password) {
  return RULES.filter((r) => !r.test(password)).map((r) => r.label);
}

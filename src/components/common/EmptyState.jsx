import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <span className="text-5xl block mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="inline-block mt-5">
          <Button variant="primary" size="md">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <div className="mt-5">
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

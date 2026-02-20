import Button from './Button';

export default function ErrorState({
  message = 'Something went wrong',
  onRetry,
}) {
  return (
    <div className="bg-white rounded-xl border border-rose-200 p-12 text-center">
      <span className="text-4xl block mb-4">!</span>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Error</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="outline" size="md" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

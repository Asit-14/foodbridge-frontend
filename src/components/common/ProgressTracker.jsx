import { STATUS_STEPS } from '../../utils/constants';

export default function ProgressTracker({ currentStatus }) {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center w-full gap-1">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-center">
              <div className={`h-1.5 w-full rounded-full transition-colors duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
              }`} />
            </div>
            <span className={`text-xs mt-1.5 font-medium ${
              isCurrent ? 'text-emerald-700' : isCompleted ? 'text-emerald-500' : 'text-gray-400'
            }`}>
              {step === 'PickedUp' ? 'Picked Up' : step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

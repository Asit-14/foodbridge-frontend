import { Spinner } from './Loader';

const variants = {
  primary:
    'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger:
    'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200',
  ghost:
    'hover:bg-gray-50 text-gray-600',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
  warning:
    'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
  outline:
    'border border-gray-200 hover:bg-gray-50 text-gray-700',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
  xl: 'px-6 py-3 text-sm rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}

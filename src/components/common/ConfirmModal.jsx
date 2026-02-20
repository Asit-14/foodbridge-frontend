import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="md" fullWidth onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          size="md"
          fullWidth
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

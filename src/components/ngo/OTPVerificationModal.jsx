import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function OTPVerificationModal({ donation, open, onClose, onVerify }) {
  const [otp, setOtp] = useState('');

  const handleClose = () => {
    setOtp('');
    onClose();
  };

  const handleVerify = () => {
    onVerify(otp);
    setOtp('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Verify Pickup OTP"
    >
      <p className="text-sm text-gray-600 mb-4">
        Enter the 4-digit OTP given by the donor for <strong>{donation?.foodType}</strong>.
      </p>
      <input
        type="text"
        maxLength={4}
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        className="w-full px-4 py-3 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
        placeholder="0000"
        autoFocus
      />
      <div className="flex gap-3 mt-5">
        <Button variant="secondary" size="md" fullWidth onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" size="md" fullWidth onClick={handleVerify} disabled={otp.length !== 4}>
          Verify
        </Button>
      </div>
    </Modal>
  );
}

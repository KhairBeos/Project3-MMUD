import { VerifyForm } from '../../../components/auth/VerifyForm';
import { Suspense } from 'react';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-white">Đang tải...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
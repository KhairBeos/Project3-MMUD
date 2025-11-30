import { VerifyForm } from '../../../components/auth/VerifyForm';
import { Suspense } from 'react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="text-gray-500">Đang tải...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
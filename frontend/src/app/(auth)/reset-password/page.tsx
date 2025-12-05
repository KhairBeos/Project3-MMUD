import { ResetPasswordForm } from '../../../components/auth/ResetPasswordForm';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-white">Đang tải...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

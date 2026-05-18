import { AlertCircle, CheckCircle2, MailCheck, ShieldCheck } from 'lucide-react';

export function EmailVerificationBanner({ app }) {
  const {
    authSession,
    isResendingVerification,
    resendVerificationEmail: resendVerification = async () => {},
    resendVerificationError,
    resendVerificationMessage,
    setCurrentScreen
  } = app;

  if (!authSession?.token || authSession?.user?.isVerified) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertCircle size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm">Verify your email</div>
          <p className="mt-1 text-sm leading-5 text-amber-900">
            Confirm {authSession.user?.email || 'your email'} to show your account is verified.
          </p>
          {resendVerificationMessage ? (
            <p className="mt-2 text-xs font-semibold text-green-700">{resendVerificationMessage}</p>
          ) : null}
          {resendVerificationError ? (
            <p className="mt-2 text-xs font-semibold text-red-600">{resendVerificationError}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resendVerification}
              disabled={isResendingVerification}
              className="rounded-full bg-amber-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-70"
            >
              {isResendingVerification ? 'Sending...' : 'Resend email'}
            </button>
            <button
              type="button"
              onClick={() => setCurrentScreen('verification')}
              className="rounded-full bg-white px-4 py-2 text-xs font-bold text-amber-700 ring-1 ring-amber-200 transition-colors hover:bg-amber-100"
            >
              Verification status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifiedBadge({ isVerified, className = '' }) {
  if (!isVerified) {
    return null;
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 ${className}`}>
      <ShieldCheck size={14} />
      Verified
    </span>
  );
}

export function VerificationStateIcon({ state }) {
  if (state === 'success') {
    return (
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 size={54} />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle size={54} />
      </div>
    );
  }

  return (
    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 text-purple-600">
      <MailCheck size={54} />
    </div>
  );
}

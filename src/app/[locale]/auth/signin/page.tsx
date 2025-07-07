// src/app/auth/signin/page.tsx

import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
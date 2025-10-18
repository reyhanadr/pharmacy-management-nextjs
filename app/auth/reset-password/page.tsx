import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Atur Ulang Kata Sandi | Chattize",
  description: "Buat kata sandi baru untuk akun Anda",
};

export default function ResetPasswordPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}

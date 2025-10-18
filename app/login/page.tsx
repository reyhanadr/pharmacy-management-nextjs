import { AuthForm } from "@/components/auth/auth-form";
import { Suspense } from 'react';
// import OneTapComponent from "@/components/auth/OneTapComponent";

export default function LoginPage() {
  // const router = useRouter();

  // const handleSuccess = () => {
  //   router.push('/');
  //   router.refresh();
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <AuthForm 
        // onSuccess={handleSuccess}
        // heading="Masuk ke Akun Anda"
        // subheading="Masukkan email dan password Anda untuk melanjutkan"
      />
      {/* <OneTapComponent /> */}
      </Suspense>
    </div>
  );
}

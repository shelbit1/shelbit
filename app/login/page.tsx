import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted">
          Загрузка...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

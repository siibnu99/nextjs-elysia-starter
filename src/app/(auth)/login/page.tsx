import { LoginForm } from "./_components/login-form";

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <LoginForm />
    </div>
  );
}

import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold">Sign in</h1>
        <p className="mb-8 text-gray-600">Welcome back.</p>
        <LoginForm />
      </div>
    </main>
  );
}

import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-1 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mb-8 text-sm text-zinc-400">Sign in to your account.</p>
        <LoginForm />
      </div>
    </main>
  );
}

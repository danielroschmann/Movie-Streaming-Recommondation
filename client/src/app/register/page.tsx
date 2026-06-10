import CreateUserForm from "../components/CreateUserForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-1 text-2xl font-bold text-white">Create an account</h1>
        <p className="mb-8 text-sm text-zinc-400">Pick your favourite genres and get started.</p>
        <CreateUserForm />
      </div>
    </main>
  );
}

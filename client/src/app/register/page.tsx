import CreateUserForm from "../components/CreateUserForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-3xl font-bold">Register</h1>
        <p className="mb-8 text-gray-600">Create an account to get started.</p>
        <CreateUserForm />
      </div>
    </main>
  );
}

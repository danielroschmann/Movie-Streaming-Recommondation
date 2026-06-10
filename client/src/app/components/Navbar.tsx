'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/lib/userService";

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    setLoggedIn(!!localStorage.getItem("isLoggedIn"));
    setFirstName(localStorage.getItem("firstName"));
  }, []);

  async function handleLogout() {
    await logoutUser();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("firstName");
    setLoggedIn(false);
    setFirstName(null);
    router.push("/login");
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-zinc-950">
      <Link href="/" className="font-bold text-lg tracking-tight text-white">
        MovieStream
      </Link>
    <div>
      <Link href="/recommended" className="font-bold text-lg tracking-tight text-white">
        Recommended Movies
      </Link>
     </div>
      <div className="flex items-center gap-4">
        {loggedIn ? (
          <>
            {firstName && (
              <span className="text-sm text-zinc-400">Logged in as: {firstName}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black hover:bg-zinc-200 transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

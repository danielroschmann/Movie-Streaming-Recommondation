'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, Genre } from "@/lib/userService";

const AVAILABLE_GENRES: Genre[] = [
  { genre_id: 28, genre_name: "Action" },
  { genre_id: 12, genre_name: "Adventure" },
  { genre_id: 16, genre_name: "Animation" },
  { genre_id: 35, genre_name: "Comedy" },
  { genre_id: 80, genre_name: "Crime" },
  { genre_id: 18, genre_name: "Drama" },
  { genre_id: 14, genre_name: "Fantasy" },
  { genre_id: 27, genre_name: "Horror" },
  { genre_id: 9648, genre_name: "Mystery" },
  { genre_id: 10749, genre_name: "Romance" },
  { genre_id: 878, genre_name: "Science Fiction" },
  { genre_id: 53, genre_name: "Thriller" },
];

const inputClass =
  "rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 transition";

export default function CreateUserForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleGenre(genre: Genre) {
    setSelectedGenres((prev) =>
      prev.some((g) => g.genre_id === genre.genre_id)
        ? prev.filter((g) => g.genre_id !== genre.genre_id)
        : [...prev, genre]
    );
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (selectedGenres.length === 0) {
      setError("Please select at least one favourite genre.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        ...form,
        role: "USER",
        favourite_genres: selectedGenres,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <label className="text-sm font-medium text-zinc-300">First name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            placeholder="John"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <label className="text-sm font-medium text-zinc-300">Last name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            placeholder="Doe"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium text-zinc-300">Favourite genres</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_GENRES.map((genre) => {
            const selected = selectedGenres.some((g) => g.genre_id === genre.genre_id);
            return (
              <button
                key={genre.genre_id}
                type="button"
                onClick={() => toggleGenre(genre)}
                className={`rounded-full px-3 py-1 text-sm border transition-colors ${
                  selected
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-400 hover:text-zinc-200"
                }`}
              >
                {genre.genre_name}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-zinc-500 text-center">
        Already have an account?{" "}
        <a href="/login" className="text-white font-medium hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}

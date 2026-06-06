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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium">First name</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-medium">Last name</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Favourite genres</label>
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
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-700 border-gray-300 hover:border-black"
                }`}
              >
                {genre.genre_name}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}

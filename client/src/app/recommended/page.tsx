'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecommendedMovies, Movie } from "@/lib/movieService";
import MovieList from "../components/MovieList";

export default function RecommendedMoviesPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRecommendedMovies()
      .then(setMovies)
      .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
          router.push("/login");
        } else {
          setError(err.message);
        }
      });
  }, []);

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Recommended Movies</h1>
      <MovieList movies={movies} />
    </main>
  );
}

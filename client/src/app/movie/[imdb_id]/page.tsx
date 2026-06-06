'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMovie, Movie } from "@/lib/movieService";

export default function MoviePage() {
  const { imdb_id } = useParams<{ imdb_id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    getMovie(imdb_id, token)
      .then(setMovie)
      .catch((err) => setError(err.message));
  }, [imdb_id]);

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  if (!movie) {
    return <p className="p-8 text-gray-500">Loading...</p>;
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm text-gray-500 hover:text-black"
      >
        ← Back
      </button>
      <div className="flex gap-8">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-48 rounded object-cover flex-shrink-0"
        />
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold">{movie.title}</h1>
          <p className="text-sm text-gray-500">{movie.imdb_id}</p>
          {movie.genre?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <span
                  key={g.genre_id}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs"
                >
                  {g.genre_name}
                </span>
              ))}
            </div>
          )}
          {movie.ranking?.ranking_name && (
            <p className="text-sm text-blue-500">{movie.ranking.ranking_name}</p>
          )}
          {movie.admin_review && (
            <p className="text-sm text-gray-700">{movie.admin_review}</p>
          )}
          {movie.youtube_id && (
            <a
              href={`https://www.youtube.com/watch?v=${movie.youtube_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 w-fit"
            >
              Watch trailer
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

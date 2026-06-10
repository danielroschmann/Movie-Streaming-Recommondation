'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactPlayer from "react-player";
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
      .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          router.push("/login");
        } else {
          setError(err.message);
        }
      });
  }, [imdb_id]);

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  if (!movie) {
    return (
      <main className="p-8">
        <p className="text-zinc-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-8 py-10">
      <button
        onClick={() => router.back()}
        className="mb-8 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        ← Back
      </button>

      <div className="flex gap-10 mb-10">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-52 rounded-xl object-cover flex-shrink-0 shadow-2xl"
        />
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">{movie.imdb_id}</p>
          </div>

          {movie.genre?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {movie.genre.map((g) => (
                <span
                  key={g.genre_id}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
                >
                  {g.genre_name}
                </span>
              ))}
            </div>
          )}

          {movie.ranking?.ranking_name && (
            <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">
              {movie.ranking.ranking_name}
            </span>
          )}

          {movie.admin_review && (
            <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-4">
              {movie.admin_review}
            </p>
          )}
        </div>
      </div>

      {movie.youtube_id && (
        <div className="rounded-xl overflow-hidden">
          <div className="relative w-full aspect-video">
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${movie.youtube_id}`}
              width="100%"
              height="100%"
              controls
              style={{ position: "absolute", top: 0, left: 0 }}
            />
          </div>
        </div>
      )}
    </main>
  );
}

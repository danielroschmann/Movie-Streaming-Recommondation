'use client';

import { Movie } from "@/lib/movieService";
import { useRouter } from "next/navigation";

type Props = {
  movie: Movie;
};

export default function MovieItem({ movie }: Props) {
  const router = useRouter();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => router.push(`/movie/${movie.imdb_id}`)}
    >
      <div className="relative overflow-hidden rounded-lg bg-zinc-800 aspect-[2/3]">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {movie.ranking?.ranking_name && (
          <span className="absolute top-2 right-2 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-black shadow">
            {movie.ranking.ranking_name}
          </span>
        )}
      </div>
      <div className="mt-2 px-0.5">
        <h5 className="text-sm font-medium text-white truncate">{movie.title}</h5>
        <p className="text-xs text-zinc-500">{movie.imdb_id}</p>
      </div>
    </div>
  );
}

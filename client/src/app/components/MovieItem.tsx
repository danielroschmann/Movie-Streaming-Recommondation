'use client';

import { Movie } from "@/lib/movieService";
import { useRouter } from "next/navigation";

type Props = {
  movie: Movie;
};

export default function MovieItem({ movie }: Props) {
  const router = useRouter();

  return (
    <div className="cursor-pointer" onClick={() => router.push(`/movie/${movie.imdb_id}`)}>
      <div className="flex-1">
        <img
          src={movie.poster_path}
          alt={movie.title}
          className="w-full rounded object-cover"
        />
        <div className="mt-2">
          <h5 className="text-sm font-bold">{movie.title}</h5>
          <p className="text-xs text-gray-500">{movie.imdb_id}</p>
        </div>
      </div>
      {movie.ranking?.ranking_name && (
        <span className="text-xs text-blue-500">{movie.ranking.ranking_name}</span>
      )}
    </div>
  );
}

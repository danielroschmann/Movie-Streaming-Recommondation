import { Movie } from "@/lib/movieService";
import MovieItem from "./MovieItem";

type Props = {
  movies: Movie[];
};

export default function MovieList({ movies }: Props) {
  if (movies.length === 0) {
    return <p className="text-gray-500">No movies found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <MovieItem key={movie.imdb_id} movie={movie} />
      ))}
    </div>
  );
}

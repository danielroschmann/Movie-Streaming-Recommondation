import { getMovies } from "@/lib/movieService";
import MovieList from "../components/MovieList";

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Movies</h1>
      <MovieList movies={movies} />
    </main>
  );
}

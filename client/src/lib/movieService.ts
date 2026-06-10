const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type Genre = {
  genre_id: number;
  genre_name: string;
};

export type Ranking = {
  ranking_value: number;
  ranking_name: string;
};

export type Movie = {
  _id?: string;
  imdb_id: string;
  title: string;
  poster_path: string;
  youtube_id: string;
  genre: Genre[];
  admin_review: string;
  ranking: Ranking;
};

export async function getMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/movies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch movies");
  return res.json();
}

export async function getMovie(imdbId: string): Promise<Movie> {
  const res = await fetch(`${API_BASE}/movie/${imdbId}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to fetch movie");
  return res.json();
}

export async function getRecommendedMovies(): Promise<Movie[]> {
  const res = await fetch(`${API_BASE}/recommendedmovies`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Failed to fetch recommended movies");
  return res.json();
}

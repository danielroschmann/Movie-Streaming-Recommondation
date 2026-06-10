const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type Genre = {
  genre_id: number;
  genre_name: string;
};

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  favourite_genres: Genre[];
};

export type UserResponse = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  favourite_genres: Genre[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Registration failed");
  }
}

export async function loginUser(payload: LoginPayload): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Login failed");
  }
  return res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
}

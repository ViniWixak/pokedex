const BASE = import.meta.env.VITE_API ?? "http://localhost:3000";

export type Pokemon = {
  id: number;
  name: string;
  types: string[];
  height?: number;
  weight?: number;
  abilities: string[];
};

export type CreatePokemon = {
  name: string;
  types: string[];
  height?: number;
  weight?: number;
  abilities?: string[];
};

export type UpdatePokemon = Partial<CreatePokemon>;

export async function list(): Promise<Pokemon[]> {
  const res = await fetch(`${BASE}/pokemons`);
  if (!res.ok) throw new Error(`GET /pokemons -> ${res.status}`);
  return res.json();
}

export async function create(body: CreatePokemon): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokemons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Create failed");
  return res.json();
}

export async function update(id: number, body: UpdatePokemon): Promise<Pokemon> {
  const res = await fetch(`${BASE}/pokemons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");
  return res.json();
}

export async function remove(id: number): Promise<void> {
  const res = await fetch(`${BASE}/pokemons/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error((await res.json()).error ?? "Delete failed");
  }
}

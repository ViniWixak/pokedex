const BASE = import.meta.env.VITE_API ?? "http://localhost:3000";
export type Pokemon = {
  id: number; name: string; types: string[];
  height?: number; weight?: number; abilities: string[];
};
export async function list(): Promise<Pokemon[]> {
  const res = await fetch(`${BASE}/pokemons`); return res.json();
}
export async function create(body: { name: string; types: string[] }) {
  const res = await fetch(`${BASE}/pokemons`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json()).error ?? "Error");
  return res.json();
}

import { z } from "zod";

const PokeApiSchema = z.object({
  name: z.string(),
  types: z.array(z.object({ type: z.object({ name: z.string() }) })),
  height: z.number().optional(),
  weight: z.number().optional(),
  abilities: z.array(z.object({ ability: z.object({ name: z.string() }) })),
});

export interface IPokeApiClient {
  fetchByName(name: string): Promise<{
    canonicalName: string;
    types: string[];
    height?: number;   
    weight?: number;
    abilities: string[];
  } | null>;
}

export class PokeApiClient implements IPokeApiClient {
  private readonly base = "https://pokeapi.co/api/v2";

  async fetchByName(name: string) {
    const res = await fetch(`${this.base}/pokemon/${encodeURIComponent(name.toLowerCase())}`);
    if (!res.ok) return null;

    const json = PokeApiSchema.parse(await res.json());

    const result: {
      canonicalName: string;
      types: string[];
      height?: number;
      weight?: number;
      abilities: string[];
    } = {
      canonicalName: json.name,
      types: json.types.map(t => t.type.name),
      abilities: json.abilities.map(a => a.ability.name),
    };
    if (json.height != null) result.height = json.height;
    if (json.weight != null) result.weight = json.weight;

    return result;
  }
}

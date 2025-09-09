import type { IPokemonRepository } from "../src/repositories/pokemon.repository.js";
import type { IPokeApiClient } from "../src/integrations/pokeapi.client.js";
import type { Pokemon, PokemonBase } from "../src/domain/pokemon.js";
import { vi } from "vitest";

export function mockRepo(overrides: Partial<IPokemonRepository> = {}): IPokemonRepository {
  return {
    create: vi.fn(async (data: PokemonBase) => ({
      id: 1,
      ...data
    } as Pokemon)),
    findAll: vi.fn(async () => []),
    findById: vi.fn(async () => null),
    findByName: vi.fn(async () => null),
    update: vi.fn(async (_id: number, data: Partial<PokemonBase>) => ({
      id: _id,
      name: (data as any).name ?? "pikachu",
      types: (data as any).types ?? ["electric"],
      height: (data as any).height,
      weight: (data as any).weight,
      abilities: (data as any).abilities ?? []
    })),
    delete: vi.fn(async () => {}),
    ...overrides
  };
}

export function mockPokeApi(overrides: Partial<IPokeApiClient> = {}): IPokeApiClient {
  return {
    fetchByName: vi.fn(async (_name: string) => ({
      canonicalName: "pikachu",
      types: ["electric"],
      height: 4,
      weight: 60,
      abilities: ["static"]
    })),
    ...overrides
  } as IPokeApiClient;
}

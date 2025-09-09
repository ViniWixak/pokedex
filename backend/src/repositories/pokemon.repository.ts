import type { Pokemon, PokemonBase } from "../domain/pokemon.js";

export interface IPokemonRepository {
  create(data: PokemonBase): Promise<Pokemon>;
  findAll(): Promise<Pokemon[]>;
  findById(id: number): Promise<Pokemon | null>;
  findByName(name: string): Promise<Pokemon | null>;
  update(id: number, data: Partial<PokemonBase>): Promise<Pokemon>;
  delete(id: number): Promise<void>;
}

import { db } from "../db/connection.js";
import { pokemons } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { IPokemonRepository } from "./pokemon.repository.js";
import type { Pokemon, PokemonBase } from "../domain/pokemon.js";

export class SqlitePokemonRepository implements IPokemonRepository {
  async create(data: PokemonBase): Promise<Pokemon> {
    const inserted = await db.insert(pokemons).values({
      name: data.name,
      types: JSON.stringify(data.types),
      height: data.height ?? null,
      weight: data.weight ?? null,
      abilities: JSON.stringify(data.abilities ?? []),
    }).returning();
    return this.rowToModel(inserted[0]);
  }

  async findAll(): Promise<Pokemon[]> {
    const rows = await db.select().from(pokemons);
    return rows.map(this.rowToModel);
  }

  async findById(id: number): Promise<Pokemon | null> {
    const rows = await db.select().from(pokemons).where(eq(pokemons.id, id));
    return rows[0] ? this.rowToModel(rows[0]) : null;
  }

  async findByName(name: string): Promise<Pokemon | null> {
    const rows = await db.select().from(pokemons).where(eq(pokemons.name, name));
    return rows[0] ? this.rowToModel(rows[0]) : null;
  }

  async update(id: number, data: Partial<PokemonBase>): Promise<Pokemon> {
    const current = await this.findById(id);
    if (!current) throw new Error("not_found");
    const merged = {
      name: data.name ?? current.name,
      types: JSON.stringify(data.types ?? current.types),
      height: data.height ?? current.height ?? null,
      weight: data.weight ?? current.weight ?? null,
      abilities: JSON.stringify(data.abilities ?? current.abilities),
    };
    const updated = await db.update(pokemons).set(merged).where(eq(pokemons.id, id)).returning();
    return this.rowToModel(updated[0]);
  }

  async delete(id: number): Promise<void> {
    await db.delete(pokemons).where(eq(pokemons.id, id));
  }

  private rowToModel = (row: any): Pokemon => ({
    id: row.id,
    name: row.name,
    types: JSON.parse(row.types),
    height: row.height ?? undefined,
    weight: row.weight ?? undefined,
    abilities: JSON.parse(row.abilities),
  });
}

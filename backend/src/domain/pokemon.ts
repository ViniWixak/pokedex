import { z }  from "zod";

export const PokemonBaseSchema = z.object({
  name: z.string().min(1),
  types: z.array(z.string()).nonempty().max(3),
  height: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional(),
  abilities: z.array(z.string()).optional().default([]),
});

export type PokemonBase = z.infer<typeof PokemonBaseSchema>;

type PokemonConstructor =
  Pick<PokemonBase, "name" | "types"> & {
    id?: number | null;
    height?: number | null;
    weight?: number | null;
    abilities?: string[] | null;
  };

const toUndef = <T>(v: T | null | undefined): T | undefined =>
  v == null ? undefined : v;

export interface Pokemon extends PokemonBase {
  id: number;
}

export enum ExternalSource {
  POKEAPI = "pokeapi",
}

export class PokemonEntity {
  public readonly id?: number;
  public readonly name: string;
  public readonly types: readonly string[];
  public readonly height?: number;
  public readonly weight?: number;
  public readonly abilities: readonly string[];

  constructor(data: PokemonConstructor) {
    const base = PokemonBaseSchema.pick({ name: true, types: true }).parse(data);
    this.name = base.name;
    this.types = base.types;

    if (data.id != null) this.id = data.id;
    if (data.height != null) this.height = data.height;
    if (data.weight != null) this.weight = data.weight;

    this.abilities = data.abilities ?? [];
  }
}

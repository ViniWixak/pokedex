import { z } from "zod";
import { PokemonBaseSchema, type PokemonBase } from "../domain/pokemon.js";
import { AppError, NotFoundError, ConflictError } from "../domain/errors.js";
import type { IPokemonRepository } from "../repositories/pokemon.repository.js";
import type { IPokeApiClient } from "../integrations/pokeapi.client.js";
import { PokemonEntity } from "../domain/pokemon.js";

const UpdateSchema = z.object({
    name: z.string().min(1).optional(),
    types: z.array(z.string()).nonempty().max(3).optional(),
    height: z.number().int().positive().optional(),
    weight: z.number().int().positive().optional(),
    abilities: z.array(z.string()).optional(),
});

export class PokemonService {
    constructor(
        private readonly repo: IPokemonRepository,
        private readonly pokeapi: IPokeApiClient
    ) { }


    async create(input: unknown) {
        const base = PokemonBaseSchema.pick({ name: true, types: true }).parse(input);
        const extras = this.pickExtras(input);

        const external = await this.pokeapi.fetchByName(base.name);
        if (!external) throw new AppError("Invalid pokemon name by PokeAPI", 422);

        const name = external.canonicalName;

        const exists = await this.repo.findByName(name);
        if (exists) throw new ConflictError("Pokemon already exists");

        const payloadForEntity: {
            name: string;
            types: string[];
            abilities?: string[];
            height?: number;
            weight?: number;
        } = {
            name,
            types: external.types.length ? external.types : base.types,
            ...(external.abilities.length
                ? { abilities: external.abilities }
                : extras.abilities ? { abilities: extras.abilities } : {}),
            ...(external.height != null
                ? { height: external.height }
                : extras.height != null ? { height: extras.height } : {}),
            ...(external.weight != null
                ? { weight: external.weight }
                : extras.weight != null ? { weight: extras.weight } : {}),
        };

        const entity = new PokemonEntity(payloadForEntity);

        return this.repo.create({
            name: entity.name,
            types: [...entity.types],
            abilities: [...(entity.abilities ?? [])],
            ...(entity.height != null ? { height: entity.height } : {}),
            ...(entity.weight != null ? { weight: entity.weight } : {}),
        });
    }

    list() {
        return this.repo.findAll();
    }

    async get(id: number) {
        const p = await this.repo.findById(id);
        if (!p) throw new NotFoundError();
        return p;
    }

    async update(id: number, patch: Partial<PokemonBase>) {
        const current = await this.repo.findById(id);
        if (!current) throw new NotFoundError();

        const valid = UpdateSchema.parse(patch);

        let name: string | undefined;
        let types: string[] | undefined;
        let height: number | undefined;
        let weight: number | undefined;
        let abilities: string[] | undefined;

        if (valid.name) {
            const external = await this.pokeapi.fetchByName(valid.name);
            if (!external) throw new AppError("Invalid pokemon name by PokeAPI", 422);
            name = external.canonicalName;

            if (!valid.types && external.types.length) types = external.types;
            if (!valid.abilities && external.abilities.length) abilities = external.abilities;
            if (valid.height == null && external.height != null) height = external.height;
            if (valid.weight == null && external.weight != null) weight = external.weight;
        }

        if (valid.types) types = valid.types;
        if (valid.abilities) abilities = valid.abilities;
        if (valid.height != null) height = valid.height;
        if (valid.weight != null) weight = valid.weight;

        const finalPatch: Partial<PokemonBase> = {
            ...(name ? { name } : {}),
            ...(types ? { types } : {}),
            ...(abilities !== undefined ? { abilities } : {}),
            ...(height != null ? { height } : {}),
            ...(weight != null ? { weight } : {}),
        };

        return this.repo.update(id, finalPatch);
    }


    delete(id: number) {
        return this.repo.delete(id);
    }

    private pickExtras(input: unknown): {
        height?: number;
        weight?: number;
        abilities?: string[];
    } {
        const Extras = z.object({
            height: z.number().int().positive().optional(),
            weight: z.number().int().positive().optional(),
            abilities: z.array(z.string()).optional(),
        }).partial();

        const parsed = Extras.safeParse(input);
        if (!parsed.success) return {};
        const { height, weight, abilities } = parsed.data;

        return {
            ...(height != null ? { height } : {}),
            ...(weight != null ? { weight } : {}),
            ...(abilities ? { abilities } : {}),
        };
    }
}
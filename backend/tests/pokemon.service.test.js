/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PokemonService } from "../src/services/pokemon.service.js";
import { AppError, ConflictError, NotFoundError } from "../src/domain/errors.js";
import { mockRepo, mockPokeApi } from "./mock.js";
let repo;
let poke;
let svc;
beforeEach(() => {
    repo = mockRepo();
    poke = mockPokeApi();
    svc = new PokemonService(repo, poke);
});
describe("PokemonService.create", () => {
    it("cria com enrich da PokeAPI e abilities sempre presentes", async () => {
        // arrange
        repo.findByName.mockResolvedValue(null);
        // act
        const result = await svc.create({ name: "pikachu", types: ["electric"] });
        // assert
        expect(repo.findByName).toHaveBeenCalledWith("pikachu");
        expect(repo.create).toHaveBeenCalledOnce();
        const args = repo.create.mock.calls[0][0];
        expect(args).toMatchObject({
            name: "pikachu",
            types: ["electric"],
            abilities: expect.any(Array) // deve existir (pelo menos [])
        });
        expect(Array.isArray(args.abilities)).toBe(true);
        expect(result.name).toBe("pikachu");
    });
    it("lança 422 quando PokeAPI não reconhece o nome", async () => {
        poke.fetchByName.mockResolvedValue(null);
        await expect(svc.create({ name: "desconhecido", types: ["fire"] })).rejects.toBeInstanceOf(AppError);
        try {
            await svc.create({ name: "desconhecido", types: ["fire"] });
        }
        catch (e) {
            expect(e.status).toBe(422);
        }
    });
    it("lança ConflictError quando já existe por nome canônico", async () => {
        repo.findByName.mockResolvedValue({
            id: 99, name: "pikachu", types: ["electric"], abilities: []
        });
        await expect(svc.create({ name: "pikachu", types: ["electric"] })).rejects.toBeInstanceOf(ConflictError);
    });
});
describe("PokemonService.get", () => {
    it("404 quando não encontra", async () => {
        repo.findById.mockResolvedValue(null);
        await expect(svc.get(123)).rejects.toBeInstanceOf(NotFoundError);
    });
    it("retorna quando encontra", async () => {
        repo.findById.mockResolvedValue({
            id: 1, name: "pikachu", types: ["electric"], abilities: []
        });
        const p = await svc.get(1);
        expect(p.id).toBe(1);
    });
});
describe("PokemonService.update", () => {
    it("enriquece ao mudar o name e aplica tipos/abilities/height/weight do externo quando patch não traz", async () => {
        repo.findById.mockResolvedValue({
            id: 1, name: "pikachu", types: ["electric"], abilities: []
        });
        poke.fetchByName.mockResolvedValue({
            canonicalName: "raichu",
            types: ["electric"],
            height: 8,
            weight: 300,
            abilities: ["static", "lightning-rod"]
        });
        await svc.update(1, { name: "Raichu" });
        expect(repo.update).toHaveBeenCalledOnce();
        const [_id, patch] = repo.update.mock.calls[0];
        expect(_id).toBe(1);
        expect(patch).toMatchObject({
            name: "raichu",
            types: ["electric"],
            abilities: ["static", "lightning-rod"],
            height: 8,
            weight: 300
        });
    });
    it("usa valores do patch quando informados (sobrescreve os do externo)", async () => {
        repo.findById.mockResolvedValue({
            id: 1, name: "pikachu", types: ["electric"], abilities: []
        });
        poke.fetchByName.mockResolvedValue({
            canonicalName: "raichu",
            types: ["electric"],
            height: 8,
            weight: 300,
            abilities: ["static"]
        });
        await svc.update(1, {
            name: "Raichu",
            types: ["electric", "speed"],
            abilities: ["custom"],
            height: 10
        });
        const [_id, patch] = repo.update.mock.calls[0];
        expect(patch).toMatchObject({
            name: "raichu",
            types: ["electric", "speed"],
            abilities: ["custom"],
            height: 10
        });
    });
    it("404 se não existe", async () => {
        repo.findById.mockResolvedValue(null);
        await expect(svc.update(1, { name: "x" })).rejects.toBeInstanceOf(NotFoundError);
    });
});
describe("PokemonService.delete", () => {
    it("chama repo.delete", async () => {
        await svc.delete(1);
        expect(repo.delete).toHaveBeenCalledWith(1);
    });
});
//# sourceMappingURL=pokemon.service.test.js.map
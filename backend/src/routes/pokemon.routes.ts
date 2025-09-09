import { Router } from "express";
import { PokemonController } from "../controllers/pokemon.controller.js";
import { PokemonService } from "../services/pokemon.service.js";
import { SqlitePokemonRepository } from "../repositories/sqlite-pokemon.repository.js";
import { PokeApiClient } from "../integrations/pokeapi.client.js";

const repo = new SqlitePokemonRepository();
const pokeapi = new PokeApiClient();
const controller = new PokemonController(new PokemonService(repo, pokeapi));

export const pokemonRouter = Router();
pokemonRouter.post("/", controller.create);
pokemonRouter.get("/", controller.list);
pokemonRouter.get("/:id", controller.get);
pokemonRouter.patch("/:id", controller.update);
pokemonRouter.delete("/:id", controller.delete);

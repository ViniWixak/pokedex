import type { Request, Response, NextFunction } from "express";
import { PokemonService } from "../services/pokemon.service.js";

export class PokemonController {
  constructor(private readonly service: PokemonService) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try { const out = await this.service.create(req.body); res.status(201).json(out); }
    catch (e) { next(e); }
  };

  list   = async (_: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.list()); } catch (e) { next(e); }
  };

  get    = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.get(Number(req.params.id))); } catch (e) { next(e); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.update(Number(req.params.id), req.body)); } catch (e) { next(e); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try { await this.service.delete(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
  };
}

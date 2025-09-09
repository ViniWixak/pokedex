import express from "express";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/openapi.js";
import { pokemonRouter } from "./routes/pokemon.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/pokemons", pokemonRouter);
app.use(errorMiddleware);

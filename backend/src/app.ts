import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/openapi.js";
import { pokemonRouter } from "./routes/pokemon.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET","POST","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/pokemons", pokemonRouter);
app.use(errorMiddleware);

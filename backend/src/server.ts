import { app } from "./app.js";
import { ensureSchema } from "./db/connection.js";

ensureSchema();

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () =>
  console.log(`API trocando o texto daqui on http://localhost:${PORT} (docs: /docs)`)
);

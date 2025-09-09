import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("pokedex.db"); 

export const db = drizzle(sqlite);

export function ensureSchema() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS pokemons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      types TEXT NOT NULL,
      height INTEGER,
      weight INTEGER,
      abilities TEXT NOT NULL
    );
  `);
}

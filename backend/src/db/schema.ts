import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const pokemons = sqliteTable("pokemons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  types: text("types").notNull(),       
  height: integer("height"),
  weight: integer("weight"),
  abilities: text("abilities").notNull()
});

export const openapi = {
  openapi: "3.0.3",
  info: { title: "Escale Pokedex API", version: "1.0.0" },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    schemas: {
      Pokemon: {
        type: "object",
        required: ["id", "name", "types", "abilities"],
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "pikachu" },
          types: { type: "array", items: { type: "string" }, example: ["electric"] },
          height: { type: "integer", nullable: true, example: 4 },
          weight: { type: "integer", nullable: true, example: 60 },
          abilities: { type: "array", items: { type: "string" }, example: ["static", "lightning-rod"] }
        }
      },
      PokemonCreate: {
        type: "object",
        required: ["name", "types"],
        properties: {
          name: { type: "string", example: "pikachu" },
          types: { type: "array", items: { type: "string" }, example: ["electric"] },
          height: { type: "integer", nullable: true, example: 4 },
          weight: { type: "integer", nullable: true, example: 60 },
          abilities: { type: "array", items: { type: "string" }, example: ["static"] }
        }
      },
      PokemonUpdate: {
        type: "object",
        properties: {
          name: { type: "string" },
          types: { type: "array", items: { type: "string" } },
          height: { type: "integer", nullable: true },
          weight: { type: "integer", nullable: true },
          abilities: { type: "array", items: { type: "string" } }
        }
      },
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string", example: "Invalid pokemon name by PokeAPI" } }
      }
    }
  },
  paths: {
    "/pokemons": {
      get: {
        summary: "List Pokemons",
        responses: {
          "200": { description: "OK", content: { "application/json": {
            schema: { type: "array", items: { $ref: "#/components/schemas/Pokemon" } }
          }}}
        }
      },
      post: {
        summary: "Create Pokemon",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PokemonCreate" },
              examples: {
                basic: {
                  value: { name: "pikachu", types: ["electric"] }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Pokemon" } } } },
          "409": { description: "Conflict", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "422": { description: "Unprocessable Entity", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    },
    "/pokemons/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        summary: "Get by id",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Pokemon" } } } },
          "404": { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      patch: {
        summary: "Update",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PokemonUpdate" } } }
        },
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Pokemon" } } } },
          "404": { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      },
      delete: {
        summary: "Delete",
        responses: {
          "204": { description: "No Content" },
          "404": { description: "Not Found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
        }
      }
    }
  }
};

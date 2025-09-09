import { vi } from "vitest";
export function mockRepo(overrides = {}) {
    return {
        create: vi.fn(async (data) => ({
            id: 1,
            ...data
        })),
        findAll: vi.fn(async () => []),
        findById: vi.fn(async () => null),
        findByName: vi.fn(async () => null),
        update: vi.fn(async (_id, data) => ({
            id: _id,
            name: data.name ?? "pikachu",
            types: data.types ?? ["electric"],
            height: data.height,
            weight: data.weight,
            abilities: data.abilities ?? []
        })),
        delete: vi.fn(async () => { }),
        ...overrides
    };
}
export function mockPokeApi(overrides = {}) {
    return {
        fetchByName: vi.fn(async (_name) => ({
            canonicalName: "pikachu",
            types: ["electric"],
            height: 4,
            weight: 60,
            abilities: ["static"]
        })),
        ...overrides
    };
}
//# sourceMappingURL=mock.js.map
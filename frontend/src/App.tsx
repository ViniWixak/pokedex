import { useEffect, useState } from "react";
import * as api from "./api";

export default function App() {
  const [data, setData] = useState<api.Pokemon[]>([]);
  const [name, setName] = useState("");
  const [types, setTypes] = useState("electric");

  async function reload() { setData(await api.list()); }
  useEffect(() => { reload(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.create({ name, types: types.split(",").map(t => t.trim()) });
      setName(""); setTypes("electric"); await reload(); alert("Criado!");
    } catch (e: any) { alert(e.message); }
  }

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>Escale Pokédex</h1>
      <form onSubmit={onCreate} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input placeholder="name (ex: pikachu)" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="types csv" value={types} onChange={e => setTypes(e.target.value)} />
        <button type="submit">Criar</button>
      </form>

      <ul>
        {data.map(p => (
          <li key={p.id}>
            <b>{p.name}</b> — types: {p.types.join(", ")} — abilities: {p.abilities?.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

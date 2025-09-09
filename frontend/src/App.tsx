import { useEffect, useState } from "react";
import * as api from "./api";
import "./app.css";

function parseCsv(s: string) {
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

export default function App() {
  const [data, setData] = useState<api.Pokemon[]>([]);
  const [name, setName] = useState("");
  const [types, setTypes] = useState("electric");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editTypes, setEditTypes] = useState("");
  const [editAbilities, setEditAbilities] = useState("");
  const [clearAbilities, setClearAbilities] = useState(false);

  const [loading, setLoading] = useState(false);

  async function reload() {
    setData(await api.list());
  }
  useEffect(() => { reload(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.create({
        name,
        types: parseCsv(types),
      });
      setName("");
      setTypes("electric");
      await reload();
      alert("Criado!");
    } catch (e: any) {
      alert(e.message ?? "Erro ao criar");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(p: api.Pokemon) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditTypes(p.types.join(", "));
    setEditAbilities((p.abilities ?? []).join(", "));
    setClearAbilities(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditTypes("");
    setEditAbilities("");
    setClearAbilities(false);
  }

  async function saveEdit() {
    if (editingId == null) return;
    try {
      setLoading(true);
      const body: api.UpdatePokemon = {};

      if (editName) body.name = editName;
      if (editTypes) body.types = parseCsv(editTypes);

      if (clearAbilities) {
        body.abilities = [];
      } else if (editAbilities.trim() !== "") {
        body.abilities = parseCsv(editAbilities);
      }
      // observação: se o campo ficar vazio e clearAbilities=false,
      // não enviamos "abilities" -> mantém o valor atual no backend

      await api.update(editingId, body);
      cancelEdit();
      await reload();
      alert("Atualizado!");
    } catch (e: any) {
      alert(e.message ?? "Erro ao atualizar");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover?")) return;
    try {
      setLoading(true);
      await api.remove(id);
      await reload();
      alert("Removido!");
    } catch (e: any) {
      alert(e.message ?? "Erro ao remover");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="center">
      <section className="card">
        <h1 style={{ margin: "0 0 16px", fontSize: 36 }}>Escale Pokédex</h1>

        <form
          onSubmit={onCreate}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 20 }}
        >
          <input
            placeholder="name (ex: pikachu)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />
          <input
            placeholder="types (csv)"
            value={types}
            onChange={(e) => setTypes(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            Criar
          </button>
        </form>

        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
          {data.map((p) => (
            <li
              key={p.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "10px 12px",
                display: "grid",
                gap: 8,
              }}
            >
              {editingId === p.id ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={inputStyle}
                      placeholder="name"
                    />
                    <input
                      value={editTypes}
                      onChange={(e) => setEditTypes(e.target.value)}
                      style={inputStyle}
                      placeholder="types (csv)"
                    />
                    <input
                      value={editAbilities}
                      onChange={(e) => {
                        setEditAbilities(e.target.value);
                        setClearAbilities(false);
                      }}
                      style={inputStyle}
                      placeholder="abilities (csv)"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={clearAbilities}
                        onChange={(e) => {
                          setClearAbilities(e.target.checked);
                          if (e.target.checked) setEditAbilities("");
                        }}
                      />
                      Limpar abilities
                    </label>

                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} disabled={loading} style={buttonStyle}>
                        Salvar
                      </button>
                      <button onClick={cancelEdit} type="button" style={secondaryButtonStyle}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <b style={{ textTransform: "lowercase" }}>{p.name}</b>{" "}
                    — types: {p.types.join(", ")} — abilities: {p.abilities?.join(", ") || "—"}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => startEdit(p)} type="button" style={buttonStyle}>
                      Editar
                    </button>
                    <button onClick={() => onDelete(p.id)} type="button" style={dangerButtonStyle}>
                      Deletar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #111827",
  background: "#111827",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "white",
  color: "#111827",
  border: "1px solid #e5e7eb",
};

const dangerButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#ef4444",
  borderColor: "#ef4444",
};

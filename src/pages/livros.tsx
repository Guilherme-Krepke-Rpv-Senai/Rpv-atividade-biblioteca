import { useState, useEffect } from "react";
import Link from "next/link";

type Livro = {
  id: string;
  titulo: string;
  autor: string;
  genero: string;
  quantidade: number;
  qtdEmprestados: number;
};

const GENEROS = [
  "Romance",
  "Ficção",
  "Drama",
  "Regionalismo",
  "Naturalismo",
  "Terror",
  "Suspense",
  "Fantasia",
  "Biografia",
  "Outro",
];

export default function Livros() {
  const [form, setForm] = useState({ titulo: "", autor: "", genero: "", quantidade: "" });
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [busca, setBusca] = useState("");

  async function carregarLivros() {
    const res = await fetch("/api/list/livros");
    const data = await res.json();
    setLivros(data.livros || []);
  }

  useEffect(() => {
    carregarLivros();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/livros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantidade: Number(form.quantidade) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: "sucesso", texto: data.mensagem });
        setForm({ titulo: "", autor: "", genero: "", quantidade: "" });
        carregarLivros();
      } else {
        setMsg({ tipo: "erro", texto: data.mensagem });
      }
    } catch {
      setMsg({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  }

  const livrosFiltrados = livros.filter(
    (l) =>
      l.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      l.autor.toLowerCase().includes(busca.toLowerCase()) ||
      l.genero.toLowerCase().includes(busca.toLowerCase())
  );

  function disponibilidade(l: Livro) {
    const disp = l.quantidade - l.qtdEmprestados;
    if (disp === 0) return { cor: "#dc2626", bg: "#fef2f2", texto: "Indisponível" };
    if (disp <= 1) return { cor: "#d97706", bg: "#fffbeb", texto: `${disp} disp.` };
    return { cor: "#16a34a", bg: "#f0fdf4", texto: `${disp} disp.` };
  }

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <nav style={styles.sidebar}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>BiblioSys</span>
        </div>
        <div style={styles.navLinks}>
          <Link href="/" style={styles.navLink}><span>🏠</span> Início</Link>
          <Link href="/usuarios" style={styles.navLink}><span>👤</span> Usuários</Link>
          <Link href="/livros" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            <span>📖</span> Livros
          </Link>
          <Link href="/emprestimos" style={styles.navLink}><span>🔄</span> Empréstimos</Link>
        </div>
      </nav>

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Cadastro de Livros</h1>
            <p style={styles.subtitle}>Gerencie o acervo da biblioteca</p>
          </div>
          <div style={styles.badge}>{livros.length} livros no acervo</div>
        </header>

        <div style={styles.content}>
          {/* Form Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardIcon}>📗</span> Novo Livro
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={{ ...styles.fieldGroup, gridColumn: "span 2" }}>
                  <label style={styles.label}>Título *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Ex: Dom Casmurro"
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Autor *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Ex: Machado de Assis"
                    value={form.autor}
                    onChange={(e) => setForm({ ...form, autor: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Gênero *</label>
                  <select
                    style={styles.input}
                    value={form.genero}
                    onChange={(e) => setForm({ ...form, genero: e.target.value })}
                    required
                  >
                    <option value="">Selecione um gênero</option>
                    {GENEROS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Quantidade *</label>
                  <input
                    style={styles.input}
                    type="number"
                    min={1}
                    placeholder="Ex: 5"
                    value={form.quantidade}
                    onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                    required
                  />
                </div>
              </div>

              {msg && (
                <div
                  style={{
                    ...styles.alert,
                    ...(msg.tipo === "sucesso" ? styles.alertSuccess : styles.alertError),
                  }}
                >
                  {msg.tipo === "sucesso" ? "✅" : "❌"} {msg.texto}
                </div>
              )}

              <button type="submit" style={styles.btn} disabled={loading}>
                {loading ? "Cadastrando..." : "Cadastrar Livro"}
              </button>
            </form>
          </div>

          {/* List Card */}
          <div style={styles.card}>
            <div style={styles.listHeader}>
              <h2 style={{ ...styles.cardTitle, margin: 0 }}>
                <span style={styles.cardIcon}>📚</span> Acervo
              </h2>
              <input
                style={{ ...styles.input, width: 240, margin: 0 }}
                type="text"
                placeholder="🔍 Buscar por título, autor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {livrosFiltrados.length === 0 ? (
              <div style={styles.empty}>
                {busca ? "Nenhum livro encontrado para essa busca." : "Nenhum livro cadastrado ainda."}
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Título</th>
                      <th style={styles.th}>Autor</th>
                      <th style={styles.th}>Gênero</th>
                      <th style={styles.th}>Qtd Total</th>
                      <th style={styles.th}>Disponibilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livrosFiltrados.map((l, i) => {
                      const disp = disponibilidade(l);
                      return (
                        <tr key={l.id} style={{ ...styles.tr, background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ ...styles.td, fontWeight: 600 }}>{l.titulo}</td>
                          <td style={styles.td}>{l.autor}</td>
                          <td style={styles.td}>
                            <span style={styles.genreBadge}>{l.genero}</span>
                          </td>
                          <td style={{ ...styles.td, textAlign: "center" as const }}>{l.quantidade}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                background: disp.bg,
                                color: disp.cor,
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              {disp.texto}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f0f4f8" },
  sidebar: { width: 220, background: "#1a2744", padding: "24px 0", display: "flex", flexDirection: "column", position: "sticky" as const, top: 0, height: "100vh" },
  logoArea: { display: "flex", alignItems: "center", gap: 10, padding: "0 24px 28px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoIcon: { fontSize: 26 },
  logoText: { color: "#fff", fontWeight: 700, fontSize: 18 },
  navLinks: { display: "flex", flexDirection: "column", padding: "20px 0" },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, fontWeight: 500 },
  navLinkActive: { color: "#fff", background: "rgba(255,255,255,0.12)", borderLeft: "3px solid #4f8ef7" },
  main: { flex: 1, padding: "32px 36px", overflow: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a2744" },
  subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  badge: { background: "#1a2744", color: "#fff", borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 600 },
  content: { display: "flex", flexDirection: "column", gap: 24 },
  card: { background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  cardTitle: { margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#1a2744", display: "flex", alignItems: "center", gap: 8 },
  cardIcon: { fontSize: 18 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1a2744", outline: "none", background: "#fff" },
  btn: { padding: "12px 24px", background: "#1a2744", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" },
  alert: { padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  theadRow: { borderBottom: "2px solid #e2e8f0" },
  th: { padding: "10px 14px", textAlign: "left" as const, fontWeight: 700, color: "#374151", fontSize: 13 },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", color: "#374151" },
  genreBadge: { background: "#e0e7ff", color: "#4338ca", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  empty: { color: "#94a3b8", textAlign: "center" as const, padding: "32px 0", fontSize: 14 },
};

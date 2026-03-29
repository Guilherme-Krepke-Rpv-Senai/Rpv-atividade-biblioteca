import { useState, useEffect } from "react";
import Link from "next/link";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
};

export default function Usuarios() {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  async function carregarUsuarios() {
    const res = await fetch("/api/list/usuarios");
    const data = await res.json();
    setUsuarios(data.usuarios || []);
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  function formatarTelefone(valor: string) {
    const digits = valor.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return valor;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: "sucesso", texto: data.mensagem });
        setForm({ nome: "", email: "", telefone: "" });
        carregarUsuarios();
      } else {
        setMsg({ tipo: "erro", texto: data.mensagem });
      }
    } catch {
      setMsg({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
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
          <Link href="/" style={styles.navLink}>
            <span>🏠</span> Início
          </Link>
          <Link href="/usuarios" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            <span>👤</span> Usuários
          </Link>
          <Link href="/livros" style={styles.navLink}>
            <span>📖</span> Livros
          </Link>
          <Link href="/emprestimos" style={styles.navLink}>
            <span>🔄</span> Empréstimos
          </Link>
        </div>
      </nav>

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Cadastro de Usuários</h1>
            <p style={styles.subtitle}>Gerencie os usuários da biblioteca</p>
          </div>
          <div style={styles.badge}>{usuarios.length} usuários</div>
        </header>

        <div style={styles.content}>
          {/* Form Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardIcon}>✏️</span> Novo Usuário
            </h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Nome completo *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Ex: João da Silva"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>E-mail *</label>
                  <input
                    style={styles.input}
                    type="email"
                    placeholder="Ex: joao@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Telefone *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={form.telefone}
                    onChange={(e) =>
                      setForm({ ...form, telefone: formatarTelefone(e.target.value) })
                    }
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
                {loading ? "Cadastrando..." : "Cadastrar Usuário"}
              </button>
            </form>
          </div>

          {/* List Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <span style={styles.cardIcon}>📋</span> Usuários Cadastrados
            </h2>
            {usuarios.length === 0 ? (
              <div style={styles.empty}>Nenhum usuário cadastrado ainda.</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Nome</th>
                      <th style={styles.th}>E-mail</th>
                      <th style={styles.th}>Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u, i) => (
                      <tr
                        key={u.id}
                        style={{ ...styles.tr, background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                      >
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={styles.avatar}>{u.nome.charAt(0).toUpperCase()}</div>
                            {u.nome}
                          </div>
                        </td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.telefone}</td>
                      </tr>
                    ))}
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
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f0f4f8",
  },
  sidebar: {
    width: 220,
    background: "#1a2744",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    position: "sticky" as const,
    top: 0,
    height: "100vh",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 24px 28px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoIcon: { fontSize: 26 },
  logoText: { color: "#fff", fontWeight: 700, fontSize: 18 },
  navLinks: { display: "flex", flexDirection: "column", padding: "20px 0" },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 24px",
    color: "rgba(255,255,255,0.65)",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
  },
  navLinkActive: {
    color: "#fff",
    background: "rgba(255,255,255,0.12)",
    borderLeft: "3px solid #4f8ef7",
  },
  main: { flex: 1, padding: "32px 36px", overflow: "auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a2744" },
  subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  badge: {
    background: "#1a2744",
    color: "#fff",
    borderRadius: 20,
    padding: "6px 16px",
    fontSize: 13,
    fontWeight: 600,
  },
  content: { display: "flex", flexDirection: "column", gap: 24 },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "24px 28px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  cardTitle: {
    margin: "0 0 20px",
    fontSize: 16,
    fontWeight: 700,
    color: "#1a2744",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cardIcon: { fontSize: 18 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
    color: "#1a2744",
    outline: "none",
    transition: "border 0.15s",
  },
  btn: {
    padding: "12px 24px",
    background: "#1a2744",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "flex-start",
    letterSpacing: 0.3,
  },
  alert: { padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  theadRow: { borderBottom: "2px solid #e2e8f0" },
  th: {
    padding: "10px 14px",
    textAlign: "left" as const,
    fontWeight: 700,
    color: "#374151",
    fontSize: 13,
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", color: "#374151" },
  userCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#1a2744",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
  },
  empty: { color: "#94a3b8", textAlign: "center" as const, padding: "32px 0", fontSize: 14 },
};

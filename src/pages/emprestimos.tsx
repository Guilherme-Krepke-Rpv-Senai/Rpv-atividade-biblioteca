import { useState, useEffect } from "react";
import Link from "next/link";

type Usuario = { id: string; nome: string; email: string; telefone: string };
type Livro = { id: string; titulo: string; autor: string; genero: string; quantidade: number; qtdEmprestados: number };
type Emprestimo = { id: string; usuarioId: string; livrosIds: string[]; dataEmprestimo: string; dataDevolucao?: string; status: string };

type Aba = "emprestar" | "devolver" | "historico";

export default function Emprestimos() {
  const [aba, setAba] = useState<Aba>("emprestar");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);

  // Emprestar
  const [usuarioSel, setUsuarioSel] = useState("");
  const [livrosSel, setLivrosSel] = useState<string[]>([]);
  const [dataEmprestimo, setDataEmprestimo] = useState(new Date().toISOString().split("T")[0]);
  const [msgEmp, setMsgEmp] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [loadingEmp, setLoadingEmp] = useState(false);

  // Devolver
  const [emprestimoSel, setEmprestimoSel] = useState("");
  const [livrosDev, setLivrosDev] = useState<string[]>([]);
  const [msgDev, setMsgDev] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [loadingDev, setLoadingDev] = useState(false);

  async function carregar() {
    const [uRes, lRes] = await Promise.all([
      fetch("/api/list/usuarios"),
      fetch("/api/list/livros"),
    ]);
    const uData = await uRes.json();
    const lData = await lRes.json();
    setUsuarios(uData.usuarios || []);
    setLivros(lData.livros || []);

    // Busca empréstimos do bd.json via endpoint (ou fallback)
    try {
      const eRes = await fetch("/api/list/emprestimos");
      if (eRes.ok) {
        const eData = await eRes.json();
        setEmprestimos(eData.emprestimos || []);
      }
    } catch { /* endpoint pode não existir ainda */ }
  }

  useEffect(() => { carregar(); }, []);

  function toggleLivro(id: string, lista: string[], setLista: (v: string[]) => void) {
    if (lista.includes(id)) setLista(lista.filter((x) => x !== id));
    else setLista([...lista, id]);
  }

  async function handleEmprestar(e: React.FormEvent) {
    e.preventDefault();
    if (!usuarioSel || livrosSel.length === 0) {
      setMsgEmp({ tipo: "erro", texto: "Selecione um usuário e ao menos um livro." });
      return;
    }
    setLoadingEmp(true);
    setMsgEmp(null);
    try {
      const res = await fetch("/api/emprestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuarioSel, livrosIds: livrosSel, dataEmprestimo }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsgEmp({ tipo: "sucesso", texto: data.mensagem || "Empréstimo realizado com sucesso!" });
        setUsuarioSel(""); setLivrosSel("" as unknown as string[]); setLivrosSel([]);
        carregar();
      } else {
        setMsgEmp({ tipo: "erro", texto: data.mensagem || "Erro ao realizar empréstimo." });
      }
    } catch {
      setMsgEmp({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoadingEmp(false);
    }
  }

  async function handleDevolver(e: React.FormEvent) {
    e.preventDefault();
    if (!emprestimoSel || livrosDev.length === 0) {
      setMsgDev({ tipo: "erro", texto: "Selecione um empréstimo e ao menos um livro para devolver." });
      return;
    }
    setLoadingDev(true);
    setMsgDev(null);
    try {
      const res = await fetch("/api/devolver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emprestimoId: emprestimoSel, livrosIds: livrosDev }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsgDev({ tipo: "sucesso", texto: data.mensagem || "Devolução realizada com sucesso!" });
        setEmprestimoSel(""); setLivrosDev([]);
        carregar();
      } else {
        setMsgDev({ tipo: "erro", texto: data.mensagem || "Erro ao devolver." });
      }
    } catch {
      setMsgDev({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoadingDev(false);
    }
  }

  const emprestimosAtivos = emprestimos.filter((e) => e.status === "ativo");
  const empSelecionado = emprestimos.find((e) => e.id === emprestimoSel);
  const livrosDoEmp = empSelecionado
    ? livros.filter((l) => empSelecionado.livrosIds.includes(l.id))
    : [];

  function nomeUsuario(id: string) {
    return usuarios.find((u) => u.id === id)?.nome || id;
  }
  function nomeLivros(ids: string[]) {
    return ids.map((id) => livros.find((l) => l.id === id)?.titulo || id).join(", ");
  }

  const livrosDisponiveis = livros.filter((l) => l.quantidade > l.qtdEmprestados);

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
          <Link href="/livros" style={styles.navLink}><span>📖</span> Livros</Link>
          <Link href="/emprestimos" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            <span>🔄</span> Empréstimos
          </Link>
        </div>
        <div style={styles.sideStats}>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{emprestimosAtivos.length}</span>
            <span style={styles.statLabel}>Ativos</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNum}>{emprestimos.filter(e => e.status === "concluído").length}</span>
            <span style={styles.statLabel}>Concluídos</span>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Empréstimos e Devoluções</h1>
            <p style={styles.subtitle}>Controle de circulação do acervo</p>
          </div>
        </header>

        {/* Tabs */}
        <div style={styles.tabs}>
          {(["emprestar", "devolver", "historico"] as Aba[]).map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(aba === t ? styles.tabActive : {}) }}
              onClick={() => setAba(t)}
            >
              {t === "emprestar" ? "📤 Emprestar" : t === "devolver" ? "📥 Devolver" : "📋 Histórico"}
            </button>
          ))}
        </div>

        {/* ABA EMPRESTAR */}
        {aba === "emprestar" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><span>📤</span> Realizar Empréstimo</h2>
            <form onSubmit={handleEmprestar} style={styles.form}>
              <div style={styles.formGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Usuário *</label>
                  <select
                    style={styles.input}
                    value={usuarioSel}
                    onChange={(e) => setUsuarioSel(e.target.value)}
                    required
                  >
                    <option value="">Selecione um usuário</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nome} — {u.email}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Data do Empréstimo *</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={dataEmprestimo}
                    onChange={(e) => setDataEmprestimo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Livros disponíveis * (selecione um ou mais)</label>
                {livrosDisponiveis.length === 0 ? (
                  <p style={{ color: "#dc2626", fontSize: 13 }}>Nenhum livro disponível no momento.</p>
                ) : (
                  <div style={styles.livrosGrid}>
                    {livrosDisponiveis.map((l) => {
                      const sel = livrosSel.includes(l.id);
                      return (
                        <div
                          key={l.id}
                          style={{ ...styles.livroCard, ...(sel ? styles.livroCardSel : {}) }}
                          onClick={() => toggleLivro(l.id, livrosSel, setLivrosSel)}
                        >
                          <div style={styles.livroCheck}>{sel ? "✅" : "⬜"}</div>
                          <div>
                            <div style={styles.livroTitulo}>{l.titulo}</div>
                            <div style={styles.livroAutor}>{l.autor}</div>
                            <div style={styles.livroDisp}>
                              {l.quantidade - l.qtdEmprestados} disponível(is)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {msgEmp && (
                <div style={{ ...styles.alert, ...(msgEmp.tipo === "sucesso" ? styles.alertSuccess : styles.alertError) }}>
                  {msgEmp.tipo === "sucesso" ? "✅" : "❌"} {msgEmp.texto}
                </div>
              )}

              <button type="submit" style={{ ...styles.btn, background: "#1a7a3c" }} disabled={loadingEmp}>
                {loadingEmp ? "Processando..." : "Confirmar Empréstimo"}
              </button>
            </form>
          </div>
        )}

        {/* ABA DEVOLVER */}
        {aba === "devolver" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><span>📥</span> Realizar Devolução</h2>
            <form onSubmit={handleDevolver} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Empréstimo Ativo *</label>
                {emprestimosAtivos.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: 13 }}>Nenhum empréstimo ativo no momento.</p>
                ) : (
                  <select
                    style={styles.input}
                    value={emprestimoSel}
                    onChange={(e) => { setEmprestimoSel(e.target.value); setLivrosDev([]); }}
                    required
                  >
                    <option value="">Selecione um empréstimo ativo</option>
                    {emprestimosAtivos.map((em) => (
                      <option key={em.id} value={em.id}>
                        {nomeUsuario(em.usuarioId)} — {new Date(em.dataEmprestimo).toLocaleDateString("pt-BR")} — {em.livrosIds.length} livro(s)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {empSelecionado && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Livros do empréstimo (selecione os que estão sendo devolvidos) *</label>
                  <div style={styles.livrosGrid}>
                    {livrosDoEmp.map((l) => {
                      const sel = livrosDev.includes(l.id);
                      return (
                        <div
                          key={l.id}
                          style={{ ...styles.livroCard, ...(sel ? styles.livroCardDevSel : {}) }}
                          onClick={() => toggleLivro(l.id, livrosDev, setLivrosDev)}
                        >
                          <div style={styles.livroCheck}>{sel ? "✅" : "⬜"}</div>
                          <div>
                            <div style={styles.livroTitulo}>{l.titulo}</div>
                            <div style={styles.livroAutor}>{l.autor}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {msgDev && (
                <div style={{ ...styles.alert, ...(msgDev.tipo === "sucesso" ? styles.alertSuccess : styles.alertError) }}>
                  {msgDev.tipo === "sucesso" ? "✅" : "❌"} {msgDev.texto}
                </div>
              )}

              <button type="submit" style={{ ...styles.btn, background: "#b45309" }} disabled={loadingDev || emprestimosAtivos.length === 0}>
                {loadingDev ? "Processando..." : "Confirmar Devolução"}
              </button>
            </form>
          </div>
        )}

        {/* ABA HISTÓRICO */}
        {aba === "historico" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}><span>📋</span> Histórico de Empréstimos</h2>
            {emprestimos.length === 0 ? (
              <div style={styles.empty}>Nenhum empréstimo registrado ainda.</div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>Usuário</th>
                      <th style={styles.th}>Livros</th>
                      <th style={styles.th}>Data Empréstimo</th>
                      <th style={styles.th}>Data Devolução</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...emprestimos].reverse().map((em, i) => (
                      <tr key={em.id} style={{ ...styles.tr, background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{nomeUsuario(em.usuarioId)}</td>
                        <td style={{ ...styles.td, fontSize: 12, maxWidth: 260 }}>{nomeLivros(em.livrosIds)}</td>
                        <td style={styles.td}>{new Date(em.dataEmprestimo).toLocaleDateString("pt-BR")}</td>
                        <td style={styles.td}>
                          {em.dataDevolucao ? new Date(em.dataDevolucao).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            background: em.status === "ativo" ? "#fef3c7" : "#f0fdf4",
                            color: em.status === "ativo" ? "#b45309" : "#16a34a",
                            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                          }}>
                            {em.status === "ativo" ? "🟡 Ativo" : "✅ Concluído"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
  navLinks: { display: "flex", flexDirection: "column", padding: "20px 0", flex: 1 },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: 14, fontWeight: 500 },
  navLinkActive: { color: "#fff", background: "rgba(255,255,255,0.12)", borderLeft: "3px solid #4f8ef7" },
  sideStats: { display: "flex", gap: 8, padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.1)" },
  statItem: { flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px", textAlign: "center" as const },
  statNum: { display: "block", color: "#fff", fontWeight: 700, fontSize: 22 },
  statLabel: { display: "block", color: "rgba(255,255,255,0.5)", fontSize: 11 },
  main: { flex: 1, padding: "32px 36px", overflow: "auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: "#1a2744" },
  subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  tabs: { display: "flex", gap: 8, marginBottom: 24 },
  tab: { padding: "10px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  tabActive: { background: "#1a2744", color: "#fff", border: "1.5px solid #1a2744" },
  card: { background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  cardTitle: { margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#1a2744", display: "flex", alignItems: "center", gap: 8 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1a2744", outline: "none", background: "#fff" },
  btn: { padding: "12px 24px", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start" },
  livrosGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 },
  livroCard: { border: "1.5px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start", background: "#fafafa", transition: "all 0.1s" },
  livroCardSel: { border: "1.5px solid #1a7a3c", background: "#f0fdf4" },
  livroCardDevSel: { border: "1.5px solid #b45309", background: "#fffbeb" },
  livroCheck: { fontSize: 16, marginTop: 2 },
  livroTitulo: { fontWeight: 700, fontSize: 13, color: "#1a2744" },
  livroAutor: { fontSize: 12, color: "#64748b" },
  livroDisp: { fontSize: 11, color: "#16a34a", fontWeight: 600, marginTop: 2 },
  alert: { padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 500 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  theadRow: { borderBottom: "2px solid #e2e8f0" },
  th: { padding: "10px 14px", textAlign: "left" as const, fontWeight: 700, color: "#374151", fontSize: 13 },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", color: "#374151" },
  empty: { color: "#94a3b8", textAlign: "center" as const, padding: "32px 0", fontSize: 14 },
};

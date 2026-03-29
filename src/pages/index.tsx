import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({ usuarios: 0, livros: 0, emprestimos: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [uRes, lRes, eRes] = await Promise.all([
          fetch("/api/list/usuarios"),
          fetch("/api/list/livros"),
          fetch("/api/list/emprestimos"),
        ]);
        const u = await uRes.json();
        const l = await lRes.json();
        const e = await eRes.json();
        setStats({
          usuarios: (u.usuarios || []).length,
          livros: (l.livros || []).length,
          emprestimos: (e.emprestimos || []).filter((em: { status: string }) => em.status === "ativo").length,
        });
      } catch { /* silent */ }
    }
    loadStats();
  }, []);

  return (
    <div style={styles.page}>
      <nav style={styles.sidebar}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>📚</span>
          <span style={styles.logoText}>BiblioSys</span>
        </div>
        <div style={styles.navLinks}>
          <Link href="/" style={{ ...styles.navLink, ...styles.navLinkActive }}><span>🏠</span> Início</Link>
          <Link href="/usuarios" style={styles.navLink}><span>👤</span> Usuários</Link>
          <Link href="/livros" style={styles.navLink}><span>📖</span> Livros</Link>
          <Link href="/emprestimos" style={styles.navLink}><span>🔄</span> Empréstimos</Link>
        </div>
      </nav>

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Sistema de Biblioteca</h1>
            <p style={styles.subtitle}>Bem-vindo ao painel de gerenciamento</p>
          </div>
        </header>

        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: "4px solid #1a2744" }}>
            <div style={styles.statIcon}>👤</div>
            <div style={styles.statNum}>{stats.usuarios}</div>
            <div style={styles.statLabel}>Usuários Cadastrados</div>
            <Link href="/usuarios" style={styles.statLink}>Gerenciar →</Link>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #4338ca" }}>
            <div style={styles.statIcon}>📖</div>
            <div style={styles.statNum}>{stats.livros}</div>
            <div style={styles.statLabel}>Livros no Acervo</div>
            <Link href="/livros" style={styles.statLink}>Gerenciar →</Link>
          </div>
          <div style={{ ...styles.statCard, borderTop: "4px solid #b45309" }}>
            <div style={styles.statIcon}>🔄</div>
            <div style={styles.statNum}>{stats.emprestimos}</div>
            <div style={styles.statLabel}>Empréstimos Ativos</div>
            <Link href="/emprestimos" style={styles.statLink}>Gerenciar →</Link>
          </div>
        </div>

        <div style={styles.quickLinks}>
          <h2 style={styles.sectionTitle}>Acesso Rápido</h2>
          <div style={styles.quickGrid}>
            <Link href="/usuarios" style={styles.quickCard}>
              <span style={styles.quickIcon}>👤</span>
              <span style={styles.quickLabel}>Cadastrar Usuário</span>
            </Link>
            <Link href="/livros" style={styles.quickCard}>
              <span style={styles.quickIcon}>📗</span>
              <span style={styles.quickLabel}>Cadastrar Livro</span>
            </Link>
            <Link href="/emprestimos" style={styles.quickCard}>
              <span style={styles.quickIcon}>📤</span>
              <span style={styles.quickLabel}>Novo Empréstimo</span>
            </Link>
            <Link href="/emprestimos" style={styles.quickCard}>
              <span style={styles.quickIcon}>📥</span>
              <span style={styles.quickLabel}>Registrar Devolução</span>
            </Link>
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
  main: { flex: 1, padding: "32px 36px" },
  header: { marginBottom: 32 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: "#1a2744" },
  subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: 15 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 36 },
  statCard: { background: "#fff", borderRadius: 12, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", gap: 6 },
  statIcon: { fontSize: 28 },
  statNum: { fontSize: 36, fontWeight: 800, color: "#1a2744" },
  statLabel: { color: "#64748b", fontSize: 14 },
  statLink: { color: "#4f8ef7", fontSize: 13, fontWeight: 600, textDecoration: "none", marginTop: 4 },
  quickLinks: {},
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#1a2744", marginBottom: 16 },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  quickCard: { background: "#fff", borderRadius: 12, padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textDecoration: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
  quickIcon: { fontSize: 32 },
  quickLabel: { fontSize: 13, fontWeight: 600, color: "#374151", textAlign: "center" as const },
};

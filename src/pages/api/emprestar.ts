import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// nao entendi nada disso aqui professor.

const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ mensagem: 'Método não permitido.' });
    }

    const { usuarioId, livrosIds, dataEmprestimo } = req.body;

    if (!usuarioId || !livrosIds || !Array.isArray(livrosIds) || livrosIds.length === 0 || !dataEmprestimo) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: usuarioId, livrosIds (array) e dataEmprestimo.' });
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(jsonData);

    // 1. Verificar se o usuário existe
    const usuario = parsed.usuarios.find((u) => u.id === usuarioId);
    if (!usuario) {
        return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    // 2. Verificar se todos os livros existem
    for (const livroId of livrosIds) {
        const livro = parsed.livros.find((l) => l.id === livroId);
        if (!livro) {
            return res.status(404).json({ mensagem: `Livro com id "${livroId}" não encontrado.` });
        }
    }

    // 3. Verificar disponibilidade de cada livro
    for (const livroId of livrosIds) {
        const livro = parsed.livros.find((l) => l.id === livroId);
        if (livro.quantidade <= livro.qtdEmprestados) {
            return res.status(400).json({ mensagem: `Livro "${livro.titulo}" não possui unidades disponíveis.` });
        }
    }

    // 4. Incrementar qtdEmprestados de cada livro
    parsed.livros = parsed.livros.map((livro) => {
        if (livrosIds.includes(livro.id)) {
            return { ...livro, qtdEmprestados: livro.qtdEmprestados + 1 };
        }
        return livro;
    });

    // 5. Criar registro do empréstimo
    const novoEmprestimo = {
        id: uuidv4(),
        usuarioId,
        livrosIds,
        dataEmprestimo,
        status: 'ativo',
    };

    parsed.emprestimos = parsed.emprestimos || [];
    parsed.emprestimos.push(novoEmprestimo);

    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    return res.status(200).json({ mensagem: 'Empréstimo realizado com sucesso!', emprestimo: novoEmprestimo });
}
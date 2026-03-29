import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src', 'pages', 'api', 'bd.json');

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ mensagem: 'Método não permitido.' });
    }

    const { emprestimoId, livrosIds } = req.body;

    if (!emprestimoId || !livrosIds || !Array.isArray(livrosIds) || livrosIds.length === 0) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios: emprestimoId e livrosIds (array).' });
    }

    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(jsonData);

    // 1. Localizar o empréstimo ativo
    const emprestimo = parsed.emprestimos.find((e) => e.id === emprestimoId);
    if (!emprestimo) {
        return res.status(404).json({ mensagem: 'Empréstimo não encontrado.' });
    }
    if (emprestimo.status !== 'ativo') {
        return res.status(400).json({ mensagem: 'Este empréstimo já foi concluído.' });
    }

    // 2. Validar que os livros devolvidos pertencem ao empréstimo
    for (const livroId of livrosIds) {
        if (!emprestimo.livrosIds.includes(livroId)) {
            return res.status(400).json({ mensagem: `Livro com id "${livroId}" não pertence a este empréstimo.` });
        }
    }

    // 3. Decrementar qtdEmprestados de cada livro devolvido
    parsed.livros = parsed.livros.map((livro) => {
        if (livrosIds.includes(livro.id)) {
            return { ...livro, qtdEmprestados: Math.max(0, livro.qtdEmprestados - 1) };
        }
        return livro;
    });

    // 4. Verificar se todos os livros do empréstimo foram devolvidos
    const todosDevolvidos = emprestimo.livrosIds.every((id) => livrosIds.includes(id));

    // 5. Atualizar o empréstimo
    parsed.emprestimos = parsed.emprestimos.map((e) => {
        if (e.id === emprestimoId) {
            return {
                ...e,
                status: todosDevolvidos ? 'concluído' : 'ativo',
                dataDevolucao: todosDevolvidos ? new Date().toISOString().split('T')[0] : undefined,
            };
        }
        return e;
    });

    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));

    return res.status(200).json({
        mensagem: todosDevolvidos
            ? 'Devolução concluída com sucesso!'
            : 'Livros devolvidos parcialmente.',
    });
}
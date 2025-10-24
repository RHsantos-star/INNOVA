<?php
require_once "conexao.php"; // arquivo de conexão PDO

// Inicializa mensagens de retorno
$mensagem = "";

// Verifica se o formulário foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $acao = $_POST['acao'] ?? 'cadastrar'; // cadastrar, editar ou excluir
    $nome = trim($_POST['nomecategoria'] ?? '');
    $desconto = floatval($_POST['desconto'] ?? 0);
    $idCategoria = intval($_POST['idCategoria'] ?? 0);

    try {
        if ($acao === 'cadastrar' && !empty($nome)) {
            // Inserir nova categoria
            $stmt = $pdo->prepare("
                INSERT INTO categorias_produtos (nome, desconto)
                VALUES (:nome, :desconto)
            ");
            $stmt->execute([
                ':nome' => $nome,
                ':desconto' => $desconto
            ]);
            $mensagem = "Categoria '$nome' cadastrada com sucesso!";
        }

        elseif ($acao === 'editar' && $idCategoria > 0) {
            
            // Atualizar categoria existente
            $stmt = $pdo->prepare("
                UPDATE categorias_produtos
                SET nome = :nome, desconto = :desconto
                WHERE idCategoriaProduto = :id
            ");
            $stmt->execute([
                ':nome' => $nome,
                ':desconto' => $desconto,
                ':id' => $idCategoria
            ]);
            $mensagem = "Categoria '$nome' atualizada com sucesso!";
        }

        elseif ($acao === 'excluir' && $idCategoria > 0) {
            // Excluir categoria
            $stmt = $pdo->prepare("
                DELETE FROM categorias_produtos
                WHERE idCategoriaProduto = :id
            ");
            $stmt->execute([':id' => $idCategoria]);
            $mensagem = "Categoria excluída com sucesso!";
        }

    } catch (PDOException $e) {
        $mensagem = "Erro: " . $e->getMessage();
    }
}

// Recupera todas as categorias cadastradas
try {
    $sql = "SELECT idCategoriaProduto, nome, desconto
            FROM categorias_produtos
            ORDER BY nome";
    $stmt = $pdo->query($sql);
    $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    $categorias = [];
    $mensagem = "Erro ao listar categorias: " . $e->getMessage();
}

// Exemplo: saída JSON (caso queira usar via AJAX)
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'mensagem' => $mensagem,
    'categorias' => $categorias
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>

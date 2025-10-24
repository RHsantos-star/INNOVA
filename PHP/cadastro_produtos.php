<?php
require_once "conexao.php"; // Arquivo de conexão ao banco

// ===============================
// CADASTRAR PRODUTO (POST)
// ===============================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $acao        = $_POST['acao'] ?? 'cadastrar';
    $idProduto   = isset($_POST['idProduto']) ? (int)$_POST['idProduto'] : 0;
    $nome        = $_POST["nome"]        ?? "";
    $descricao   = $_POST["descricao"]   ?? "";
    $preco       = $_POST["preco"]       ?? 0;
    $tamanho     = $_POST["tamanho"]     ?? "";
    $idCategoria = $_POST["idCategoriaProduto"] ?? null;
    $desconto    = $_POST["desconto"]    ?? 0;

    $imagem = null;
    $mime   = null;

    if (!empty($_FILES["imagem"]["tmp_name"])) {
        $imagem = file_get_contents($_FILES["imagem"]["tmp_name"]);
        $mime   = mime_content_type($_FILES["imagem"]["tmp_name"]);
    }

    try {
        // ===============================
        // CADASTRAR
        // ===============================
        if ($acao === 'cadastrar') {
            $sql = "INSERT INTO Produtos 
                    (nome, descricao, preco, tamanho, desconto, imagem, mime, idCategoriaProduto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$nome, $descricao, $preco, $tamanho, $desconto, $imagem, $mime, $idCategoria]);
            echo json_encode(["ok" => true, "msg" => "✅ Produto cadastrado com sucesso!"]);
        }

        // ===============================
        // ATUALIZAR
        // ===============================
        if ($acao === 'atualizar') {
            if ($idProduto <= 0) {
                echo json_encode(["ok" => false, "msg" => "ID inválido para atualização"]);
                exit;
            }

            $setSql = "nome = :nome, descricao = :descricao, preco = :preco, tamanho = :tamanho, desconto = :desconto, idCategoriaProduto = :idCategoria";
            if ($imagem && $mime) {
                $setSql = "imagem = :imagem, mime = :mime, " . $setSql;
            }

            $sql = "UPDATE Produtos SET $setSql WHERE idProdutos = :id";
            $stmt = $pdo->prepare($sql);

            if ($imagem && $mime) {
                $stmt->bindValue(':imagem', $imagem, PDO::PARAM_LOB);
                $stmt->bindValue(':mime', $mime, PDO::PARAM_STR);
            }
            $stmt->bindValue(':nome', $nome, PDO::PARAM_STR);
            $stmt->bindValue(':descricao', $descricao, PDO::PARAM_STR);
            $stmt->bindValue(':preco', $preco);
            $stmt->bindValue(':tamanho', $tamanho, PDO::PARAM_STR);
            $stmt->bindValue(':desconto', $desconto);
            $stmt->bindValue(':idCategoria', $idCategoria ?: null, PDO::PARAM_INT);
            $stmt->bindValue(':id', $idProduto, PDO::PARAM_INT);

            $stmt->execute();
            echo json_encode(["ok" => true, "msg" => "✅ Produto atualizado com sucesso!"]);
        }

        // ===============================
        // EXCLUIR
        // ===============================
        if ($acao === 'excluir') {
            if ($idProduto <= 0) {
                echo json_encode(["ok" => false, "msg" => "ID inválido para exclusão"]);
                exit;
            }

            $sql = "DELETE FROM Produtos WHERE idProdutos = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':id', $idProduto, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode(["ok" => true, "msg" => "✅ Produto excluído com sucesso!"]);
        }

    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro no banco de dados: " . $e->getMessage()]);
    }
    exit;
}

// ===============================
// LISTAR PRODUTOS (GET)
// ===============================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $sql = "SELECT 
                    p.idProdutos,
                    p.nome,
                    p.descricao,
                    p.preco,
                    p.tamanho,
                    p.desconto,
                    c.nome AS categoria,
                    p.imagem,
                    p.mime
                FROM Produtos p
                LEFT JOIN categorias_produtos c 
                    ON p.idCategoriaProduto = c.idCategoriaProduto
                ORDER BY p.idProdutos DESC";

        $stmt = $pdo->query($sql);
        $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Converte imagem binária em Base64 para exibição
        foreach ($produtos as &$p) {
            if ($p["imagem"]) {
                $p["imagem"] = "data:" . $p["mime"] . ";base64," . base64_encode($p["imagem"]);
            }
        }

        header("Content-Type: application/json; charset=utf-8");
        echo json_encode($produtos);

    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao listar produtos: " . $e->getMessage()]);
    }
    exit;
}
?>

<?php
require_once "conexao.php"; // Arquivo de conexão ao banco

// ===============================
// CADASTRAR PRODUTO (POST)
// ===============================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nome        = $_POST["nome"]        ?? "";
    $descricao   = $_POST["descricao"]   ?? "";
    $preco       = $_POST["preco"]       ?? 0;
    $tamanho     = $_POST["tamanho"]     ?? "";
    $idCategoria = $_POST["idCategoriaProduto"] ?? null;
    $desconto    = $_POST["desconto"]    ?? 0;

    $imagem = null;
    $mime   = null;

    // Caso o usuário envie uma imagem
    if (!empty($_FILES["imagem"]["tmp_name"])) {
        $imagem = file_get_contents($_FILES["imagem"]["tmp_name"]);
        $mime   = mime_content_type($_FILES["imagem"]["tmp_name"]);
    }

    try {
        $sql = "INSERT INTO Produtos 
                (nome, descricao, preco, tamanho, desconto, imagem, mime, idCategoriaProduto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nome, $descricao, $preco, $tamanho, $desconto, $imagem, $mime, $idCategoria]);

        echo json_encode(["ok" => true, "msg" => "✅ Produto cadastrado com sucesso!"]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao cadastrar produto: " . $e->getMessage()]);
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

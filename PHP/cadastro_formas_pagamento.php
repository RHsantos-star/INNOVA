<?php
require_once "conexao.php";
header('Content-Type: application/json; charset=utf-8');

// ================================
// CADASTRAR NOVA FORMA DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nome = trim($_POST['nomepagamento'] ?? '');

    if (!empty($nome)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO formas_pagamento (nome) VALUES (?)");
            $stmt->execute([$nome]);
            echo json_encode(["ok" => true, "msg" => "Forma de pagamento cadastrada com sucesso!"]);
        } catch (PDOException $e) {
            echo json_encode(["ok" => false, "msg" => "Erro ao cadastrar: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["ok" => false, "msg" => "O campo nome é obrigatório."]);
    }
    exit;
}

// ================================
// LISTAR FORMAS DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->query("SELECT idFormaPagamento, nome FROM formas_pagamento ORDER BY idFormaPagamento DESC");
        $pagamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["ok" => true, "formas_pagamento" => $pagamentos]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao listar: " . $e->getMessage()]);
    }
    exit;
}
?>


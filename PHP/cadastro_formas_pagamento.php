<?php
require_once "conexao.php";
header('Content-Type: application/json; charset=utf-8');

// ================================
// CADASTRAR NOVA FORMA DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['acao'] ?? '') === 'cadastrar') {
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

// ================================
// ATUALIZAR FORMA DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['acao'] ?? '') === 'atualizar') {
    $id = (int)($_POST['id'] ?? 0);
    $nome = trim($_POST['nomepagamento'] ?? '');

    if ($id <= 0 || empty($nome)) {
        echo json_encode(["ok" => false, "msg" => "ID ou nome inválido."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE formas_pagamento SET nome = :nome WHERE idFormaPagamento = :id");
        $stmt->bindValue(':nome', $nome, PDO::PARAM_STR);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(["ok" => true, "msg" => "Forma de pagamento atualizada com sucesso!"]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao atualizar: " . $e->getMessage()]);
    }
    exit;
}

// ================================
// EXCLUIR FORMA DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['acao'] ?? '') === 'excluir') {
    $id = (int)($_POST['id'] ?? 0);

    if ($id <= 0) {
        echo json_encode(["ok" => false, "msg" => "ID inválido para exclusão."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM formas_pagamento WHERE idFormaPagamento = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        echo json_encode(["ok" => true, "msg" => "Forma de pagamento excluída com sucesso!"]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao excluir: " . $e->getMessage()]);
    }
    exit;
}
?>


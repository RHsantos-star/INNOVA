<?php
require_once __DIR__ . "/conexao.php";
header('Content-Type: application/json; charset=utf-8');

// ================================
// LISTAR FORMAS DE PAGAMENTO
// ================================
if (isset($_GET['listar'])) {
    try {
        $stmt = $pdo->query("SELECT idFormaPagamento, nome FROM formas_pagamento ORDER BY idFormaPagamento DESC");
        $pagamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "ok" => true,
            "formas_pagamento" => $pagamentos
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            "ok" => false,
            "msg" => "Erro ao listar: " . $e->getMessage()
        ]);
    }
    exit;
}

// ================================
// CADASTRAR NOVA FORMA DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['acao'] ?? '') === 'cadastrar') {
    $nome = trim($_POST['nomepagamento'] ?? '');

    if ($nome === '') {
        echo json_encode(["ok" => false, "msg" => "O campo nome é obrigatório."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO formas_pagamento (nome) VALUES (:nome)");
        $stmt->execute([':nome' => $nome]);
        echo json_encode(["ok" => true, "msg" => "Forma de pagamento cadastrada com sucesso!"]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao cadastrar: " . $e->getMessage()]);
    }
    exit;
}

// ================================
// ATUALIZAR FORMA DE PAGAMENTO
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST['acao'] ?? '') === 'atualizar') {
    $id = (int)($_POST['id'] ?? 0);
    $nome = trim($_POST['nomepagamento'] ?? '');

    if ($id <= 0 || $nome === '') {
        echo json_encode(["ok" => false, "msg" => "ID ou nome inválido."]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE formas_pagamento SET nome = :nome WHERE idFormaPagamento = :id");
        $stmt->execute([':nome' => $nome, ':id' => $id]);
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
        $stmt->execute([':id' => $id]);
        echo json_encode(["ok" => true, "msg" => "Forma de pagamento excluída com sucesso!"]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao excluir: " . $e->getMessage()]);
    }
    exit;
}

// Se nenhuma ação reconhecida:
echo json_encode(["ok" => false, "msg" => "Ação inválida ou não especificada."]);
exit;
?>

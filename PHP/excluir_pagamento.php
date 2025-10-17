<?php
require_once "conexao.php";

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("DELETE FROM Formas_pagamento WHERE idformas_pagamento = ?");
    if($stmt->execute([$id])){
        echo json_encode(["ok"=>true,"msg"=>"Forma de pagamento excluída!"]);
    } else {
        echo json_encode(["ok"=>false,"msg"=>"Erro ao excluir."]);
    }
    exit;
}
?>

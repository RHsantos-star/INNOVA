<?php
require_once "conexao.php";

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $pdo->prepare("DELETE FROM Fretes WHERE idFretes = ?");
    if($stmt->execute([$id])){
        echo json_encode(["ok"=>true,"msg"=>"Frete excluído!"]);
    } else {
        echo json_encode(["ok"=>false,"msg"=>"Erro ao excluir."]);
    }
    exit;
}
?>

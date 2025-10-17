<?php
require_once "conexao.php";

if($_SERVER['REQUEST_METHOD']==='POST'){
    $id = intval($_POST['id']);
    $bairro = $_POST['bairro'] ?? '';
    $valor = $_POST['valor'] ?? 0;

    $stmt = $pdo->prepare("UPDATE Fretes SET bairro=?, valor=? WHERE idFretes=?");
    if($stmt->execute([$bairro,$valor,$id])){
        echo json_encode(["ok"=>true,"msg"=>"Frete atualizado!"]);
    } else { 
        echo json_encode(["ok"=>false,"msg"=>"Erro ao atualizar"]); 
    }
}
?>

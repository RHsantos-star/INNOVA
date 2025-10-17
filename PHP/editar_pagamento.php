<?php
require_once "conexao.php";

if($_SERVER['REQUEST_METHOD']==='POST'){
    $id = intval($_POST['id']);
    $nome = $_POST['nome'] ?? '';
    if($nome){
        $stmt = $pdo->prepare("UPDATE Formas_pagamento SET nome=? WHERE idformas_pagamento=?");
        if($stmt->execute([$nome,$id])){
            echo json_encode(["ok"=>true,"msg"=>"Forma de pagamento atualizada!"]);
        } else { 
            echo json_encode(["ok"=>false,"msg"=>"Erro ao atualizar"]); 
        }
    }
}
?>

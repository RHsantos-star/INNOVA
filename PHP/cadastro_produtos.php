<?php
require_once __DIR__ . "/conexao.php";
header('Content-Type: application/json; charset=utf-8');

// Captura ação (cadastrar, atualizar, excluir)
$acao = $_POST['acao'] ?? '';

if($acao === 'cadastrar' || $acao === 'atualizar') {
    $idProduto = $_POST['idProduto'] ?? null;
    $nome = $_POST['nome'] ?? '';
    $preco = $_POST['preco'] ?? '';
    $descricao = $_POST['descricao'] ?? '';

    if($acao === 'cadastrar') {
        $sql = $conn->prepare("INSERT INTO Produtos (nome, preco, descricao) VALUES (?, ?, ?)");
        $sql->bind_param("sds", $nome, $preco, $descricao);
        $res = $sql->execute();
        echo json_encode(['success' => $res, 'acao' => 'cadastrar']);
    }

    if($acao === 'atualizar') {
        $sql = $conn->prepare("UPDATE Produtos SET nome=?, preco=?, descricao=? WHERE idProduto=?");
        $sql->bind_param("sdsi", $nome, $preco, $descricao, $idProduto);
        $res = $sql->execute();
        echo json_encode(['success' => $res, 'acao' => 'atualizar']);
    }
}

if($acao === 'excluir') {
    $idProduto = $_POST['idProduto'] ?? 0;
    $sql = $conn->prepare("DELETE FROM Produtos WHERE idProduto=?");
    $sql->bind_param("i", $idProduto);
    $res = $sql->execute();
    echo json_encode(['success' => $res, 'acao' => 'excluir']);
}

// Retornar todos os produtos
if($acao === 'listar') {
    $res = $conn->query("SELECT * FROM Produtos ORDER BY idProduto DESC");
    $produtos = [];
    while($row = $res->fetch_assoc()) {
        $produtos[] = $row;
    }
    echo json_encode($produtos);
}
?>

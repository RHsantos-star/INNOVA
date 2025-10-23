<?php
require_once "conexao.php";
header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT b.idBanners, b.descricao, b.data_inicio, b.data_validade, b.imagem, c.nome AS categoria
        FROM Banners b
        LEFT JOIN categorias_produtos c ON b.idCategoriaProduto = c.idCategoriaProduto
        ORDER BY b.idBanners DESC";
$result = $conn->query($sql);

$banners = [];
while($row = $result->fetch_assoc()) {
    $banners[] = [
        "id" => $row['idBanners'],
        "descricao" => $row['descricao'],
        "data_inicio" => $row['data_inicio'],
        "data_validade" => $row['data_validade'],
        "categoria" => $row['categoria'],
        "imagem" => $row['imagem'] ? "data:image/jpeg;base64,".base64_encode($row['imagem']) : ""
    ];
}

echo json_encode(["ok"=>true,"banners"=>$banners]);
$conn->close();
?>

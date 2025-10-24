<?php
require_once "conexao.php"; // usando PDO
header('Content-Type: application/json; charset=utf-8');

// ===============================
// LISTAR BANNERS (GET)
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $sql = "SELECT b.idBanners, b.descricao, b.data_inicio, b.data_validade, b.imagem, b.link,
                       c.nome AS categoria
                FROM Banners b
                LEFT JOIN categorias_produtos c ON b.idCategoriaProduto = c.idCategoriaProduto
                ORDER BY b.idBanners DESC";
        $stmt = $pdo->query($sql);
        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($banners as &$b) {
            if ($b['imagem']) {
                $b['imagem'] = "data:image/jpeg;base64," . base64_encode($b['imagem']);
            }
        }

        echo json_encode(["ok" => true, "banners" => $banners]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao listar banners: " . $e->getMessage()]);
    }
    exit;
}

// ===============================
// CADASTRAR / ATUALIZAR / EXCLUIR BANNER (POST)
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? 'cadastrar';
    $id   = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    $descricao   = trim($_POST['descricao'] ?? '');
    $dataInicio  = trim($_POST['data_inicio'] ?? '');
    $dataValidade = trim($_POST['data_validade'] ?? '');
    $link        = trim($_POST['link'] ?? '');
    $idCategoria = $_POST['idCategoriaProduto'] ?? null;
    $imagem      = $_FILES['imagem']['tmp_name'] ?? null;

    try {
        if ($acao === 'cadastrar') {
            $imgBlob = $imagem ? file_get_contents($imagem) : null;
            $sql = "INSERT INTO Banners (imagem, data_inicio, data_validade, descricao, link, idCategoriaProduto)
                    VALUES (:img, :dtInicio, :dtVal, :desc, :lnk, :cat)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':img', $imgBlob, PDO::PARAM_LOB);
            $stmt->bindValue(':dtInicio', $dataInicio);
            $stmt->bindValue(':dtVal', $dataValidade);
            $stmt->bindValue(':desc', $descricao);
            $stmt->bindValue(':lnk', $link ?: null);
            $stmt->bindValue(':cat', $idCategoria ?: null);
            $stmt->execute();

            echo json_encode(["ok" => true, "msg" => "Banner cadastrado com sucesso!"]);
        }

        if ($acao === 'atualizar') {
            if ($id <= 0) throw new Exception("ID inválido para atualização.");

            $setSql = "descricao = :desc, data_inicio = :dtInicio, data_validade = :dtVal, link = :lnk, idCategoriaProduto = :cat";
            if ($imagem) {
                $setSql = "imagem = :img, " . $setSql;
            }

            $sql = "UPDATE Banners SET $setSql WHERE idBanners = :id";
            $stmt = $pdo->prepare($sql);

            if ($imagem) {
                $stmt->bindValue(':img', file_get_contents($imagem), PDO::PARAM_LOB);
            }
            $stmt->bindValue(':desc', $descricao);
            $stmt->bindValue(':dtInicio', $dataInicio);
            $stmt->bindValue(':dtVal', $dataValidade);
            $stmt->bindValue(':lnk', $link ?: null);
            $stmt->bindValue(':cat', $idCategoria ?: null);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode(["ok" => true, "msg" => "Banner atualizado com sucesso!"]);
        }

        if ($acao === 'excluir') {
            if ($id <= 0) throw new Exception("ID inválido para exclusão.");
            $stmt = $pdo->prepare("DELETE FROM Banners WHERE idBanners = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode(["ok" => true, "msg" => "Banner excluído com sucesso!"]);
        }

    } catch (Exception | PDOException $e) {
        echo json_encode(["ok" => false, "msg" => $e->getMessage()]);
    }
    exit;
}
?>

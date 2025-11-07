<?php
require_once "conexao.php"; // usando PDO
header('Content-Type: application/json; charset=utf-8');

// ===============================
// LISTAR BANNERS (GET)
// ===============================
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $sql = "SELECT idBanners, descricao, data_inicio, data_validade, imagem
                FROM Banners
                ORDER BY idBanners DESC";
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
    $dataInicio  = trim($_POST['data'] ?? '');
    $dataValidade = trim($_POST['data'] ?? '');
    $imagem      = $_FILES['foto']['tmp_name'] ?? null;

    try {
        // =====================================
        // CADASTRAR
        // =====================================
        if ($acao === 'cadastrar') {
            $imgBlob = $imagem ? file_get_contents($imagem) : null;
            $sql = "INSERT INTO Banners (imagem, data_inicio, data_validade, descricao)
                    VALUES (:img, :dtInicio, :dtVal, :desc)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':img', $imgBlob, PDO::PARAM_LOB);
            $stmt->bindValue(':dtInicio', $dataInicio);
            $stmt->bindValue(':dtVal', $dataValidade);
            $stmt->bindValue(':desc', $descricao);
            $stmt->execute();

            // Buscar o banner recém-cadastrado
            $idNovo = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT idBanners, descricao, data_inicio, data_validade, imagem FROM Banners WHERE idBanners = :id");
            $stmt->bindValue(':id', $idNovo, PDO::PARAM_INT);
            $stmt->execute();
            $banner = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($banner && $banner['imagem']) {
                $banner['imagem'] = "data:image/jpeg;base64," . base64_encode($banner['imagem']);
            }

            echo json_encode(["ok" => true, "msg" => "Banner cadastrado com sucesso!", "banner" => $banner]);
        }

        // =====================================
        // ATUALIZAR
        // =====================================
        if ($acao === 'atualizar') {
            if ($id <= 0) throw new Exception("ID inválido para atualização.");

            $setSql = "descricao = :desc, data_inicio = :dtInicio, data_validade = :dtVal";
            if ($imagem) $setSql = "imagem = :img, " . $setSql;

            $sql = "UPDATE Banners SET $setSql WHERE idBanners = :id";
            $stmt = $pdo->prepare($sql);

            if ($imagem) $stmt->bindValue(':img', file_get_contents($imagem), PDO::PARAM_LOB);
            $stmt->bindValue(':desc', $descricao);
            $stmt->bindValue(':dtInicio', $dataInicio);
            $stmt->bindValue(':dtVal', $dataValidade);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode(["ok" => true, "msg" => "Banner atualizado com sucesso!"]);
        }

        // =====================================
        // EXCLUIR
        // =====================================
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


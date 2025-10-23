<?php
require_once "conexao.php";
header('Content-Type: application/json; charset=utf-8');

// Função auxiliar para redirecionar ou retornar erro (caso queira usar)
function redirect_with($url, $params = []) {
    $qs = http_build_query($params);
    header("Location: $url?$qs");
    exit;
}

// ================================
// LISTAR BANNERS
// ================================
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $sql = "SELECT 
                    b.idBanners,
                    b.descricao,
                    b.data_inicio,
                    b.data_validade,
                    b.link,
                    c.nome AS categoria
                FROM Banners b
                LEFT JOIN categorias_produtos c ON c.idCategoriaProduto = b.idCategoriaProduto
                ORDER BY b.idBanners DESC";
        $stmt = $pdo->query($sql);
        $banners = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["ok" => true, "banners" => $banners]);
    } catch (PDOException $e) {
        echo json_encode(["ok" => false, "msg" => "Erro ao listar banners: " . $e->getMessage()]);
    }
    exit;
}

// ================================
// AÇÕES POST: CADASTRAR / ATUALIZAR / EXCLUIR
// ================================
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $acao = $_POST['acao'] ?? '';

    // -------------------- CADASTRAR --------------------
    if ($acao === 'cadastrar') {
        try {
            $descricao = trim($_POST['descricao'] ?? '');
            $dataInicio = trim($_POST['data_inicio'] ?? '');
            $dataValidade = trim($_POST['data_validade'] ?? '');
            $link = trim($_POST['link'] ?? '');
            $idCategoria = $_POST['idCategoriaProduto'] ?? null;
            $imagem = $_FILES['imagem'] ?? null;

            if (empty($descricao) || empty($dataInicio) || empty($dataValidade) || !$imagem) {
                echo json_encode(["ok" => false, "msg" => "Preencha todos os campos obrigatórios."]);
                exit;
            }

            $imgBlob = file_get_contents($imagem['tmp_name']);

            $sql = "INSERT INTO Banners (imagem, data_inicio, data_validade, descricao, link, idCategoriaProduto)
                    VALUES (:img, :dtInicio, :dtVal, :desc, :lnk, :cat)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(":img", $imgBlob, PDO::PARAM_LOB);
            $stmt->bindValue(":dtInicio", $dataInicio);
            $stmt->bindValue(":dtVal", $dataValidade);
            $stmt->bindValue(":desc", $descricao);
            $stmt->bindValue(":lnk", $link ?: null);
            $stmt->bindValue(":cat", $idCategoria ?: null);

            $stmt->execute();
            echo json_encode(["ok" => true, "msg" => "Banner cadastrado com sucesso!"]);
        } catch (PDOException $e) {
            echo json_encode(["ok" => false, "msg" => "Erro ao cadastrar banner: " . $e->getMessage()]);
        }
        exit;
    }

    // -------------------- ATUALIZAR --------------------
    if ($acao === 'atualizar') {
        try {
            $id = (int)($_POST['id'] ?? 0);
            $descricao = trim($_POST['descricao'] ?? '');
            $dataInicio = trim($_POST['data_inicio'] ?? '');
            $dataValidade = trim($_POST['data_validade'] ?? '');
            $link = trim($_POST['link'] ?? '');
            $idCategoria = $_POST['idCategoriaProduto'] ?? null;
            $imagem = $_FILES['imagem'] ?? null;

            if ($id <= 0) {
                echo json_encode(["ok" => false, "msg" => "ID inválido para edição."]);
                exit;
            }

            $setSql = "descricao = :desc, data_inicio = :dtInicio, data_validade = :dtVal, link = :lnk, idCategoriaProduto = :cat";
            if ($imagem && $imagem['tmp_name']) {
                $setSql = "imagem = :img, " . $setSql;
            }

            $sql = "UPDATE Banners SET $setSql WHERE idBanners = :id";
            $stmt = $pdo->prepare($sql);

            if ($imagem && $imagem['tmp_name']) {
                $imgBlob = file_get_contents($imagem['tmp_name']);
                $stmt->bindValue(':img', $imgBlob, PDO::PARAM_LOB);
            }

            $stmt->bindValue(':desc', $descricao);
            $stmt->bindValue(':dtInicio', $dataInicio);
            $stmt->bindValue(':dtVal', $dataValidade);
            $stmt->bindValue(':lnk', $link ?: null);
            $stmt->bindValue(':cat', $idCategoria ?: null);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);

            $stmt->execute();
            echo json_encode(["ok" => true, "msg" => "Banner atualizado com sucesso!"]);
        } catch (PDOException $e) {
            echo json_encode(["ok" => false, "msg" => "Erro ao atualizar banner: " . $e->getMessage()]);
        }
        exit;
    }

    // -------------------- EXCLUIR --------------------
    if ($acao === 'excluir') {
        try {
            $id = (int)($_POST['id'] ?? 0);
            if ($id <= 0) {
                echo json_encode(["ok" => false, "msg" => "ID inválido para exclusão."]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM Banners WHERE idBanners = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();

            echo json_encode(["ok" => true, "msg" => "Banner excluído com sucesso!"]);
        } catch (PDOException $e) {
            echo json_encode(["ok" => false, "msg" => "Erro ao excluir banner: " . $e->getMessage()]);
        }
        exit;
    }

}
?>

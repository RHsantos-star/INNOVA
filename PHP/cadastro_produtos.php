<?php
require_once __DIR__ . "/conexao.php";

// ---------------------------------------------
// Funções auxiliares
// ---------------------------------------------

function redirecWith($url, $params = []) {
  if (!empty($params)) {
    $qs = http_build_query($params);
    $sep = (strpos($url, '?') === false) ? '?' : '&';
    $url .= $sep . $qs;
  }
  header("Location: $url");
  exit;
}

function readImageToBlob(?array $file): ?string {
  if (!$file || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;
  $content = file_get_contents($file['tmp_name']);
  return $content === false ? null : $content;
}

// ---------------------------------------------
// LISTAGEM DE PRODUTOS
// ---------------------------------------------
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["listar"])) {
  header('Content-Type: application/json; charset=utf-8');
  try {
    $sql = "SELECT 
              p.idProdutos,
              p.nome,
              p.descricao,
              p.preco,
              p.tamanho,
              p.desconto,
              p.statusproduto,
              TO_BASE64(p.imagem) AS imagem,
              c.nome AS categoria
            FROM Produtos p
            LEFT JOIN categorias_produtos c 
              ON p.idCategoriaProduto = c.idCategoriaProduto
            ORDER BY p.idProdutos DESC";

    $stmt = $pdo->query($sql);
    $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["ok" => true, "produtos" => $produtos], JSON_UNESCAPED_UNICODE);
  } catch (Throwable $e) {
    echo json_encode(["ok" => false, "erro" => $e->getMessage()]);
  }
  exit;
}


// ---------------------------------------------
// ATUALIZAR PRODUTO
// ---------------------------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST["acao"] ?? '') === "atualizar") {
  try {
    $idProduto  = (int)($_POST["id"] ?? 0);
    $nome       = trim($_POST["pNome"] ?? '');
    $descricao  = trim($_POST["pDescricao"] ?? '');
    $preco      = (float)str_replace(',', '.', $_POST["pPreco"] ?? 0);
    $tamanho    = trim($_POST["pTamanho"] ?? '');
    $categoria  = trim($_POST["pCategoria"] ?? '');
    $desconto   = (float)str_replace(',', '.', $_POST["pDesconto"] ?? 0);
    $idCatProd  = (int)($_POST["idCategoriaProduto"] ?? 0);
    $imagem     = readImageToBlob($_FILES["imagem"] ?? null);

    if ($idProduto <= 0) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "ID inválido."]);
    }

    if ($nome === '' || $descricao === '' || $preco <= 0) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "Preencha todos os campos obrigatórios."]);
    }

    if ($imagem) {
      $sql = "UPDATE Produtos 
              SET nome=:nome, descricao=:descricao, preco=:preco, tamanho=:tamanho, 
                  categoria=:categoria, desconto=:desconto, imagem=:imagem, idCategoriaProduto=:idcat
              WHERE idProdutos=:id";
    } else {
      $sql = "UPDATE Produtos 
              SET nome=:nome, descricao=:descricao, preco=:preco, tamanho=:tamanho, 
                  categoria=:categoria, desconto=:desconto, idCategoriaProduto=:idcat
              WHERE idProdutos=:id";
    }

    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(":nome", $nome);
    $stmt->bindParam(":descricao", $descricao);
    $stmt->bindParam(":preco", $preco);
    $stmt->bindParam(":tamanho", $tamanho);
    $stmt->bindParam(":categoria", $categoria);
    $stmt->bindParam(":desconto", $desconto);
    $stmt->bindParam(":idcat", $idCatProd);
    $stmt->bindParam(":id", $idProduto, PDO::PARAM_INT);
    if ($imagem) $stmt->bindParam(":imagem", $imagem, PDO::PARAM_LOB);

    if ($stmt->execute()) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["editar" => "ok"]);
    } else {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "Erro ao atualizar produto."]);
    }
  } catch (Throwable $e) {
    redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => $e->getMessage()]);
  }
  exit;
}

// ---------------------------------------------
// EXCLUIR PRODUTO
// ---------------------------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST" && ($_POST["acao"] ?? '') === "excluir") {
  try {
    $idProduto = (int)($_POST["id"] ?? 0);
    if ($idProduto <= 0) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "ID inválido para exclusão."]);
    }

    $stmt = $pdo->prepare("DELETE FROM Produtos WHERE idProdutos = :id");
    if ($stmt->execute([':id' => $idProduto])) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["excluir" => "ok"]);
    } else {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "Falha ao excluir produto."]);
    }
  } catch (Throwable $e) {
    redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => $e->getMessage()]);
  }
  exit;
}

// ---------------------------------------------
// CADASTRAR PRODUTO
// ---------------------------------------------
if ($_SERVER["REQUEST_METHOD"] === "POST") {
  try {
    // Recebe os dados do formulário
    $nome       = trim($_POST["nome"] ?? '');
    $descricao  = trim($_POST["descricao"] ?? '');
    $preco      = (float)str_replace(',', '.', $_POST["preco"] ?? 0);
    $tamanho    = trim($_POST["tamanho"] ?? '');
    $desconto   = (float)str_replace(',', '.', $_POST["desconto"] ?? 0);
    $statusprod = isset($_POST["statusproduto"]) ? (bool)$_POST["statusproduto"] : true;
    $idCatProd  = (int)($_POST["idCategoriaProduto"] ?? 0);

   


    $imagem = readImageToBlob($_FILES["imagem"] ?? null);

    // Validação básica
    if ($nome === '' || $descricao === '' || $preco <= 0) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "Preencha todos os campos obrigatórios."]);
    }

    // Busca o nome da categoria para preencher o campo 'categoria' textual (mantendo compatibilidade com o banco)
    if ($idCatProd > 0) {
      $catStmt = $pdo->prepare("SELECT nome FROM categorias_produtos WHERE idCategoriaProduto = :id");
      $catStmt->bindParam(":id", $idCatProd, PDO::PARAM_INT);
      $catStmt->execute();
      $categoria = $catStmt->fetchColumn() ?: '';
    }

    // Inserção no banco
    $sql = "INSERT INTO Produtos 
              (nome, descricao, preco, tamanho,  desconto, imagem, statusproduto, idCategoriaProduto)
            VALUES 
              (:nome, :descricao, :preco, :tamanho,  :desconto, :imagem, :statusproduto, :idcat)";
    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(":nome", $nome);
    $stmt->bindParam(":descricao", $descricao);
    $stmt->bindParam(":preco", $preco);
    $stmt->bindParam(":tamanho", $tamanho);
   
    $stmt->bindParam(":desconto", $desconto);
    $stmt->bindParam(":imagem", $imagem, PDO::PARAM_LOB);
    $stmt->bindParam(":statusproduto", $statusprod, PDO::PARAM_BOOL);
    $stmt->bindParam(":idcat", $idCatProd, PDO::PARAM_INT);

    if ($stmt->execute()) {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["cadastro" => "ok"]);
    } else {
      redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => "Erro ao cadastrar produto."]);
    }

  } catch (Throwable $e) {
    redirecWith("../paginas_logista/cadastro_produtos_logista.html", ["erro" => $e->getMessage()]);
  }
  exit;
}

?>

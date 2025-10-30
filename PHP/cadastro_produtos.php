<?php
// cadastro_produtos.php
// Ativa exibição de erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Assumindo que estas funções e a variável $pdo estão definidas aqui ou em 'conexao.php'
require_once __DIR__ . '/conexao.php';

/* ---------------------- FUNÇÕES AUXILIARES (Necessárias para o fluxo de redirecionamento) ---------------------- */

function redirect_with(string $url, array $params = []): void {
  if ($params) {
    $qs  = http_build_query($params);
    $url .= (strpos($url, '?') === false ? '?' : '&') . $qs;
  }
  header("Location: $url");
  exit;
}

function read_image_to_blob(?array $file): ?string {
  if (!$file || !isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) return null;
  $bin = file_get_contents($file['tmp_name']);
  return $bin === false ? null : $bin;
}

// URL de redirecionamento após o CRUD.
$REDIRECT_URL = '../PAGINAS_LOGISTA/cadastro_produtos_logista.html'; 

/* ===================== 📜 LISTAGEM (via GET para JSON) ================================== */
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['listar'])) {
  header('Content-Type: application/json; charset=utf-8');

  try {
    $sql = "SELECT
              p.idProdutos, p.nome, p.descricao, p.preco, p.tamanho, p.desconto,
              p.imagem, p.statusproduto, p.idCategoriaProduto,
              c.nome AS nomeCategoria
            FROM Produtos p
            LEFT JOIN categorias_produtos c
              ON c.idCategoriaProduto = p.idCategoriaProduto
            ORDER BY p.idProdutos DESC";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $produtos = array_map(function ($r) {
      return [
        'idProdutos'           => (int)$r['idProdutos'],
        'nome'                 => $r['nome'],
        'descricao'            => $r['descricao'],
        'preco'                => (float)$r['preco'],
        'tamanho'              => $r['tamanho'],
        'desconto'             => (float)$r['desconto'],
        'statusproduto'        => (bool)$r['statusproduto'],
        'idCategoriaProduto'   => (int)$r['idCategoriaProduto'],
        'nomeCategoria'        => $r['nomeCategoria'] ?? null,
        'imagem'               => !empty($r['imagem']) ? base64_encode($r['imagem']) : null,
      ];
    }, $rows);

    echo json_encode(['ok' => true, 'count' => count($produtos), 'produtos' => $produtos], JSON_UNESCAPED_UNICODE);
    exit;

  } catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Erro ao listar produtos', 'detail' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
  }
}


/* ============================ ✏️ EDIÇÃO (Ação 'editar') =========================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['acao'] ?? '') === 'editar') {
  try {
    // 1. Coleta e Limpeza/Conversão dos dados
    $idProdutos     = (int)($_POST['id'] ?? 0); // O HTML usa 'id' para o campo hidden
    $nome           = trim($_POST['nome'] ?? '');
    $descricao      = trim($_POST['descricao'] ?? '');
    $preco          = (float)str_replace(',', '.', $_POST['preco'] ?? 0); 
    $tamanho        = trim($_POST['tamanho'] ?? '');
    $desconto       = (float)str_replace(',', '.', $_POST['desconto'] ?? 0);
    $statusproduto  = (int)($_POST['statusproduto'] ?? 0);
    $idCategoria    = (int)($_POST['idCategoriaProduto'] ?? 0);
    $imgBlob        = read_image_to_blob($_FILES['imagem'] ?? null); // Nova imagem (pode ser null)

    // 2. Validações
    $erros = [];
    if ($idProdutos <= 0) {
      redirect_with($REDIRECT_URL, ['erro_produto' => 'ID inválido para edição.']);
    }
    if ($nome === '') { $erros[] = 'Informe o nome do produto.'; }
    if ($preco <= 0) { $erros[] = 'Preço deve ser maior que zero.'; }
    if ($idCategoria <= 0) { $erros[] = 'Selecione uma categoria válida.'; }

    if ($erros) {
      redirect_with($REDIRECT_URL, ['erro_produto' => implode(' ', $erros)]);
    }

    // 3. Monta UPDATE dinâmico
    $setSql = "nome = :nome, descricao = :desc, preco = :preco, tamanho = :tam, 
               desconto = :descF, statusproduto = :status, idCategoriaProduto = :cat";
    if ($imgBlob !== null) {
      $setSql = "imagem = :img, " . $setSql; // Adiciona a imagem ao SET
    }

    $sql = "UPDATE Produtos SET $setSql WHERE idProdutos = :id";
    $st = $pdo->prepare($sql);

    // 4. Bind dos valores
    if ($imgBlob !== null) {
      $st->bindValue(':img', $imgBlob, PDO::PARAM_LOB);
    }
    
    $st->bindValue(':nome', $nome, PDO::PARAM_STR);
    $st->bindValue(':desc', $descricao, PDO::PARAM_STR);
    $st->bindValue(':preco', $preco);
    $st->bindValue(':tam', $tamanho, PDO::PARAM_STR);
    $st->bindValue(':descF', $desconto);
    $st->bindValue(':status', $statusproduto, PDO::PARAM_INT);
    $st->bindValue(':cat', $idCategoria, PDO::PARAM_INT);
    $st->bindValue(':id', $idProdutos, PDO::PARAM_INT);

    $st->execute();

    redirect_with($REDIRECT_URL, ['editar_produto' => 'ok']);

  } catch (Throwable $e) {
    redirect_with($REDIRECT_URL, ['erro_produto' => 'Erro ao editar: ' . $e->getMessage()]);
  }
}

/* ============================ 🗑️ EXCLUSÃO (Ação 'excluir') =========================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['acao'] ?? '') === 'excluir') {
  try {
    $idProdutos = (int)($_POST['id'] ?? 0); // O HTML usa 'id' para o campo hidden
    
    if ($idProdutos <= 0) {
      redirect_with($REDIRECT_URL, ['erro_produto' => 'ID inválido para exclusão.']);
    }

    $st = $pdo->prepare("DELETE FROM Produtos WHERE idProdutos = :id");
    $st->bindValue(':id', $idProdutos, PDO::PARAM_INT);
    $st->execute();

    redirect_with($REDIRECT_URL, ['excluir_produto' => 'ok']);

  } catch (Throwable $e) {
    redirect_with($REDIRECT_URL, ['erro_produto' => 'Erro ao excluir: ' . $e->getMessage()]);
  }
}

// Se nenhuma ação válida foi chamada (nem POST com acao=crud nem GET/listar), redireciona.
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && !isset($_GET['listar'])) {
    redirect_with($REDIRECT_URL, ['erro_produto' => 'Ação inválida ou não especificada.']);
}



/* ============================ 💾 CADASTRO (Ação padrão se for POST e 'acao' for 'cadastrar') =========================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  try {
    // 1. Coleta e Limpeza/Conversão dos dados
    $nome           = trim($_POST['nome'] ?? '');
    $descricao      = trim($_POST['descricao'] ?? '');
    // O campo 'preco' no HTML é number, mas o JS pode enviar com vírgula (se for digitado). Tratamento de segurança:
    $preco          = (float)str_replace(',', '.', $_POST['preco'] ?? 0); 
    $tamanho        = trim($_POST['tamanho'] ?? '');
    $desconto       = (float)str_replace(',', '.', $_POST['desconto'] ?? 0);
    // statusproduto vem do <select>, mas tratamos como bool/int (1 ou 0)
    $statusproduto  = (int)($_POST['statusproduto'] ?? 0); 
    // idCategoriaProduto vem do <select name="idCategoriaProduto">
    $idCategoria    = (int)($_POST['idCategoriaProduto'] ?? 0); 
    // 'imagem' é o name do seu input type="file"
    $imgBlob        = read_image_to_blob($_FILES['imagem'] ?? null); 

    // 2. Validações
    $erros = [];
    if ($nome === '') { $erros[] = 'Informe o nome do produto.'; }
    if ($preco <= 0) { $erros[] = 'Preço deve ser maior que zero.'; }
    if ($idCategoria <= 0) { $erros[] = 'Selecione uma categoria válida.'; }
    if ($imgBlob === null) { $erros[] = 'Envie a imagem do produto.'; }

    if ($erros) {
      redirect_with($REDIRECT_URL, ['erro_produto' => implode(' ', $erros)]);
    }

    // 3. Execução da Query
    $sql = "INSERT INTO Produtos 
              (nome, descricao, preco, tamanho, desconto, imagem, statusproduto, idCategoriaProduto)
            VALUES 
              (:nome, :desc, :preco, :tam, :descF, :img, :status, :cat)";
              
    $st  = $pdo->prepare($sql);

    $st->bindValue(':nome',  $nome, PDO::PARAM_STR);
    $st->bindValue(':desc',  $descricao, PDO::PARAM_STR);
    $st->bindValue(':preco', $preco);
    $st->bindValue(':tam',   $tamanho, PDO::PARAM_STR);
    $st->bindValue(':descF', $desconto);
    $st->bindValue(':img',   $imgBlob, PDO::PARAM_LOB); // Trata como BLOB
    $st->bindValue(':status', $statusproduto, PDO::PARAM_INT);
    $st->bindValue(':cat',   $idCategoria, PDO::PARAM_INT);

    $st->execute();

    redirect_with($REDIRECT_URL, ['cadastro_produto' => 'ok']);

  } catch (Throwable $e) {
    redirect_with($REDIRECT_URL, ['erro_produto' => 'Erro ao cadastrar: ' . $e->getMessage()]);
  }
}



?>
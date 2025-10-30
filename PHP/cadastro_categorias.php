<?php
// Conectando este arquivo ao banco de dados
require_once __DIR__ ."/conexao.php";

// função para capturar os dados passados de uma página a outra
function redirecWith($url,$params=[]){
// verifica se os os paramentros não vieram vazios
 if(!empty($params)){
// separar os parametros em espaços diferentes
$qs= http_build_query($params);
$sep = (strpos($url,'?') === false) ? '?': '&';
$url .= $sep . $qs;
}
// joga a url para o cabeçalho no navegador
header("Location:  $url");
// fecha o script
exit;
}


// códigos de listagem de dados
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["listar"])) {

   try{
   // comando de listagem de dados
   $sqllistar ="SELECT idCategoriaProduto AS id, nome FROM 
   categorias_produtos ORDER BY nome";

   // Prepara o comando para ser executado
   $stmtlistar = $pdo->query($sqllistar);   
   //executa e captura os dados retornados e guarda em $lista
   $listar = $stmtlistar->fetchAll(PDO::FETCH_ASSOC);

   // verificação de formatos
    $formato = isset($_GET["format"]) ? strtolower($_GET["format"]) : "option";


    if ($formato === "json") {
      header("Content-Type: application/json; charset=utf-8");
      echo json_encode(["ok" => true, "categorias" => $listar], JSON_UNESCAPED_UNICODE);
      exit;
    }


   // RETORNO PADRÃO
    header('Content-Type: text/html; charset=utf-8');
    foreach ($listar as $lista) {
      $id   = (int)$lista["id"];
      $nome = htmlspecialchars($lista["nome"], ENT_QUOTES, "UTF-8");
      echo "<option value=\"{$id}\">{$nome}</option>\n";
    }
    exit;



   }catch (Throwable $e) {
    // Em caso de erro na listagem
    if (isset($_GET['format']) && strtolower($_GET['format']) === 'json') {
      header('Content-Type: application/json; charset=utf-8', true, 500);
      echo json_encode(['ok' => false, 'error' => 'Erro ao listar categorias',
       'detail' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    } else {
      header('Content-Type: text/html; charset=utf-8', true, 500);
      echo "<option disabled>Erro ao carregar categorias</option>";
    }
    exit;
  }


}


/* ============================ ✏️ EDIÇÃO (Ação 'atualizar') =========================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['acao'] ?? '') === 'atualizar') {
    try {
        // 1. Coleta e Limpeza/Conversão dos dados
        $idCategoria = (int)($_POST['id'] ?? 0); // O HTML usa 'id' para o campo hidden
        $nome = trim($_POST["nomecategoria"] ?? '');
        $desconto = (float)str_replace(',', '.', $_POST["desconto"] ?? 0);

        // 2. Validações
        $erros = [];
        if ($idCategoria <= 0) { $erros[] = 'ID inválido para edição.'; }
        if ($nome === '') { $erros[] = 'Informe o nome da categoria.'; }

        if ($erros) {
            redirecWith($REDIRECT_URL, ['erro_categoria' => implode(' ', $erros)]);
        }

        // 3. Execução da Query
        $sql = "UPDATE categorias_produtos SET nome = :nome, desconto = :desconto WHERE idCategoriaProduto = :id";
        $st = $pdo->prepare($sql);
        
        $st->bindValue(':nome', $nome, PDO::PARAM_STR);
        $st->bindValue(':desconto', $desconto);
        $st->bindValue(':id', $idCategoria, PDO::PARAM_INT);

        $st->execute();

        redirecWith($REDIRECT_URL, ['editar_categoria' => 'ok']);

    } catch (Throwable $e) {
        redirecWith($REDIRECT_URL, ['erro_categoria' => 'Erro ao editar: ' . $e->getMessage()]);
    }
}


/* ============================ 🗑️ EXCLUSÃO (Ação 'excluir') =========================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['acao'] ?? '') === 'excluir') {
    try {
        $idCategoria = (int)($_POST['id'] ?? 0); // O HTML usa 'id' para o campo hidden
        
        if ($idCategoria <= 0) {
            redirecWith($REDIRECT_URL, ['erro_categoria' => 'ID inválido para exclusão.']);
        }

        $st = $pdo->prepare("DELETE FROM categorias_produtos WHERE idCategoriaProduto = :id");
        $st->bindValue(':id', $idCategoria, PDO::PARAM_INT);
        $st->execute();

        redirecWith($REDIRECT_URL, ['excluir_categoria' => 'ok']);

    } catch (Throwable $e) {
        // Nota: Se a categoria estiver ligada a um produto (Foreign Key), o banco pode dar erro.
        $msg = (strpos($e->getMessage(), 'Foreign key constraint') !== false) 
                ? 'Impossível excluir. Existem produtos vinculados a esta categoria.'
                : 'Erro ao excluir: ' . $e->getMessage();

        redirecWith($REDIRECT_URL, ['erro_categoria' => $msg]);
    }
}




// códigos de cadastro
try{
// SE O METODO DE ENVIO FOR DIFERENTE DO POST
    if($_SERVER["REQUEST_METHOD"] !== "POST"){
        //VOLTAR À TELA DE CADASTRO E EXIBIR ERRO
        redirecWith("../paginas_logista/cadastro_produtos_logista.html",
           ["erro"=> "Metodo inválido"]);
    }
    // jogando os dados da dentro de váriaveis
    $nome = $_POST["nomecategoria"];
    $desconto = (double)$_POST["desconto"];

     // VALIDANDO OS CAMPOS
// criar uma váriavel para receber os erros de validação
    $erros_validacao=[];
    //se qualquer campo for vazio
    if($nome === "" ){
        $erros_validacao[]="Preencha todos os campos";
    }

    /* Inserir a categoria no banco de dados */
    $sql ="INSERT INTO categorias_produtos (nome,desconto)
     Values (:nome,:desconto)";
     // executando o comando no banco de dados
     $inserir = $pdo->prepare($sql)->execute([
        ":nome" => $nome,
        ":desconto"=> $desconto, 
     ]);
     /* Verificando se foi cadastrado no banco de dados */
     if($inserir){
        redirecWith("../paginas_logista/cadastro_produtos_logista.html",
        ["cadastro" => "ok"]) ;
     }else{
        redirecWith("../paginas_logista/cadastro_produtos_logista.html",["erro" 
        =>"Erro ao cadastrar no banco de dados"]);
     }


}catch(Exception $e){
 redirecWith("../paginas_logista/cadastro_produtos_logista.html",
      ["erro" => "Erro no banco de dados: "
      .$e->getMessage()]);
}


try {
  $sql = "SELECT idCategoriaProduto, nome FROM categorias_produtos ORDER BY nome";
  foreach ($pdo->query($sql) as $row) {
    $id = (int)$row['idCategoriaProduto'];
    $nome = htmlspecialchars($row['nome'], ENT_QUOTES, 'UTF-8');
    echo "<option value=\"{$id}\">{$nome}</option>\n";
  }
} catch (Throwable $e) {
  http_response_code(500);
  // Pode retornar nada ou uma opção de erro (opcional):
  // echo "<option disabled>Erro ao carregar</option>";
}





?>
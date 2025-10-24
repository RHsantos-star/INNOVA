<?php

// Conectando este arquivo ao banco de dados
require_once __DIR__ ."/conexao.php";

// Função para capturar os dados passados de uma página a outra
function redirecWith($url, $params = []) {
    if (!empty($params)) {
        $qs = http_build_query($params);
        $sep = (strpos($url, '?') === false) ? '?' : '&';
        $url .= $sep . $qs;
    }
    header("Location: $url");
    exit;
}

// ================================
// CADASTRO DE FRETE
// ================================
try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        redirecWith("../paginas/frete_pagamento.html", ["erro" => "Método inválido"]);
    }

    $acao = $_POST['acao'] ?? 'cadastrar';

    $bairro = $_POST["bairro"] ?? '';
    $valor = isset($_POST["valor"]) ? (double)$_POST["valor"] : 0;
    $transportadora = $_POST["transportadora"] ?? '';
    $idFrete = isset($_POST["idFrete"]) ? (int)$_POST["idFrete"] : 0;

    // Validação básica
    $erros_validacao = [];
    if ($acao === 'cadastrar' || $acao === 'atualizar') {
        if ($bairro === "" || $valor === "" || $transportadora === "") {
            $erros_validacao[] = "Preencha todos os campos obrigatórios";
        }
    }

    if ($erros_validacao) {
        redirecWith("../paginas/frete_pagamento.html", ["erro" => implode(", ", $erros_validacao)]);
    }

    // ================================
    // CADASTRAR
    // ================================
    if ($acao === 'cadastrar') {
        $sql = "INSERT INTO Fretes (bairro, valor, transportadora) VALUES (:bairro, :valor, :transportadora)";
        $stmt = $pdo->prepare($sql);
        $inserir = $stmt->execute([
            ":bairro" => $bairro,
            ":valor" => $valor,
            ":transportadora" => $transportadora,
        ]);

        if ($inserir) {
            redirecWith("../paginas/frete_pagamento.html", ["cadastro" => "ok"]);
        } else {
            redirecWith("../paginas/frete_pagamento.html", ["erro" => "Erro ao cadastrar no banco de dados"]);
        }
    }

    // ================================
    // ATUALIZAR
    // ================================
    if ($acao === 'atualizar') {
        if ($idFrete <= 0) {
            redirecWith("../paginas/frete_pagamento.html", ["erro" => "ID inválido para atualização"]);
        }

        $sql = "UPDATE Fretes SET bairro = :bairro, valor = :valor, transportadora = :transportadora WHERE idFrete = :id";
        $stmt = $pdo->prepare($sql);
        $atualizar = $stmt->execute([
            ":bairro" => $bairro,
            ":valor" => $valor,
            ":transportadora" => $transportadora,
            ":id" => $idFrete
        ]);

        if ($atualizar) {
            redirecWith("../paginas/frete_pagamento.html", ["atualizar" => "ok"]);
        } else {
            redirecWith("../paginas/frete_pagamento.html", ["erro" => "Erro ao atualizar no banco de dados"]);
        }
    }

    // ================================
    // EXCLUIR
    // ================================
    if ($acao === 'excluir') {
        if ($idFrete <= 0) {
            redirecWith("../paginas/frete_pagamento.html", ["erro" => "ID inválido para exclusão"]);
        }

        $sql = "DELETE FROM Fretes WHERE idFrete = :id";
        $stmt = $pdo->prepare($sql);
        $excluir = $stmt->execute([":id" => $idFrete]);

        if ($excluir) {
            redirecWith("../paginas/frete_pagamento.html", ["excluir" => "ok"]);
        } else {
            redirecWith("../paginas/frete_pagamento.html", ["erro" => "Erro ao excluir do banco de dados"]);
        }
    }

} catch (\Exception $e) {
    redirecWith("../paginas/frete_pagamento.html", ["erro" => "Erro no banco de dados: " . $e->getMessage()]);
}
?>

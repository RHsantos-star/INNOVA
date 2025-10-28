// ===============================
// Função para listar Formas de Pagamento
// ===============================
async function listarFormasPagamento() {
  const tbody = document.getElementById("tbodyPagamentos");
  const url = "../php/cadastro_formas_pagamento.php?listar=1";

  try {
    const r = await fetch(url);
    const data = await r.json();
    tbody.innerHTML = "";

    if (!data.ok || !data.formas_pagamento?.length) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Nenhuma forma de pagamento encontrada.</td></tr>`;
      return;
    }

    data.formas_pagamento.forEach((p) => {
      const linha = `
        <tr>
          <td>${p.idFormaPagamento}</td>
          <td>${p.nome}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-2" onclick="editarPagamento(${p.idFormaPagamento}, '${p.nome}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="excluirPagamento(${p.idFormaPagamento})">Excluir</button>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", linha);
    });
  } catch (err) {
    console.error("Erro ao listar formas de pagamento:", err);
    tbody.innerHTML = `<tr><td colspan="3" class="text-danger text-center">Erro ao carregar dados.</td></tr>`;
  }
}

// ===============================
// Função para listar Fretes
// ===============================
async function listarFretes() {
  const tbody = document.getElementById("tbodyFretes");
  const url = "../php/cadastro_fretes.php?listar=1";

  try {
    const r = await fetch(url);
    const data = await r.json();
    tbody.innerHTML = "";

    if (!data.ok || !data.fretes?.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum frete encontrado.</td></tr>`;
      return;
    }

    data.fretes.forEach((f) => {
      const linha = `
        <tr>
          <td>${f.idFrete}</td>
          <td>${f.regioes ?? "-"}</td>
          <td>${f.modalidade ?? "-"}</td>
          <td>R$ ${parseFloat(f.valorFrete).toFixed(2).replace(".", ",")}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-warning me-2" onclick="editarFrete(${f.idFrete}, '${f.regioes}', ${f.valorFrete})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="excluirFrete(${f.idFrete})">Excluir</button>
          </td>
        </tr>`;
      tbody.insertAdjacentHTML("beforeend", linha);
    });
  } catch (err) {
    console.error("Erro ao listar fretes:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Erro ao carregar fretes.</td></tr>`;
  }
}

// ===============================
// Cadastrar nova Forma de Pagamento
// ===============================
async function cadastrarFormaPagamento() {
  const nome = document.getElementById("nomePagamento").value.trim();
  if (!nome) return alert("Informe o nome da forma de pagamento.");

  const resp = await fetch("../php/cadastro_formas_pagamento.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `nome=${encodeURIComponent(nome)}`,
  });

  const result = await resp.json();
  alert(result.msg);
  document.getElementById("nomePagamento").value = "";
  listarFormasPagamento(); // 🔁 Atualiza a tabela automaticamente
}

// ===============================
// Cadastrar novo Frete
// ===============================
async function cadastrarFrete() {
  const regiao = document.getElementById("regiaoFrete").value.trim();
  const modalidade = document.getElementById("modalidadeFrete").value.trim();
  const valor = document.getElementById("valorFrete").value.trim();

  if (!regiao || !modalidade || !valor)
    return alert("Preencha todos os campos do frete.");

  const resp = await fetch("../php/cadastro_fretes.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `regioes=${encodeURIComponent(regiao)}&modalidade=${encodeURIComponent(modalidade)}&valorFrete=${encodeURIComponent(valor)}`,
  });

  const result = await resp.json();
  alert(result.msg);
  document.getElementById("regiaoFrete").value = "";
  document.getElementById("modalidadeFrete").value = "";
  document.getElementById("valorFrete").value = "";
  listarFretes(); // 🔁 Atualiza a tabela automaticamente
}

// ===============================
// Funções de Exclusão
// ===============================
async function excluirPagamento(id) {
  if (!confirm("Deseja realmente excluir esta forma de pagamento?")) return;
  const resp = await fetch(`../php/excluir_pagamento.php?id=${id}`, { method: "DELETE" });
  const result = await resp.json();
  alert(result.msg);
  listarFormasPagamento();
}

async function excluirFrete(id) {
  if (!confirm("Deseja realmente excluir este frete?")) return;
  const resp = await fetch(`../php/excluir_frete.php?id=${id}`, { method: "DELETE" });
  const result = await resp.json();
  alert(result.msg);
  listarFretes();
}

// ===============================
// Funções de Edição
// ===============================
async function editarPagamento(id, nomeAtual) {
  const novoNome = prompt("Editar forma de pagamento:", nomeAtual);
  if (!novoNome) return;

  const resp = await fetch("../php/editar_pagamento.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}&nome=${encodeURIComponent(novoNome)}`,
  });

  const result = await resp.json();
  alert(result.msg);
  listarFormasPagamento();
}

async function editarFrete(id, regiao, valorAtual) {
  const novaRegiao = prompt("Editar região:", regiao);
  if (!novaRegiao) return;
  const novoValor = prompt("Editar valor do frete:", valorAtual);
  if (!novoValor) return;

  const resp = await fetch("../php/editar_frete.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}&regioes=${encodeURIComponent(novaRegiao)}&valorFrete=${novoValor}`,
  });

  const result = await resp.json();
  alert(result.msg);
  listarFretes();
}

// ===============================
// Inicialização ao carregar página
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  listarFormasPagamento();
  listarFretes();

  // Botões de cadastro
  const btnCadastroPagamento = document.getElementById("btnCadastrarPagamento");
  const btnCadastroFrete = document.getElementById("btnCadastrarFrete");

  if (btnCadastroPagamento) btnCadastroPagamento.addEventListener("click", cadastrarFormaPagamento);
  if (btnCadastroFrete) btnCadastroFrete.addEventListener("click", cadastrarFrete);
});


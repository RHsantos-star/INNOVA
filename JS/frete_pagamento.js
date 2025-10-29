// ===============================
// Listar e cadastrar Formas de Pagamento
// ===============================
async function listarFormasPagamento() {
  const tbody = document.getElementById("tbPagamentos");
  try {
    const resp = await fetch("../PHP/cadastro_formas_pagamento.php?listar=1");
    const data = await resp.json();

    tbody.innerHTML = "";

    if (!data.ok || !data.formas_pagamento?.length) {
      tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Nenhuma forma cadastrada.</td></tr>`;
      return;
    }

    data.formas_pagamento.forEach(p => {
      tbody.insertAdjacentHTML("beforeend", `
        <tr><td>${p.idFormaPagamento}</td><td>${p.nome}</td></tr>
      `);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-danger text-center">Erro ao carregar.</td></tr>`;
  }
}

async function cadastrarFormaPagamento() {
  const nome = document.getElementById("nomeFormaPagamento").value.trim();
  if (!nome) return alert("Digite o nome da forma de pagamento.");

  const formData = new FormData();
  formData.append("acao", "cadastrar");
  formData.append("nomepagamento", nome);

  const resp = await fetch("../PHP/cadastro_formas_pagamento.php", { method: "POST", body: formData });
  const data = await resp.json();
  alert(data.msg);
  listarFormasPagamento();
  document.getElementById("nomeFormaPagamento").value = "";
}

// ===============================
// Listar e cadastrar Fretes
// ===============================
async function listarFretes() {
  const tbody = document.getElementById("tbFretes");
  try {
    const resp = await fetch("../PHP/cadastro_frete.php?listar=1");
    const data = await resp.json();

    tbody.innerHTML = "";

    if (!data.ok || !data.fretes?.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Nenhum frete cadastrado.</td></tr>`;
      return;
    }

    data.fretes.forEach(f => {
      tbody.insertAdjacentHTML("beforeend", `
        <tr>
          <td>${f.idFrete}</td>
          <td>${f.bairro}</td>
          <td>${f.transportadora}</td>
          <td>R$ ${parseFloat(f.valor).toFixed(2).replace(".", ",")}</td>
        </tr>
      `);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Erro ao carregar fretes.</td></tr>`;
  }
}

async function cadastrarFrete() {
  const bairro = document.getElementById("bairroFrete").value.trim();
  const transportadora = document.getElementById("transportadoraFrete").value.trim();
  const valor = document.getElementById("valorFrete").value.trim();

  if (!bairro || !transportadora || !valor) return alert("Preencha todos os campos.");

  const formData = new FormData();
  formData.append("acao", "cadastrar");
  formData.append("bairro", bairro);
  formData.append("transportadora", transportadora);
  formData.append("valor", valor);

  const resp = await fetch("../PHP/cadastro_frete.php", { method: "POST", body: formData });
  const data = await resp.json();
  alert(data.msg);
  listarFretes();
  document.getElementById("bairroFrete").value = "";
  document.getElementById("transportadoraFrete").value = "";
  document.getElementById("valorFrete").value = "";
}

// ===============================
// Inicialização
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  listarFormasPagamento();
  listarFretes();

  document.getElementById("btnCadastrarPagamento").addEventListener("click", cadastrarFormaPagamento);
  document.getElementById("btnCadastrarFrete").addEventListener("click", cadastrarFrete);
});


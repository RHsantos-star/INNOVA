document.addEventListener("DOMContentLoaded", () => {

  // ===============================
  // Função para listar Formas de Pagamento
  // ===============================
  async function listarFormasPagamento(tabelaPG) {
    const tbody = document.getElementById(tabelaPG);

    const esc = s => (s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));

    try {
      const resp = await fetch("../php/cadastro_formas_pagamento.php", {cache: "no-store"});
      const dados = await resp.json();

      if (!Array.isArray(dados)) throw new Error("Resposta inválida do servidor");

      tbody.innerHTML = dados.length
        ? dados.map(f => `
          <tr>
            <td>${f.idformas_pagamento}</td>
            <td>${esc(f.nome)}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-warning" onclick="editarPagamento(${f.idformas_pagamento}, '${esc(f.nome)}')">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="excluirPagamento(${f.idformas_pagamento})">Excluir</button>
            </td>
          </tr>
        `).join('')
        : `<tr><td colspan="3" class="text-center text-muted">Nenhuma forma de pagamento cadastrada.</td></tr>`;
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Falha ao carregar: ${err.message}</td></tr>`;
    }
  }

  // ===============================
  // Função para listar Fretes
  // ===============================
  async function listarFretes(tabelaFt) {
    const tbody = document.getElementById(tabelaFt);
    const esc = s => (s || '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
    const moeda = new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'});

    try {
      const resp = await fetch("../php/cadastro_fretes.php", {cache:"no-store"});
      const dados = await resp.json();

      if (!Array.isArray(dados)) throw new Error("Resposta inválida do servidor");

      tbody.innerHTML = dados.length
        ? dados.map(f => `
          <tr>
            <td>${f.idFretes}</td>
            <td>${esc(f.bairro)}</td>
            <td>${esc(f.transportadora || "-")}</td>
            <td class="text-end">${moeda.format(parseFloat(f.valor))}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-warning" onclick="editarFrete(${f.idFretes}, '${esc(f.bairro)}', ${f.valor})">Editar</button>
              <button class="btn btn-sm btn-danger" onclick="excluirFrete(${f.idFretes})">Excluir</button>
            </td>
          </tr>
        `).join('')
        : `<tr><td colspan="5" class="text-center text-muted">Nenhum frete cadastrado.</td></tr>`;
    } catch(err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Falha ao carregar: ${esc(err.message)}</td></tr>`;
    }
  }

  // ===============================
  // Funções de Exclusão
  // ===============================
  window.excluirPagamento = async (id) => {
    if(!confirm("Deseja realmente excluir esta forma de pagamento?")) return;
    const resp = await fetch(`../php/excluir_pagamento.php?id=${id}`, {method:"DELETE"});
    const result = await resp.json();
    alert(result.msg);
    listarFormasPagamento("tbPagamentos");
  }

  window.excluirFrete = async (id) => {
    if(!confirm("Deseja realmente excluir este frete?")) return;
    const resp = await fetch(`../php/excluir_frete.php?id=${id}`, {method:"DELETE"});
    const result = await resp.json();
    alert(result.msg);
    listarFretes("tbFretes");
  }

  // ===============================
  // Funções de Edição
  // ===============================
  window.editarPagamento = (id,nomeAtual) => {
    const novoNome = prompt("Editar forma de pagamento:", nomeAtual);
    if(!novoNome) return;
    fetch("../php/editar_pagamento.php", {
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:`id=${id}&nome=${encodeURIComponent(novoNome)}`
    }).then(r=>r.json()).then(d=>{ alert(d.msg); listarFormasPagamento("tbPagamentos"); });
  }

  window.editarFrete = (id,bairro,valor) => {
    const novoBairro = prompt("Bairro:", bairro);
    if(!novoBairro) return;
    const novoValor = prompt("Valor:", valor);
    if(!novoValor) return;
    fetch("../php/editar_frete.php", {
      method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:`id=${id}&bairro=${encodeURIComponent(novoBairro)}&valor=${novoValor}`
    }).then(r=>r.json()).then(d=>{ alert(d.msg); listarFretes("tbFretes"); });
  }

  // ===============================
  // Inicializa as tabelas
  // ===============================
  listarFormasPagamento("tbPagamentos");
  listarFretes("tbFretes");

});

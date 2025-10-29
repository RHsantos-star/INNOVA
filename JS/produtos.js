async function listarProdutos() {
  try {
    const res = await fetch("cadastro_produtos.php", {
      method: "POST",
      body: new URLSearchParams({ acao: "listar" })
    });
    const produtos = await res.json();
    const tabela = document.getElementById("tabelaProdutos");
    tabela.innerHTML = "";

    produtos.forEach(prod => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.idProdutos}</td>
        <td>${prod.nome}</td>
        <td>R$ ${Number(prod.preco).toFixed(2)}</td>
        <td>${prod.descricao}</td>
        <td>${prod.tamanho || ''}</td>
        <td>${prod.desconto || 0}%</td>
        <td>${prod.statusproduto ? 'Ativo' : 'Inativo'}</td>
        <td>${prod.idCategoriaProduto || ''}</td>
        <td>${prod.imagem ? `<img src="${prod.imagem}" width="50">` : ''}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary editar" data-id="${prod.idProdutos}">Editar</button>
          <button class="btn btn-sm btn-outline-danger excluir" data-id="${prod.idProdutos}">Excluir</button>
        </td>
      `;
      tabela.appendChild(tr);
    });
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
  }
}

// Chama a função para carregar os produtos assim que a página carrega
document.addEventListener("DOMContentLoaded", listarProdutos);

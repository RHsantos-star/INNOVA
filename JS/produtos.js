document.addEventListener("DOMContentLoaded", () => {
  const formProduto = document.getElementById("formProduto");
  const lista = document.getElementById("listaProdutos");
  const selectCategoria = document.getElementById("idCategoriaProduto");
  const buscaInput = document.getElementById("buscaProduto");

  // Carregar categorias
  const carregarCategorias = async () => {
    const resp = await fetch("php/cadastro_categorias.php");
    const categorias = await resp.json();
    selectCategoria.innerHTML = '<option value="">Selecione...</option>';
    categorias.forEach(cat => {
      selectCategoria.innerHTML += `<option value="${cat.idCategoriaProduto}">${cat.nome} (${cat.desconto || 0}%)</option>`;
    });
  };

  // Carregar produtos
  const carregarProdutos = async (filtro="") => {
    const resp = await fetch("php/cadastro_produtos.php");
    const produtos = await resp.json();
    lista.innerHTML = "";

    produtos
      .filter(prod => prod.nome.toLowerCase().includes(filtro.toLowerCase()))
      .forEach(prod => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.imagem ? `<img src="${prod.imagem}" class="prod-thumb">` : ""}</td>
        <td>${prod.nome}</td>
        <td>${prod.categoria || "Sem categoria"}</td>
        <td>R$ ${prod.preco.toFixed(2)}</td>
        <td>${prod.desconto}%</td>
        <td class="text-end">
          <button class="btn-editar" onclick="editarProduto(${prod.idProdutos})">Editar</button>
          <button class="btn-excluir" onclick="excluirProduto(${prod.idProdutos})">Excluir</button>
        </td>
      `;
      lista.appendChild(tr);
    });
  };

  // Cadastrar produto
  formProduto.addEventListener("submit", async e => {
    e.preventDefault();
    const dados = new FormData(formProduto);
    const resp = await fetch("php/cadastro_produtos.php", { method:"POST", body:dados });
    const result = await resp.json();
    alert(result.msg);
    formProduto.reset();
    carregarProdutos();
  });

  // Busca
  buscaInput.addEventListener("input", e => {
    carregarProdutos(e.target.value);
  });

  // Funções globais para editar e excluir
  window.editarProduto = (id) => {
    alert("Editar produto ID: " + id);
    // Aqui você pode abrir modal ou redirecionar para formulário de edição
  };

  window.excluirProduto = async (id) => {
    if(!confirm("Deseja realmente excluir este produto?")) return;
    const resp = await fetch(`php/excluir_produto.php?id=${id}`, { method:"DELETE" });
    const result = await resp.json();
    alert(result.msg);
    carregarProdutos();
  };

  carregarCategorias();
  carregarProdutos();
});

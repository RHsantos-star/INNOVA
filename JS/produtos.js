document.addEventListener("DOMContentLoaded", () => {
  const formProduto = document.getElementById("formProduto");
  const lista = document.getElementById("listaProdutos");
  const selectCategoria = document.getElementById("idCategoriaProduto");
  const buscaInput = document.getElementById("buscaProduto");

  // Carregar categorias via JSON
  const carregarCategorias = async () => {
    try {
      const resp = await fetch("php/listar_categorias.php"); // Retorna JSON de categorias
      const categorias = await resp.json();
      selectCategoria.innerHTML = '<option value="">Selecione...</option>';
      categorias.forEach(cat => {
        selectCategoria.innerHTML += `<option value="${cat.idCategoriaProduto}">${cat.nome} (${cat.desconto || 0}%)</option>`;
      });
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
    }
  };

  // Carregar produtos
  const carregarProdutos = async (filtro = "") => {
    try {
      const resp = await fetch("php/cadastro_produtos.php"); // Retorna JSON de produtos
      const produtos = await resp.json();
      lista.innerHTML = "";

      produtos
        .filter(prod => prod.nome.toLowerCase().includes(filtro.toLowerCase()))
        .forEach(prod => {
          const imgSrc = prod.imagem ? `data:${prod.mime};base64,${prod.imagem}` : "";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${prod.idProdutos}</td>
            <td>${imgSrc ? `<img src="${imgSrc}" class="prod-thumb rounded border">` : ""}</td>
            <td>${prod.nome}</td>
            <td>${prod.marca || "-"}</td>
            <td>${prod.categoria || "-"}</td>
            <td class="text-end">${prod.quantidade || 0}</td>
            <td class="text-end">R$ ${prod.preco?.toFixed(2) || "0,00"}</td>
            <td class="text-end">${prod.desconto ? `R$ ${(prod.preco - (prod.preco*prod.desconto/100)).toFixed(2)}` : "—"}</td>
            <td>${prod.codigo || "-"}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-secondary" onclick="editarProduto(${prod.idProdutos})">Editar</button>
              <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${prod.idProdutos})">Excluir</button>
            </td>
          `;
          lista.appendChild(tr);
        });
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  // Cadastrar ou atualizar produto
  formProduto.addEventListener("submit", async e => {
    e.preventDefault();
    const dados = new FormData(formProduto);
    try {
      const resp = await fetch("php/cadastro_produtos.php", { method: "POST", body: dados });
      const result = await resp.json();
      alert(result.msg);
      formProduto.reset();
      carregarProdutos();
    } catch (err) {
      alert("Erro ao cadastrar produto.");
      console.error(err);
    }
  });

  // Busca em tempo real
  if (buscaInput) {
    buscaInput.addEventListener("input", e => {
      carregarProdutos(e.target.value);
    });
  }

  // Função global para editar produto
  window.editarProduto = async (id) => {
    try {
      const resp = await fetch(`php/cadastro_produtos.php?id=${id}`);
      const prod = await resp.json();
      if (prod.ok) {
        // Preenche o formulário com os dados do produto
        formProduto.nomeproduto.value = prod.produto.nome;
        formProduto.quantidade.value = prod.produto.quantidade;
        formProduto.preco.value = prod.produto.preco;
        formProduto.precopromocional.value = prod.produto.preco_promocional || "";
        formProduto.tamanho.value = prod.produto.tamanho || "";
        formProduto.cor.value = prod.produto.cor || "";
        formProduto.codigo.value = prod.produto.codigo || "";
        formProduto.idCategoriaProduto.value = prod.produto.idCategoriaProduto || "";
        formProduto.marcaproduto.value = prod.produto.marca || "";
        // Se quiser, carregar imagens também
      }
    } catch (err) {
      console.error("Erro ao editar produto:", err);
    }
  };

  // Função global para excluir produto
  window.excluirProduto = async (id) => {
    if(!confirm("Deseja realmente excluir este produto?")) return;
    try {
      const resp = await fetch(`php/excluir_produto.php?id=${id}`, { method:"DELETE" });
      const result = await resp.json();
      alert(result.msg);
      carregarProdutos();
    } catch(err) {
      console.error("Erro ao excluir produto:", err);
      alert("Erro ao excluir produto.");
    }
  };

  // Inicializa
  carregarCategorias();
  carregarProdutos();
});

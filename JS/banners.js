document.addEventListener("DOMContentLoaded", () => {
  const formBanner = document.querySelector("form"); // seu form de banners
  const lista = document.querySelector(".table-list tbody");
  const buscaInput = document.createElement("input"); // caso queira busca, pode adicionar ao DOM

  // ===================== LISTAR BANNERS =====================
  const carregarBanners = async (filtro = "") => {
    try {
      const resp = await fetch("../php/banners_unificado.php");
      const data = await resp.json();
      lista.innerHTML = "";

      if (!data.ok) throw new Error(data.msg || "Erro ao carregar banners");

      data.banners
        .filter(b => b.descricao.toLowerCase().includes(filtro.toLowerCase()))
        .forEach(b => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${b.idBanners}</td>
            <td>${b.descricao}</td>
            <td>${b.data_inicio}</td>
            <td>${b.data_validade}</td>
            <td>${b.categoria || "Sem categoria"}</td>
            <td>${b.link || ""}</td>
            <td class="text-end">
              <button class="btn-editar" onclick="editarBanner(${b.idBanners})">Editar</button>
              <button class="btn-excluir" onclick="excluirBanner(${b.idBanners})">Excluir</button>
            </td>
          `;
          lista.appendChild(tr);
        });
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // ===================== CADASTRAR / ATUALIZAR =====================
  formBanner.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(formBanner);
    const acao = formData.get("acao") || "cadastrar"; // determinar ação
    formData.set("acao", acao);

    try {
      const resp = await fetch("../php/banners_unificado.php", {
        method: "POST",
        body: formData
      });
      const result = await resp.json();

      if (result.ok) {
        alert(result.msg);
        formBanner.reset();
        carregarBanners();
      } else {
        alert("Erro: " + result.msg);
      }
    } catch (err) {
      alert("Erro: " + err.message);
    }
  });

  // ===================== FUNÇÃO EDITAR =====================
  window.editarBanner = async (id) => {
    try {
      // Buscar dados do banner pelo ID
      const resp = await fetch(`../php/banners_unificado.php?id=${id}`);
      const data = await resp.json();
      if (!data.ok) throw new Error(data.msg || "Erro ao buscar banner");

      const banner = data.banners.find(b => b.idBanners == id);
      if (!banner) throw new Error("Banner não encontrado");

      // Preencher formulário
      formBanner.querySelector("[name='id']").value = banner.idBanners;
      formBanner.querySelector("[name='descricao']").value = banner.descricao;
      formBanner.querySelector("[name='data_inicio']").value = banner.data_inicio;
      formBanner.querySelector("[name='data_validade']").value = banner.data_validade;
      formBanner.querySelector("[name='link']").value = banner.link || "";
      formBanner.querySelector("[name='idCategoriaProduto']").value = banner.idCategoriaProduto || "";

      // Alterar ação para atualizar
      formBanner.querySelector("[name='acao']").value = "atualizar";
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // ===================== FUNÇÃO EXCLUIR =====================
  window.excluirBanner = async (id) => {
    if (!confirm("Deseja realmente excluir este banner?")) return;
    const formData = new FormData();
    formData.append("acao", "excluir");
    formData.append("id", id);

    try {
      const resp = await fetch("../php/banners_unificado.php", {
        method: "POST",
        body: formData
      });
      const result = await resp.json();

      if (result.ok) {
        alert(result.msg);
        carregarBanners();
      } else {
        alert("Erro: " + result.msg);
      }
    } catch (err) {
      alert("Erro: " + err.message);
    }
  };

  // Carregar inicialmente
  carregarBanners();
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("formBanner");
  const listaBanners = document.getElementById("listaBanners");
  const inputFoto = document.getElementById("foto");
  const preview = document.getElementById("preview");

  // ===============================
  // 1️⃣  PRÉ-VISUALIZAR IMAGEM
  // ===============================
  inputFoto.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (ev) {
        preview.src = ev.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // ===============================
  // 2️⃣  LISTAR BANNERS AO CARREGAR
  // ===============================
  listarBanners();

  function listarBanners() {
    fetch("cadastrar_banner.php")
      .then((res) => res.json())
      .then((data) => {
        listaBanners.innerHTML = "";
        if (data.ok && data.banners.length > 0) {
          data.banners.forEach((b) => {
            const div = document.createElement("div");
            div.classList.add("banner-item");

            div.innerHTML = `
              <img src="${b.imagem}" alt="Banner" class="banner-img">
              <div class="banner-info">
                <p><strong>${b.descricao}</strong></p>
                <p>Início: ${b.data_inicio || "-"} | Validade: ${b.data_validade || "-"}</p>
              </div>
              <button class="btn-excluir" data-id="${b.idBanners}">Excluir</button>
            `;
            listaBanners.appendChild(div);
          });
        } else {
          listaBanners.innerHTML = "<p>Nenhum banner cadastrado.</p>";
        }
      })
      .catch((err) => {
        console.error("Erro ao listar banners:", err);
        listaBanners.innerHTML = "<p>Erro ao carregar banners.</p>";
      });
  }

  // ===============================
  // 3️⃣  CADASTRAR NOVO BANNER
  // ===============================
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("acao", "cadastrar");

    fetch("cadastrar_banner.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          alert(data.msg);

          // Mostrar banner recém-cadastrado no quadro sem recarregar
          if (data.banner) {
            const b = data.banner;
            const div = document.createElement("div");
            div.classList.add("banner-item");
            div.innerHTML = `
              <img src="${b.imagem}" alt="Banner" class="banner-img">
              <div class="banner-info">
                <p><strong>${b.descricao}</strong></p>
                <p>Início: ${b.data_inicio || "-"} | Validade: ${b.data_validade || "-"}</p>
              </div>
              <button class="btn-excluir" data-id="${b.idBanners}">Excluir</button>
            `;
            listaBanners.prepend(div);
          }

          // Limpar formulário
          form.reset();
          preview.style.display = "none";
        } else {
          alert("Erro: " + data.msg);
        }
      })
      .catch((err) => {
        console.error("Erro no envio:", err);
        alert("Erro ao cadastrar banner.");
      });
  });

  // ===============================
  // 4️⃣  EXCLUIR BANNER
  // ===============================
  listaBanners.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-excluir")) {
      const id = e.target.getAttribute("data-id");
      if (!confirm("Deseja excluir este banner?")) return;

      const formData = new FormData();
      formData.append("acao", "excluir");
      formData.append("id", id);

      fetch("cadastrar_banner.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            alert(data.msg);
            e.target.closest(".banner-item").remove();
          } else {
            alert("Erro: " + data.msg);
          }
        })
        .catch((err) => {
          console.error("Erro ao excluir:", err);
        });
    }
  });
});

// chama a função
listarBanners("tbBanners");

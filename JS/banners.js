document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formBanner");
  const categoriaSelect = form.querySelector("select[name='idCategoriaProduto']");
  const imagemInput = form.querySelector("input[name='imagem']");
  const previewContainer = document.createElement("div");

  // Adiciona área de pré-visualização abaixo do input de imagem
  previewContainer.className = "mt-3";
  imagemInput.parentElement.appendChild(previewContainer);

  // 1️⃣ — Carrega categorias via PHP
  fetch("../PHP/cadastro_categorias.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.categorias) {
        categoriaSelect.innerHTML = `<option value="">Selecione...</option>`;
        data.categorias.forEach((cat) => {
          const option = document.createElement("option");
          option.value = cat.idCategoriaProduto;
          option.textContent = cat.nome;
          categoriaSelect.appendChild(option);
        });
      }
    })
    .catch((err) => console.error("Erro ao carregar categorias:", err));

  // 2️⃣ — Pré-visualiza imagem selecionada
  imagemInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    previewContainer.innerHTML = ""; // limpa anterior

    if (file) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = "Pré-visualização do banner";
      img.style.maxWidth = "300px";
      img.style.borderRadius = "10px";
      img.style.marginTop = "10px";
      img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      previewContainer.appendChild(img);
    }
  });

  // 3️⃣ — Envia formulário via AJAX para o PHP
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    fetch("../PHP/cadastrar_banner.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        if (data.status === "success") {
          form.reset();
          previewContainer.innerHTML = "";
        }
      })
      .catch((error) => {
        console.error("Erro ao cadastrar banner:", error);
        alert("Erro ao cadastrar banner. Verifique o console.");
      });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formProduto");
  const tabela = document.getElementById("tabelaProdutos");
  let editandoId = null;

  // Função para listar produtos
  async function listarProdutos() {
    const res = await fetch("cadastro_produtos.php", {
      method: "POST",
      body: new URLSearchParams({ acao: "listar" })
    });
    const produtos = await res.json();
    tabela.innerHTML = "";
    produtos.forEach(prod => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${prod.idProdutos}</td>
        <td>${prod.nome}</td>
        <td>${prod.descricao}</td>
        <td>${prod.preco.toFixed(2)}</td>
        <td>${prod.tamanho || ''}</td>
        <td>${prod.desconto || 0}</td>
        <td>${prod.statusproduto ? 'Ativo' : 'Inativo'}</td>
        <td>${prod.idCategoriaProduto || ''}</td>
        <td>${prod.imagem ? `<img src="${prod.imagem}" width="50">` : ''}</td>
        <td>
          <button class="editar" data-id="${prod.idProdutos}">Editar</button>
          <button class="excluir" data-id="${prod.idProdutos}">Excluir</button>
        </td>
      `;
      tabela.appendChild(tr);
    });
  }

  // Função para cadastrar ou atualizar produto
  async function salvarProduto(e) {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("acao", editandoId ? "atualizar" : "cadastrar");
    if(editandoId) formData.append("idProdutos", editandoId);

    const res = await fetch("cadastro_produtos.php", {
      method: "POST",
      body: formData
    });
    const json = await res.json();
    alert(json.mensagem);

    if(json.success) {
      form.reset();
      editandoId = null;
      listarProdutos();
    }
  }

  // Função para preencher o formulário para edição
  tabela.addEventListener("click", async (e) => {
    if(e.target.classList.contains("editar")) {
      const id = e.target.dataset.id;
      const res = await fetch("cadastro_produtos.php", {
        method: "POST",
        body: new URLSearchParams({ acao: "listar" })
      });
      const produtos = await res.json();
      const prod = produtos.find(p => p.idProdutos == id);
      if(prod) {
        editandoId = id;
        form.nome.value = prod.nome;
        form.descricao.value = prod.descricao;
        form.preco.value = prod.preco;
        form.tamanho.value = prod.tamanho;
        form.desconto.value = prod.desconto;
        form.statusproduto.checked = prod.statusproduto ? true : false;
        form.idCategoriaProduto.value = prod.idCategoriaProduto || '';
      }
    }

    if(e.target.classList.contains("excluir")) {
      const id = e.target.dataset.id;
      if(confirm("Deseja realmente excluir este produto?")) {
        const res = await fetch("cadastro_produtos.php", {
          method: "POST",
          body: new URLSearchParams({ acao: "excluir", idProdutos: id })
        });
        const json = await res.json();
        alert(json.mensagem);
        if(json.success) listarProdutos();
      }
    }
  });

  // Evento de submit do formulário
  form.addEventListener("submit", salvarProduto);

  // Carrega produtos ao iniciar
  listarProdutos();
});



// Função para listar categorias (usada em selects de produtos, por exemplo)
function listarcategorias(nomeid) {
  // Função assíncrona autoexecutável (IIFE) para permitir uso de await
  (async () => {
    // Seleciona o elemento HTML informado no parâmetro (ex: um <select>)
    const sel = document.querySelector(nomeid);

    try {
      // Faz a requisição ao PHP que retorna a lista de categorias
      const r = await fetch("../PHP/cadastro_categorias.php?listar=1");

      // Se o retorno do servidor for inválido (status diferente de 200), lança erro
      if (!r.ok) throw new Error("Falha ao listar categorias!");

      /*
        Se os dados vierem corretamente, o conteúdo retornado pelo PHP 
        (geralmente <option>...</option>) é inserido dentro do elemento HTML.
        innerHTML é usado para injetar esse conteúdo diretamente no campo.
      */
      sel.innerHTML = await r.text();
    } catch (e) {
      // Caso haja erro (rede, servidor, etc.), exibe uma mensagem dentro do select
      sel.innerHTML = "<option disable>Erro ao carregar</option>";
    }
  })();
}

// =========================================================================
// VARIÁVEIS E CONSTANTES GLOBAIS
// =========================================================================

// Caminhos da API PHP
const PRODUTOS_API = '../PHP/cadastro_produtos.php';
const CATEGORIAS_API = '../php/cadastro_categorias.php'; 

// Elementos do formulário de Produtos (seção 3 do seu HTML)
const prodForm = document.querySelector('form[action="../PHP/cadastro_produtos.php"]');
const prodAcaoInput = document.getElementById('prodAcao');
const prodIdInput = document.getElementById('prodId');

const prodNomeInput = document.getElementById('pNome');
const prodPrecoInput = document.getElementById('pPreco');
const prodDescontoInput = document.getElementById('pDesconto');
const prodTamanhoInput = document.getElementById('pTamanho');
const prodCatSelect = document.getElementById('prodCat'); // select de Categoria Relacionada
const prodDescricaoInput = document.getElementById('pDescricao');
const prodStatusSelect = document.getElementById('pStatus');

// Botões do formulário (na ordem do HTML)
const prodBtnCadastrar = document.getElementById('prodBtnCadastrar');
const prodBtnEditar = document.getElementById('prodBtnEditar');
const prodBtnExcluir = document.getElementById('prodBtnExcluir');

// Imagem
const pImgPrev = document.getElementById('pImgPrev');
const pImgPh = document.getElementById('pImgPh');
const pImgInput = document.getElementById('pImg'); // input type="file"

// Tabela
const listaProdutosTbody = document.getElementById('listaProdutos');

// Mapa para armazenar produtos em memória para busca rápida (Edição)
let produtosById = new Map();


// =========================================================================
// FUNÇÕES AUXILIARES
// =========================================================================

/**
 * Escapa texto para evitar injeção de HTML. (Função copiada do seu código)
 */
const esc = s => (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

/**
 * Placeholder (imagem cinza com "SEM IMAGEM"). (Função copiada do seu código)
 */
const ph = () => 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60">
        <rect width="100%" height="100%" fill="#eee"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-family="sans-serif" font-size="10" fill="#999">SEM IMAGEM</text>
    </svg>`
);

/**
 * Reseta o formulário de produtos para o estado de "Cadastro".
 */
function resetarFormularioProduto() {
    prodForm.reset();
    prodAcaoInput.value = 'cadastrar';
    prodIdInput.value = '';
    
    // Configura o botão principal para Cadastro
    if (prodBtnCadastrar) {
        prodBtnCadastrar.textContent = 'Cadastrar';
        prodBtnCadastrar.classList.remove('btn-warning');
        prodBtnCadastrar.classList.add('btn-primary');
    }
    
    // Reseta a prévia da imagem
    pImgPrev.src = '';
    pImgPrev.classList.add('d-none');
    pImgPh.classList.remove('d-none');
    pImgInput.required = true; // Imagem é obrigatória no cadastro

    // Remove a linha selecionada na tabela, se houver
    const selectedRow = listaProdutosTbody?.querySelector('.table-active');
    if (selectedRow) {
        selectedRow.classList.remove('table-active');
    }
}

/**
 * Monta a linha <tr> para a tabela de produtos.
 */
function createProductRow(p) {
    // Formata valores
    const precoFmt = p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const descontoAplicado = p.desconto > 0 ? `(-${p.desconto}%)` : '';
    const imgSrc = p.imagem ? `data:image/jpeg;base64,${p.imagem}` : ph();

    // Cria a linha (com data-id para referência)
    const row = document.createElement('tr');
    row.dataset.id = p.idProdutos;

    row.innerHTML = `
        <td>${p.idProdutos}</td>
        <td>
            <img src="${imgSrc}" alt="${esc(p.nome)}" width="64" height="48" class="rounded" style="object-fit:cover;">
        </td>
        <td>${esc(p.nome)}</td>
        <td>${p.nomeCategoria ? esc(p.nomeCategoria) : '-'}</td>
        <td>${p.tamanho ? esc(p.tamanho) : '-'}</td>
        <td>${precoFmt} ${descontoAplicado}</td>
        <td>${p.statusproduto ? 'Ativo' : 'Inativo'}</td>
        <td class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-info btn-edit-product">Editar</button>
            <button type="button" class="btn btn-sm btn-danger btn-delete-product">Excluir</button>
        </td>
    `;
    
    // Adiciona event listeners aos botões
    row.querySelector('.btn-edit-product').addEventListener('click', () => selecionarProdutoParaEdicao(p.idProdutos));
    row.querySelector('.btn-delete-product').addEventListener('click', () => excluirProduto(p.idProdutos));

    return row;
}

// =========================================================================
// 1. LISTAGEM (LOAD/RELOAD)
// =========================================================================

/**
 * Busca produtos, armazena em memória e preenche a tabela.
 */
async function carregarProdutos() {
    if (!listaProdutosTbody) return;
    listaProdutosTbody.innerHTML = `<tr><td colspan="8" class="text-center text-info">Carregando produtos...</td></tr>`;

    try {
        const response = await fetch(`${PRODUTOS_API}?listar=true`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        
        produtosById.clear();
        listaProdutosTbody.innerHTML = '';

        if (!data.ok || !data.produtos?.length) {
            listaProdutosTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Nenhum produto cadastrado.</td></tr>`;
            return;
        }

        data.produtos.forEach(p => {
            produtosById.set(String(p.idProdutos), p); // Armazena para edição
            listaProdutosTbody.appendChild(createProductRow(p));
        });

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        listaProdutosTbody.innerHTML = `<tr><td colspan="8" class="text-danger text-center">Falha ao carregar produtos: ${esc(error.message)}</td></tr>`;
    }
}


// =========================================================================
// 2. SELEÇÃO E EDIÇÃO
// =========================================================================

/**
 * Preenche o formulário com os dados do produto selecionado.
 * @param {number} id O ID do produto a ser editado.
 */
function selecionarProdutoParaEdicao(id) {
    const produto = produtosById.get(String(id));
    if (!produto) {
        alert('Produto não encontrado no cache.');
        return;
    }

    // 1. Limpa seleção anterior e aplica nova
    listaProdutosTbody.querySelectorAll('tr').forEach(row => row.classList.remove('table-active'));
    const selectedRow = listaProdutosTbody.querySelector(`tr[data-id="${id}"]`);
    if (selectedRow) selectedRow.classList.add('table-active');

    // 2. Preenche os campos do formulário
    prodIdInput.value = produto.idProdutos;
    prodNomeInput.value = produto.nome;
    
    // Campos numéricos podem precisar de conversão para string e vírgula
    prodPrecoInput.value = produto.preco ? String(produto.preco).replace('.', ',') : '0,00';
    prodDescontoInput.value = produto.desconto ? String(produto.desconto).replace('.', ',') : '0,00';
    
    prodTamanhoInput.value = produto.tamanho;
    prodDescricaoInput.value = produto.descricao;
    prodStatusSelect.value = produto.statusproduto ? '1' : '0';
    
    // Seleciona a categoria correta (ID da FK)
    prodCatSelect.value = produto.idCategoriaProduto;
    
    // 3. Configura a Imagem
    if (produto.imagem) {
        pImgPrev.src = `data:image/jpeg;base64,${produto.imagem}`; 
        pImgPrev.classList.remove('d-none');
        pImgPh.classList.add('d-none');
        pImgInput.required = false; // Imagem não é obrigatória na edição
    } else {
        pImgPrev.src = '';
        pImgPrev.classList.add('d-none');
        pImgPh.classList.remove('d-none');
        pImgInput.required = false; 
    }

    // 4. Atualiza o estado dos botões para "Editar/Salvar"
    prodAcaoInput.value = 'editar';
    if (prodBtnCadastrar) {
        prodBtnCadastrar.textContent = 'Salvar Edição';
        prodBtnCadastrar.classList.remove('btn-primary');
        prodBtnCadastrar.classList.add('btn-warning');
    }

    // Rola até o formulário
    document.getElementById('produtos').scrollIntoView({ behavior: 'smooth' });
}

// =========================================================================
// 3. SUBMISSÃO DO FORMULÁRIO (CADASTRO / EDIÇÃO)
// =========================================================================

/**
 * Intercepta o SUBMIT para tratar o feedback e atualizar a lista.
 */
prodForm?.addEventListener('submit', async (e) => {
    // Sempre previne o comportamento padrão (evita o redirecionamento imediato)
    e.preventDefault(); 
    
    // O formulário de produto deve usar 'multipart/form-data' por causa da imagem.
    const formData = new FormData(prodForm);
    
    // Ajusta a ação (já deveria estar no campo hidden, mas garante)
    const acao = prodAcaoInput.value || 'cadastrar';
    formData.set('acao', acao);
    
    try {
        const response = await fetch(PRODUTOS_API, {
            method: 'POST',
            body: formData 
        });

        // O PHP está configurado para *redirecionar* com `redirect_with`.
        // A melhor forma de lidar com isso é com a resposta do servidor:

        if (response.redirected) {
             // Redirecionamento detectado. Extrai os parâmetros de sucesso/erro da URL
            const url = new URL(response.url);
            const params = url.searchParams;

            if (params.has('cadastro_produto') || params.has('editar_produto')) {
                alert(`Produto ${acao === 'editar' ? 'atualizado' : 'cadastrado'} com sucesso!`);
            } else if (params.has('erro_produto')) {
                 alert(`Falha na operação: ${params.get('erro_produto')}`);
            } else {
                 alert(`Operação realizada, mas o feedback foi incompleto. Status: ${acao}.`);
            }
        } else {
            // Se o PHP retornar um erro HTTP (ex: 500) ou JSON diretamente
            const text = await response.text(); // Lê o texto para tentar detectar o problema
            alert(`Erro do Servidor. Status: ${response.status}. Resposta: ${text.substring(0, 100)}...`);
        }
        
        resetarFormularioProduto();
        await carregarProdutos(); // Recarrega a tabela

    } catch (error) {
        console.error(`Erro na submissão (${acao}):`, error);
        alert('Erro de rede ou servidor ao tentar salvar o produto.');
    }
});


// =========================================================================
// 4. EXCLUSÃO
// =========================================================================

/**
 * Envia requisição para excluir um produto.
 * @param {number} id O ID do produto a ser excluído.
 */
async function excluirProduto(id) {
    const produto = produtosById.get(String(id));
    if (!produto) return;
    
    if (!confirm(`Deseja realmente excluir o produto ID ${id}: "${produto.nome}"?`)) {
        return;
    }

    const formData = new FormData();
    formData.append('acao', 'excluir');
    formData.append('id', id); 
    
    try {
        const response = await fetch(PRODUTOS_API, {
            method: 'POST',
            body: formData
        });

        if (response.redirected) {
             const url = new URL(response.url);
             const params = url.searchParams;

             if (params.has('excluir_produto')) {
                 alert(`Produto ID ${id} excluído com sucesso!`);
             } else if (params.has('erro_produto')) {
                 alert(`Falha na exclusão: ${params.get('erro_produto')}`);
             }
        } else {
            const text = await response.text();
            alert(`Erro do Servidor na exclusão. Status: ${response.status}. Resposta: ${text.substring(0, 100)}...`);
        }
        
        resetarFormularioProduto();
        await carregarProdutos(); 

    } catch (error) {
        console.error('Erro na exclusão:', error);
        alert('Erro de rede ao tentar excluir.');
    }
}


// =========================================================================
// 5. EVENT LISTENERS E INICIALIZAÇÃO
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega a lista de produtos na tabela
    carregarProdutos();
    
    // 2. Reseta o formulário para garantir que está em modo "Cadastrar"
    resetarFormularioProduto();
    
    // 3. Preenchimento de Selects (usando a sua função)
    // Assumindo que você chamará essas funções após este script:
    // listarcategorias("#prodCat"); 
    // carregarMarcasSelect("#proMarca"); 
    
    // 4. Ajusta botões do formulário (que agora são secundários)
    
    // Botão "Editar" do formulário: clica na primeira linha selecionada ou avisa
    prodBtnEditar?.addEventListener('click', (e) => {
        e.preventDefault();
        const id = prodIdInput.value;
        if (!id) {
            alert('Selecione um produto na lista (clique no botão "Editar" da linha) para preencher o formulário.');
            return;
        }
        selecionarProdutoParaEdicao(id); // Reativa a edição se já estiver preenchido
    });
    
    // Botão "Excluir" do formulário: aciona a função de exclusão
    prodBtnExcluir?.addEventListener('click', (e) => {
        e.preventDefault();
        const id = prodIdInput.value;
        if (!id) {
            alert('Selecione um produto na lista (clique no botão "Excluir" da linha) para remover.');
            return;
        }
        excluirProduto(Number(id));
    });
});


(function categoriasCRUD() {
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Elementos do Formulário
    const form = document.querySelector('form[action="../php/cadastro_categorias.php"]');
    if (!form) return;

    // Elementos baseados na nossa discussão de IDs/Nomes:
    const sel       = document.getElementById('categoriaLista');             // SELECT das categorias criadas
    const inNome    = form.querySelector('input[name="nomecategoria"]');     // Campo Nome
    const inDesc    = form.querySelector('input[name="desconto"]');          // Campo Desconto

    // Campos ocultos (serão criados se não existirem, mas o ideal é que estejam no HTML)
    let inAcao = form.querySelector('#catAcao');
    if (!inAcao) {
      inAcao = document.createElement('input');
      inAcao.type = 'hidden'; inAcao.name = 'acao'; inAcao.id = 'catAcao';
      form.prepend(inAcao);
    }
    let inId = form.querySelector('#catId');
    if (!inId) {
      inId = document.createElement('input');
      inId.type = 'hidden'; inId.name = 'id'; inId.id = 'catId';
      form.prepend(inId);
    }
    
    // Botões (agora buscando por ID para maior consistência)
    const btnCadastrar = document.getElementById('catBtnCadastrar'); // Botão principal (Cadastrar/Salvar)
    const btnEditar    = document.getElementById('catBtnEditar');    // Botão auxiliar de Edição
    const btnExcluir   = document.getElementById('catBtnExcluir');   // Botão auxiliar de Exclusão


    // 2. Funções de Estado
    function modoEdicaoOn(categoria) {
      inId.value   = categoria.id;
      inNome.value = categoria.nome; 
      // Converte o ponto do JSON para vírgula, se for o formato que o seu input espera
      inDesc.value = String(categoria.desconto).replace('.', ',');
      
      inAcao.value = 'atualizar'; // Define a ação padrão do formulário como 'atualizar' no modo edição
      
      // Muda o botão principal para indicar modo edição
      if (btnCadastrar) {
          btnCadastrar.textContent = 'Modo Edição Ativo';
          btnCadastrar.classList.remove('btn-primary');
          btnCadastrar.classList.add('btn-secondary');
      }
      
      // Ativa os botões de ação auxiliar
      btnEditar?.removeAttribute('disabled');
      btnExcluir?.removeAttribute('disabled');
    }
    
    function modoEdicaoOff() {
      form.reset();
      inAcao.value = 'cadastrar'; // Volta para a ação de 'cadastrar'
      inId.value = '';

      if (btnCadastrar) {
          btnCadastrar.textContent = 'Cadastrar';
          btnCadastrar.classList.remove('btn-secondary');
          btnCadastrar.classList.add('btn-primary');
      }
      
      // Desativa os botões de ação auxiliar
      btnEditar?.setAttribute('disabled', 'true');
      btnExcluir?.setAttribute('disabled', 'true');
    }

    // 3. Carregamento de Dados (Assíncrono)
    let categoriasById = new Map();
    try {
      // Requisita a lista completa em JSON (incluindo desconto)
      const r = await fetch(`${CATEGORIAS_API}?listar=1&format=json`, { cache: 'no-store' });
      const d = await r.json();
      if (d?.ok && Array.isArray(d.categorias)) {
        d.categorias.forEach(c => categoriasById.set(String(c.id), c));
      }
    } catch(e) {
      console.error('Falha ao carregar categorias JSON:', e);
    }

    modoEdicaoOff(); // Inicia em modo cadastro

    // 4. Evento de Seleção (SELECT)
    sel?.addEventListener('change', () => {
      const id = sel.value;
      if (!id) {
          modoEdicaoOff();
          return;
      }

      const categoria = categoriasById.get(String(id));
      if (categoria) {
        modoEdicaoOn(categoria);
      } else {
        alert('Dados da categoria não encontrados para edição.');
        modoEdicaoOff();
      }
    });

    // 5. Ações dos Botões Auxiliares (Editar / Excluir)
    
    // Botão EDITAR -> acao=atualizar
    btnEditar?.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (!inId.value) {
        alert('Selecione uma categoria em "Categorias criadas" para editar.');
        return;
      }
      inAcao.value = 'atualizar'; // Sobrescreve a ação (caso o botão principal não faça isso)
      form.submit();
    });

    // Botão EXCLUIR -> acao=excluir
    btnExcluir?.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (!inId.value) {
        alert('Selecione uma categoria em "Categorias criadas" para excluir.');
        return;
      }
      if (!confirm('Deseja realmente excluir esta categoria? Esta ação é irreversível!')) return;
      inAcao.value = 'excluir'; // Sobrescreve a ação
      form.submit();
    });
    
    // O botão Cadastrar (submit) usará a acao definida em inAcao (padrão 'cadastrar')

    // 6. Feedback e Recarregamento (Após o PHP redirecionar)
    const params = new URLSearchParams(window.location.search);
        
    if (params.has('cadastro_categoria') || params.has('editar_categoria') || params.has('excluir_categoria')) {
        setTimeout(() => {
            alert('Operação de categoria realizada com sucesso!');
            // Recarrega o SELECT de categorias usando a sua função original
            listarcategorias('#categoriaLista'); 
            // Limpa os parâmetros da URL para que o alerta não apareça novamente ao recarregar
            history.replaceState({}, document.title, window.location.pathname); 
        }, 100);
    } else if (params.has('erro_categoria')) {
         setTimeout(() => {
            alert('Erro na operação de categoria: ' + params.get('erro_categoria'));
            history.replaceState({}, document.title, window.location.pathname);
         }, 100);
    }
    
    // Se o SELECT de produtos relacionado também precisar ser atualizado
    if (params.has('cadastro_categoria') || params.has('editar_categoria') || params.has('excluir_categoria')) {
        listarcategorias('#prodCat'); 
    }
  });
})();






listarcategorias("#categoriaLista");
listarcategorias("#prodCat");
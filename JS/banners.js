// =========================================================================
// VARIÁVEIS E CONSTANTES GLOBAIS DE BANNERS
// =========================================================================
const BANNERS_API = '../php/banners.php';

// 1. Elementos do Formulário de Banner
const formBanner = document.getElementById('formBanner');
const tbBanners = document.getElementById('tbBanners');

// Inputs e Campos Ocultos
const inAcao = document.getElementById('acao'); // Campo Hidden 'acao'
const inIdBanner = document.getElementById('idBanner'); // Campo Hidden 'id'
const inFoto = formBanner?.querySelector('input[name="foto"]');
const inData = formBanner?.querySelector('input[name="data"]');
const selCategoriaBanner = document.getElementById('categoriaBanner');
const inDescricao = formBanner?.querySelector('input[name="descricao"]');
const inLink = formBanner?.querySelector('input[name="link"]');

// Botões
const btnCadastrar = document.getElementById('btnCadastrar');
const btnExcluir = document.getElementById('btnExcluir');

// Elemento de Prévia
const previewBanner = document.getElementById('previewBanner');

// Mapa para armazenar dados de banners em memória
let bannersById = new Map();


// =========================================================================
// FUNÇÕES AUXILIARES
// =========================================================================

/**
 * Cria o HTML para a linha da tabela de banners.
 * @param {Object} banner O objeto banner retornado pelo PHP.
 */
function createBannerRow(banner) {
    // Formata a data (se houver)
    const validade = banner.validade ? new Date(banner.validade).toLocaleDateString('pt-BR') : '-';
    
    // Imagem (assumindo que o PHP retorna a URL ou Base64)
    // Se o PHP retornar apenas o nome do arquivo, adapte o caminho:
    // const imgSrc = `../CAMINHO_DAS_IMAGENS/${banner.imagem}`;
    // Usaremos um placeholder caso o campo `imagem` não seja uma URL completa
    const imgSrc = banner.imagem || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Transparente 1x1

    const row = document.createElement('tr');
    row.dataset.id = banner.id;
    row.classList.add('banner-row'); // Classe para identificar a linha

    row.innerHTML = `
        <td><img src="${imgSrc}" alt="${banner.descricao || 'Banner'}" style="width:100px; height:60px; object-fit: cover;" class="rounded"></td>
        <td>${banner.descricao || '-'}</td>
        <td>${validade}</td>
        <td>${banner.nomeCategoria || 'Todas'}</td>
        <td>${banner.link || '-'}</td>
        <td class="text-end">
            <button type="button" class="btn btn-sm btn-info btn-edit-banner" data-id="${banner.id}">Editar</button>
        </td>
    `;
    
    // Adiciona listener na linha para seleção (ou usa o botão "Editar")
    row.addEventListener('click', () => selecionarBannerParaEdicao(banner.id));
    
    return row;
}

/**
 * Reseta o formulário de banners para o estado de "Cadastro".
 */
function resetarFormularioBanner() {
    formBanner.reset();
    inAcao.value = 'cadastrar';
    inIdBanner.value = '';
    
    // Configura o botão principal para Cadastro
    if (btnCadastrar) {
        btnCadastrar.textContent = 'Cadastrar';
        btnCadastrar.classList.remove('btn-warning');
        btnCadastrar.classList.add('btn-primary');
    }
    
    // Desativa o botão de exclusão
    btnExcluir?.setAttribute('disabled', 'true');

    // Reseta a prévia da imagem
    previewBanner.innerHTML = '<span class="text-muted">Prévia</span>';
    previewBanner.style.backgroundImage = 'none';
    
    // Remove a linha selecionada na tabela
    tbBanners?.querySelectorAll('.table-active').forEach(row => row.classList.remove('table-active'));
}


// =========================================================================
// 1. LISTAGEM (LOAD/RELOAD)
// =========================================================================

/**
 * Busca banners, armazena em memória e preenche a tabela.
 */
async function carregarBanners() {
    if (!tbBanners) return;
    tbBanners.innerHTML = `<tr><td colspan="6" class="text-center text-info">Carregando banners...</td></tr>`;

    try {
        // Pedimos todos os dados via JSON para preencher a tabela e o mapa de edição
        const response = await fetch(`${BANNERS_API}?listar=true`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        
        const data = await response.json();
        
        bannersById.clear();
        tbBanners.innerHTML = '';

        if (!data.ok || !Array.isArray(data.banners) || data.banners.length === 0) {
            tbBanners.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Nenhum banner cadastrado.</td></tr>`;
            return;
        }

        data.banners.forEach(b => {
            bannersById.set(String(b.id), b); // Armazena para edição
            tbBanners.appendChild(createBannerRow(b));
        });

    } catch (error) {
        console.error('Erro ao carregar banners:', error);
        tbBanners.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Falha ao carregar banners: ${error.message}</td></tr>`;
    }
}


// =========================================================================
// 2. SELEÇÃO E EDIÇÃO
// =========================================================================

/**
 * Preenche o formulário com os dados do banner selecionado.
 * @param {number} id O ID do banner a ser editado.
 */
function selecionarBannerParaEdicao(id) {
    const banner = bannersById.get(String(id));
    if (!banner) {
        alert('Banner não encontrado. Recarregue a página.');
        return;
    }

    // 1. Limpa seleção anterior e aplica nova
    tbBanners.querySelectorAll('.banner-row').forEach(row => row.classList.remove('table-active'));
    const selectedRow = tbBanners.querySelector(`tr[data-id="${id}"]`);
    if (selectedRow) selectedRow.classList.add('table-active');

    // 2. Preenche os campos do formulário
    inIdBanner.value = banner.id;
    inData.value = banner.validade || ''; 
    inDescricao.value = banner.descricao || '';
    inLink.value = banner.link || '';
    selCategoriaBanner.value = banner.idCategoriaProduto || '';
    
    // 3. Configura a Prévia da Imagem
    if (banner.imagem) {
        // Se o PHP retorna a URL completa (ou base64), usa como background
        previewBanner.style.backgroundImage = `url(${banner.imagem})`; 
        previewBanner.innerHTML = '';
        previewBanner.style.backgroundSize = 'cover';
        previewBanner.style.backgroundPosition = 'center';
    } else {
        previewBanner.style.backgroundImage = 'none';
        previewBanner.innerHTML = '<span class="text-muted">Sem Imagem</span>';
    }

    // 4. Atualiza o estado dos botões para "Editar/Salvar"
    inAcao.value = 'atualizar';
    if (btnCadastrar) {
        btnCadastrar.textContent = 'Salvar Edição';
        btnCadastrar.classList.remove('btn-primary');
        btnCadastrar.classList.add('btn-warning');
    }
    btnExcluir?.removeAttribute('disabled');
    
    // Rola até o formulário
    formBanner?.scrollIntoView({ behavior: 'smooth' });
}


// =========================================================================
// 3. SUBMISSÃO DO FORMULÁRIO (CADASTRO / EDIÇÃO)
// =========================================================================

formBanner?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const acao = inAcao.value || 'cadastrar';
    const formData = new FormData(formBanner);
    formData.set('acao', acao);
    
    // Se estiver editando e não enviou nova foto, remove do FormData para o PHP ignorar
    if (acao === 'atualizar' && inFoto.files.length === 0) {
        formData.delete('foto');
    }

    try {
        const response = await fetch(BANNERS_API, {
            method: 'POST',
            body: formData 
        });

        if (response.redirected) {
             const url = new URL(response.url);
             const params = url.searchParams;

             if (params.has('cadastro_banner') || params.has('editar_banner')) {
                 alert(`Banner ${acao === 'atualizar' ? 'atualizado' : 'cadastrado'} com sucesso!`);
             } else if (params.has('erro_banner')) {
                 alert(`Falha na operação: ${params.get('erro_banner')}`);
             } else {
                 alert(`Operação realizada, mas o feedback foi incompleto. Status: ${acao}.`);
             }
        } else {
            const text = await response.text(); 
            alert(`Erro do Servidor. Status: ${response.status}. Resposta: ${text.substring(0, 100)}...`);
        }
        
        resetarFormularioBanner();
        await carregarBanners(); // Recarrega a tabela

    } catch (error) {
        console.error(`Erro na submissão (${acao}):`, error);
        alert('Erro de rede ou servidor ao tentar salvar o banner.');
    }
});


// =========================================================================
// 4. EXCLUSÃO
// =========================================================================

btnExcluir?.addEventListener('click', async () => {
    const id = inIdBanner.value;
    const banner = bannersById.get(id);

    if (!id || !banner) {
        alert('Selecione um banner na lista para excluir.');
        return;
    }
    
    if (!confirm(`Deseja realmente excluir o banner ID ${id}?`)) {
        return;
    }

    const formData = new FormData();
    formData.append('acao', 'excluir');
    formData.append('id', id); 
    
    try {
        const response = await fetch(BANNERS_API, {
            method: 'POST',
            body: formData
        });

        if (response.redirected) {
             const url = new URL(response.url);
             const params = url.searchParams;

             if (params.has('excluir_banner')) {
                 alert(`Banner ID ${id} excluído com sucesso!`);
             } else if (params.has('erro_banner')) {
                 alert(`Falha na exclusão: ${params.get('erro_banner')}`);
             }
        } else {
            const text = await response.text();
            alert(`Erro do Servidor na exclusão. Status: ${response.status}. Resposta: ${text.substring(0, 100)}...`);
        }
        
        resetarFormularioBanner();
        await carregarBanners(); 

    } catch (error) {
        console.error('Erro na exclusão:', error);
        alert('Erro de rede ao tentar excluir o banner.');
    }
});


// =========================================================================
// 5. INICIALIZAÇÃO E LISTENER DA PRÉVIA DA IMAGEM
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Carrega dados
    carregarBanners();
    
    // 2. Preenche o select de categorias (usando a sua função)
    // NOTE: A função listarcategorias deve estar definida em outro script carregado.
    listarcategorias("#categoriaBanner"); 
    
    // 3. Inicializa o formulário em modo Cadastro
    resetarFormularioBanner();
    
    // 4. Prévia da Imagem
    inFoto?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewBanner.style.backgroundImage = `url(${e.target.result})`;
                previewBanner.innerHTML = '';
                previewBanner.style.backgroundSize = 'cover';
                previewBanner.style.backgroundPosition = 'center';
            };
            reader.readAsDataURL(file);
        }
    });

    // 5. Implementação Opcional: Clique na linha ativa o modo edição
    tbBanners?.addEventListener('click', (e) => {
        const row = e.target.closest('.banner-row');
        if (row) {
            const id = row.dataset.id;
            selecionarBannerParaEdicao(Number(id));
        }
    });
});

// chama a função
listarBanners("tbBanners");

function listarProdutos(tbodyId) {
  document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById(tbodyId);
    const url   = '../PHP/cadastro_produtos.php?listar=1';

    // Função de escape (evita XSS)
    const esc = s => (s || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    // Placeholder "SEM IMAGEM"
    const ph = () => 'data:image/svg+xml;base64,' + btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60">
         <rect width="100%" height="100%" fill="#eee"/>
         <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
               font-family="sans-serif" font-size="10" fill="#999">SEM IMAGEM</text>
       </svg>`
    );

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`Erro HTTP: ${r.status}`);
        return r.json();
      })
      .then(data => {
        tbody.innerHTML = '';

        if (!data.ok || !data.produtos?.length) {
          tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Nenhum produto encontrado.</td></tr>`;
          return;
        }

        data.produtos.forEach(p => {
          const precoFmt = Number(p.preco).toLocaleString('pt-BR', {
            style: 'currency', currency: 'BRL'
          });
          const descontoFmt = p.desconto ? `${p.desconto}%` : '-';
          const statusFmt = p.statusproduto == 1 ? 'Ativo' : 'Inativo';
          const imgSrc = p.imagem ? `data:image/jpeg;base64,${p.imagem}` : ph();

          const linha = `
            <tr>
              <td>${p.idProdutos}</td>
              <td><img src="${imgSrc}" alt="${esc(p.nome)}" width="64" height="48" class="rounded"></td>
              <td>${esc(p.nome)}</td>
              <td>${esc(p.categoria || '-')}</td>
              <td>${precoFmt}</td>
              <td>${descontoFmt}</td>
              <td>${statusFmt}</td>
            </tr>`;
          tbody.insertAdjacentHTML('beforeend', linha);
        });
      })
      .catch(err => {
        console.error('Erro ao listar produtos:', err);
        tbody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Erro ao carregar produtos.</td></tr>`;
      });
  });
}


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






listarcategorias("#categoriaLista");
listarcategorias("#prodCat");
// chama a função
listarProdutos("tabelaProdutos");

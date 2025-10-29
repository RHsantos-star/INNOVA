// função para listar banners em tabela
function listarBanners(tabelaBanners) {
  document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById(tabelaBanners);
    const url   = '../PHP/cadastro_banners.php?listar=1';

    const esc = s => (s||'').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));

    const row = b => `
      <tr>
        <td>${Number(b.idBanners) || ''}</td>
        <td>${esc(b.descricao || '-')}</td>
        <td>${esc(b.categoria || '-')}</td>
        <td>${esc(b.data_inicio || '-')}</td>
        <td>${esc(b.data_validade || '-')}</td>
        <td class="text-center">
          ${b.imagem ? `<img src="${b.imagem}" style="width:80px;height:auto;" />` : '-'}
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-warning" data-id="${b.idBanners}">Editar</button>
          <button class="btn btn-sm btn-danger"  data-id="${b.idBanners}">Excluir</button>
        </td>
      </tr>`;

    fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (!d.ok) throw new Error(d.msg || 'Erro ao listar banners');
        const banners = d.banners || [];
        tbody.innerHTML = banners.length
          ? banners.map(row).join('')
          : `<tr><td colspan="7" class="text-center text-muted">Nenhum banner cadastrado.</td></tr>`;
      })
      .catch(err => {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Falha ao carregar: ${esc(err.message)}</td></tr>`;
      });
  });
}

// chama a função
listarBanners("tbBanners");

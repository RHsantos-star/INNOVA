document.addEventListener('DOMContentLoaded', () => {
  const form  = document.getElementById('form-login');
  const cpfEl = document.getElementById('cpf');
  const senEl = document.getElementById('senha');

  // Função simples de mensagem
  const showMsg = (msg) => {
    alert(msg); // Pode trocar por toast ou modal do Bootstrap se quiser
  };

  // Evento de envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Captura os valores e limpa formatação do CPF/CNPJ
    const cpf   = (cpfEl.value || '').replace(/\D+/g, '').trim();
    const senha = (senEl.value || '').trim();

    if (!cpf || !senha) {
      showMsg('Preencha CPF/CNPJ e senha.');
      return;
    }

    try {
      // Caminho ajustado conforme estrutura
      const resp = await fetch('../PHP/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, senha })
      });

      const data = await resp.json();

      if (data.ok) {
        // Redireciona conforme tipo de usuário
        window.location.href = data.redirect;
      } else {
        showMsg(data.msg || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error(err);
      showMsg('Erro de conexão com o servidor.');
    }
  });
});

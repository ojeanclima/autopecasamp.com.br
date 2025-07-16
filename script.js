<script>
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form[name='educacional_form']");
  if (!form) return;

  // 🔒 Validação do desafio Turnstile antes do envio
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const tokenInput = document.querySelector('input[name="cf-turnstile-response"]');
    if (!tokenInput || !tokenInput.value) {
      alert("Por favor, complete a verificação de segurança.");
      return;
    }

    // Prepara os dados do formulário
    const dados = new FormData(form);
    const json = {};
    dados.forEach((v, k) => {
      if (form.querySelector(`[name="${k}"]`)?.type === "checkbox") {
        if (form.querySelector(`[name="${k}"]`).checked) json[k] = v;
      } else {
        json[k] = v;
      }
    });

    // Adiciona token ao JSON
    json['turnstile_token'] = tokenInput.value;

    try {
      const res = await fetch('/wp-json/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_fields: json })
      });

      const r = await res.json();
      alert(r?.mensagem || "❌ Erro desconhecido ao enviar.");

      // Redirecionamento (opcional)
      // if (r?.status === "sucesso") window.location.href = "/obrigado";

    } catch (err) {
      console.error("Erro no envio:", err);
      alert("❌ Erro técnico. Tente novamente.");
    }
  });

  // ⚙️ Renderiza Turnstile quando carregado
  turnstile.ready(function () {
    turnstile.render('#turnstile-container', {
      sitekey: '0x4AAAAAABlRmTGD85ZieXO7',
      callback: function (token) {
        const oldInput = document.querySelector('input[name="cf-turnstile-response"]');
        if (oldInput) oldInput.remove();

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'cf-turnstile-response';
        input.value = token;
        form.appendChild(input);
      }
    });
  });
});
</script>

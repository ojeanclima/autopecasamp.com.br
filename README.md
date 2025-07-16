Claro, Jean. Segue uma documentação em Markdown clara, objetiva e organizada, detalhando a aplicação e os principais arquivos/códigos que você mencionou:

---

# Documentação Técnica - Projeto AutoPeças AMP

## Visão Geral do Projeto

Esta aplicação integra um formulário de inscrição via front-end com backend WordPress e Google Apps Script, incorporando validação de segurança Cloudflare Turnstile. O fluxo consiste em:

* **Front-end (HTML + JS)**: Formulário para inscrição, preenchimento automático opcional, widget Turnstile e envio via REST API.
* **WordPress (functions.php)**: Endpoint REST API personalizado para receber o JSON, validar campos e token Turnstile, e encaminhar os dados ao Google Apps Script.
* **Google Apps Script (gscript.js)**: Recebe os dados, processa e grava em uma planilha Google Sheets.
* **mix.html**: Arquivo exemplo que contém o formulário com os scripts incorporados.

---

## 1. Arquivo: `functions.php` (WordPress)

### Objetivo

Registrar um endpoint REST API que recebe dados do formulário via JSON, valida campos obrigatórios e token Turnstile, e envia para Google Apps Script para armazenamento.

### Principais Funções

* `register_rest_route`: registra o endpoint `/wp-json/api/form` com método POST.
* `handle_form_submission`: função callback que valida dados e token, faz POST para Google Apps Script.
* `verificar_turnstile_token`: valida token do Cloudflare Turnstile via API.

### Estrutura resumida

```php
add_action('rest_api_init', function () {
  register_rest_route('api', '/form', [
    'methods'  => 'POST',
    'callback' => 'handle_form_submission',
    'permission_callback' => '__return_true',
  ]);
});

function handle_form_submission(WP_REST_Request $request) {
  // Valida JSON e campos obrigatórios
  // Valida token Turnstile
  // Envia para Google Apps Script
  // Retorna status e mensagem JSON
}

function verificar_turnstile_token($token) {
  // Faz requisição POST para Cloudflare validar token
  // Retorna true se válido, false caso contrário
}
```

### Observação

* Substitua `'SEU_ID_DO_SCRIPT'` pela URL real do seu Google Apps Script.
* Ajuste a chave secreta do Turnstile conforme a sua configuração.

---

## 2. Arquivo: `gscript.js` (Google Apps Script)

### Objetivo

Receber os dados via POST, parsear JSON, gravar as respostas em uma aba específica do Google Sheets.

### Função Principal

```javascript
function __go_post(e) {
  const ss = SpreadsheetApp.openById("ID_DA_PLANILHA");
  const sheet = ss.getSheetByName("Respostas");

  if (!sheet) return ContentService.createTextOutput("Erro: Aba não encontrada.");

  let data = {};
  try {
    const payload = JSON.parse(e.postData.contents);
    data = payload.form_fields || {};
  } catch (err) {
    return ContentService.createTextOutput("Erro ao processar JSON.");
  }

  // Monta linha de dados para registro
  const linha = [
    data.nome || '',
    data.idade || '',
    data.telefone || '',
    data.instagram || '',
    data.email || '',
    data.cidade || '',
    data.trabalhou_mecanica || '',
    data.contato_mecanica || '',
    data.disponibilidade || '',
    data.interesse || '',
    data.declaracao || '',
    new Date()
  ];

  sheet.appendRow(linha);

  return ContentService.createTextOutput("✅ Dados registrados com sucesso.");
}
```

### Observação

* Configure o ID da planilha para que o script acesse a planilha correta.
* Publique o script como **app da web** para permitir requisições HTTP externas.

---

## 3. Arquivo: `mix.html`

### Objetivo

Exemplo de formulário HTML integrado com o JavaScript para:

* Autopreencher campos simulados (botão de teste).
* Exibir widget Turnstile.
* Enviar dados via `fetch` para o endpoint WordPress.
* Redirecionar para limpar formulário após envio com sucesso.

### Estrutura resumida do JavaScript

```js
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form[name='educacional_form']");
  if (!form) return;

  // Autopreencher dados simulados
  document.getElementById('btn-autopreencher').addEventListener('click', () => {
    // Preenche campos com dados aleatórios
  });

  // Submissão do formulário
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Extrai campos, valida token
    // Envia JSON via fetch para endpoint WordPress
    // Exibe alertas e redireciona para limpar formulário
  });

  // Renderiza widget Turnstile e injeta token no formulário
});
```

---

## Considerações Finais

* **Segurança**: A validação do token Turnstile é fundamental para evitar spam e bots.
* **Fluxo**: O WordPress atua como intermediário, recebendo os dados, validando e enviando para o Google Apps Script.
* **Manutenção**: Garanta que URLs (Google Script, endpoint REST) e chaves (Turnstile) estejam sempre atualizadas.
* **Melhorias Futuras**: Adicionar logs, tratamento de erros mais robusto, e interface de administração para visualizar inscrições.

---

Se desejar, posso ajudar a gerar um README.md pronto para seu repositório, com mais exemplos e instruções de deploy. Quer?

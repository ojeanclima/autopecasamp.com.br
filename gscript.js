const TURNSTILE_SECRET = "0x4AAAAAABlRmRjSy4rz6F_CVHzHOw4FMpI";

function doPost(e) {
  const ss = SpreadsheetApp.openById("1DC9lCIDj1sek2IIKIbNkxvBQpxW7wN2nWUGS8fc6iUE");
  const sheet = ss.getSheetByName("Respostas");

  if (!sheet) {
    Logger.log("❌ Aba da planilha não encontrada.");
    return criarResposta("Erro: Aba da planilha não encontrada.");
  }

  let fields = {};
  let origem = "manual";

  try {
    if (e && e.postData && e.postData.contents) {
      const dados = JSON.parse(e.postData.contents);
      const brutos = dados.form_fields || {};

      // ✅ Converter keys do estilo "form_fields[nome]" para "nome"
      for (const k in brutos) {
        const novoKey = k.replace(/^form_fields\[|\]$/g, '');
        fields[novoKey] = brutos[k];
      }

      origem = "formulario";

      const camposObrigatorios = ["nome", "idade", "telefone", "email", "cidade"];
      const camposVazios = camposObrigatorios.filter(f => !fields[f] || fields[f].toString().trim() === "");
      if (camposVazios.length > 0) {
        Logger.log("⚠️ Campos obrigatórios ausentes: " + camposVazios.join(", "));
        origem = "simulado";
      }

      // 🔐 Validação Turnstile
      const token = fields["cf-turnstile-response"] || fields["turnstile_token"];
      if (origem === "formulario") {
        if (!token) {
          Logger.log("❌ Token ausente.");
          return criarResposta("Erro: Token de segurança ausente.");
        }
        const valido = verificarTurnstile(token);
        if (!valido) {
          Logger.log("❌ Token inválido.");
          return criarResposta("Erro: Token Turnstile inválido ou expirado.");
        }
        delete fields["cf-turnstile-response"];
        delete fields["turnstile_token"];
      }

    } else {
      origem = "simulado";
    }

    if (origem === "simulado") {
      const i = Math.floor(Math.random() * 9000) + 1000;
      fields = {
        nome: `Usuário Simulado ${i}`,
        idade: `${Math.floor(Math.random() * 10) + 16}`,
        telefone: `(62) 9${Math.floor(90000000 + Math.random() * 9999999)}`,
        instagram: `@simulado_${i}`,
        email: `simulado${i}@teste.com`,
        cidade: "Goiânia",
        trabalhou_mecanica: (i % 2 === 0) ? "Sim, já trabalhei na área" : "Não",
        contato_mecanica: (i % 3 === 0) ? "Sim, já fiz um curso" : "Não",
        disponibilidade: "Sim",
        interesse: "Participar por interesse técnico",
        declaracao: "Sim"
      };
      Logger.log("🧪 Dados simulados gerados: " + JSON.stringify(fields));
    }

    const linha = [
      fields.nome || '',
      fields.idade || '',
      fields.telefone || '',
      fields.instagram || '',
      fields.email || '',
      fields.cidade || '',
      fields.trabalhou_mecanica || '',
      fields.contato_mecanica || '',
      fields.disponibilidade || '',
      fields.interesse || '',
      fields.declaracao || '',
      new Date()
    ];

    sheet.appendRow(linha);
    Logger.log("✅ Dados registrados: " + JSON.stringify(linha));

    const origemTexto = origem === "formulario"
      ? "✅ Dados recebidos com sucesso e verificados pelo Turnstile!"
      : "ℹ️ Dados simulados registrados.";

    return criarResposta(origemTexto);

  } catch (err) {
    Logger.log("❌ Erro ao processar: " + err.message);
    return criarResposta("Erro ao processar: " + err.message);
  }
}

function criarResposta(mensagem) {
  return ContentService
    .createTextOutput(mensagem)
    .setMimeType(ContentService.MimeType.TEXT);
}

function verificarTurnstile(token) {
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const payload = {
    secret: TURNSTILE_SECRET,
    response: token
  };

  const options = {
    method: "post",
    payload: payload,
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const resultado = JSON.parse(response.getContentText());
    Logger.log("📩 Resposta Turnstile: " + response.getContentText());
    return resultado.success === true;
  } catch (err) {
    Logger.log("❌ Erro Turnstile: " + err.message);
    return false;
  }
}

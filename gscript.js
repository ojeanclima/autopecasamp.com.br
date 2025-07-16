function __go_post(e) {
  const ss = SpreadsheetApp.openById("1DC9lCIDj1sek2IIKIbNkxvBQpxW7wN2nWUGS8fc6iUE");
  const sheet = ss.getSheetByName("Respostas");

  if (!sheet) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "erro", mensagem: "Aba 'Respostas' não encontrada." })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  let data = {};
  try {
    if (e.postData && e.postData.contents) {
      const payload = JSON.parse(e.postData.contents);
      data = payload.form_fields || {};
    } else {
      throw new Error("Payload vazio");
    }
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "erro", mensagem: "Erro ao processar JSON: " + err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Validação básica
  if (!data.nome) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "erro", mensagem: "Campo obrigatório ausente: nome" })
    ).setMimeType(ContentService.MimeType.JSON);
  }

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

  return ContentService.createTextOutput(
    JSON.stringify({ status: "sucesso", mensagem: "✅ Dados registrados com sucesso." })
  ).setMimeType(ContentService.MimeType.JSON);
}

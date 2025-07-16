<?php

add_action('rest_api_init', function () {
  register_rest_route('api', '/form', [
    'methods' => 'POST',
    'callback' => 'handle_form_submission',
    'permission_callback' => '__return_true'
  ]);
});

function handle_form_submission(WP_REST_Request $request) {
  $data = $request->get_json_params();
  $fields = $data['form_fields'] ?? [];

  // 🛡️ Validação básica
  $required = ['nome', 'idade', 'telefone', 'email', 'cidade', 'turnstile_token'];
  foreach ($required as $campo) {
    if (empty($fields[$campo])) {
      return new WP_REST_Response(['status' => 'erro', 'mensagem' => "Campo obrigatório ausente: $campo"], 400);
    }
  }

  // 🔒 Verificação Turnstile
  $token = sanitize_text_field($fields['turnstile_token']);
  $verificado = verificar_turnstile_token($token);
  if (!$verificado) {
    return new WP_REST_Response(['status' => 'erro', 'mensagem' => 'Token inválido. Validação de segurança falhou.'], 403);
  }

  // Envia para Google Apps Script
  $response = wp_remote_post('https://script.google.com/macros/s/AKfycbwNk3SiHDZZzDkKVXaT4wGtSlwHZ5UpuECZxd5QPUPSP3k8z-3LrkAyCw13q3Wx61XxjQ/exec', [
    'headers' => ['Content-Type' => 'application/json'],
    'body' => json_encode(['form_fields' => $fields]),
    'timeout' => 15
  ]);

  if (is_wp_error($response)) {
    return new WP_REST_Response(['status' => 'erro', 'mensagem' => 'Erro ao enviar para planilha.'], 500);
  }

  return new WP_REST_Response(['status' => 'sucesso', 'mensagem' => '✅ Dados enviados com sucesso!'], 200);
}

function verificar_turnstile_token($token) {
  $secret = '0x4AAAAAABlRmRjSy4rz6F_CVHzHOw4FMpI';
  $response = wp_remote_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
    'body' => [
      'secret' => $secret,
      'response' => $token,
    ],
    'timeout' => 10,
  ]);

  if (is_wp_error($response)) return false;

  $body = json_decode(wp_remote_retrieve_body($response), true);
  return isset($body['success']) && $body['success'] === true;
}

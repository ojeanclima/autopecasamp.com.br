<?php

add_action('rest_api_init', function () {
  register_rest_route('api', '/form', [
    'methods'  => 'POST',
    'callback' => 'handle_form_submission',
    'permission_callback' => '__return_true',
  ]);
});

function handle_form_submission(WP_REST_Request $request) {
  $data = $request->get_json_params();

  if (!isset($data['form_fields']) || !is_array($data['form_fields'])) {
    return new WP_REST_Response([
      'status' => 'erro',
      'mensagem' => 'Dados do formulário ausentes no payload.'
    ], 400);
  }

  $fields = $data['form_fields'];

  // Validação dos campos obrigatórios
  $required = ['nome', 'idade', 'telefone', 'email', 'cidade', 'turnstile_token'];
  foreach ($required as $campo) {
    if (empty($fields[$campo])) {
      return new WP_REST_Response([
        'status' => 'erro',
        'mensagem' => "Campo obrigatório ausente: $campo"
      ], 400);
    }
  }

  // Validação do token Turnstile
  $token = isset($fields['turnstile_token']) ? sanitize_text_field($fields['turnstile_token']) : '';
  if (!verificar_turnstile_token($token)) {
    return new WP_REST_Response([
      'status' => 'erro',
      'mensagem' => 'Token inválido. Validação de segurança falhou.'
    ], 403);
  }

  // Remove token para envio ao Google Script
  unset($fields['turnstile_token']);

  // URL real da macro Google Apps Script
  $gs_url = 'https://script.google.com/macros/s/AKfycbwNk3SiHDZZzDkKVXaT4wGtSlwHZ5UpuECZxd5QPUPSP3k8z-3LrkAyCw13q3Wx61XxjQ/exec';

  // Disparo da requisição
  $response = wp_remote_post($gs_url, [
    'headers' => ['Content-Type' => 'application/json'],
    'body' => json_encode(['form_fields' => $fields]),
    'timeout' => 15,
  ]);

  // Tratamento de erro técnico
  if (is_wp_error($response)) {
    return new WP_REST_Response([
      'status' => 'erro',
      'mensagem' => 'Erro técnico ao enviar para planilha.'
    ], 500);
  }

  // Log de retorno do Google Script
  $gs_response_body = wp_remote_retrieve_body($response);

  return new WP_REST_Response([
    'status' => 'sucesso',
    'mensagem' => '✅ Dados enviados com sucesso!',
    'retorno_google_script' => $gs_response_body
  ], 200);
}

function verificar_turnstile_token($token) {
  $secret = '0x4AAAAAABlRmRjSy4rz6F_CVHzHOw4FMpI';
  $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

  $response = wp_remote_post($url, [
    'body' => [
      'secret'   => $secret,
      'response' => $token,
    ],
    'timeout' => 10,
  ]);

  if (is_wp_error($response)) return false;

  $body = json_decode(wp_remote_retrieve_body($response), true);
  return isset($body['success']) && $body['success'] === true;
}

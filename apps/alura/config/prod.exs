import Config

# Configuração de produção
config :alura, AluraWeb.Endpoint,
  url: [host: System.get_env("PHX_HOST") || "api.alura.net.br", port: 443, scheme: "https"],
  server: true

# Desativa logs de debug em produção
config :logger, level: :info

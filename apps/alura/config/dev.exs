import Config

# Configuração do banco de dados para desenvolvimento
config :alura, Alura.Repo,
  url: System.get_env("DATABASE_URL") || "postgres://postgres:postgres@localhost:5432/alura_dev",
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# Endpoint em desenvolvimento
config :alura, AluraWeb.Endpoint,
  http: [ip: {0, 0, 0, 0}, port: 4000],
  check_origin: false,
  code_reloader: false,
  debug_errors: true,
  secret_key_base: "alura_development_secret_key_base_at_least_64_bytes_long_for_security_12345"

# Logs em desenvolvimento
config :logger, :console, format: "[$level] $message\n"

# Exibe stacktrace detalhado em erros
config :phoenix, :stacktrace_depth, 20
config :phoenix, :plug_init_mode, :runtime

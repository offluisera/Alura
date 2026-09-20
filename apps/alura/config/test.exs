import Config

# Configuração para testes
config :alura, Alura.Repo,
  url: System.get_env("DATABASE_URL") || "postgres://postgres:postgres@localhost:5432/alura_test",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 10

config :alura, AluraWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "alura_test_secret_key_base_at_least_64_bytes_long_for_security_1234567890",
  server: false

config :logger, level: :warning
config :phoenix, :plug_init_mode, :runtime

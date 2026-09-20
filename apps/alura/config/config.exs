import Config

# Configuração geral da aplicação
config :alura,
  ecto_repos: [Alura.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configuração do Endpoint HTTP / WebSocket
config :alura, AluraWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: AluraWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Alura.PubSub,
  live_view: [signing_salt: "alura_signing_salt_key_base"]

# Configuração do Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configuração do parser JSON
config :phoenix, :json_library, Jason

# Importa configurações específicas de cada ambiente
import_config "#{config_env()}.exs"

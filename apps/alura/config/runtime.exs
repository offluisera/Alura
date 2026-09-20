import Config

# Executado em todos os ambientes no momento de inicialização (runtime)
if System.get_env("PHX_SERVER") do
  config :alura, AluraWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      Exemplo: postgres://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?ssl=true
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :alura, Alura.Repo,
    ssl: true,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    socket_options: maybe_ipv6

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      Gere uma chave com `mix phx.gen.secret`
      """

  host = System.get_env("PHX_HOST") || "api.alura.net.br"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :alura, AluraWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base
end

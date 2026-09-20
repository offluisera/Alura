defmodule AluraWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :alura

  # Configuração do socket de WebSockets para Phoenix Channels
  socket "/socket", AluraWeb.UserSocket,
    websocket: [
      timeout: 45_000,
      connect_info: [:peer_data, :x_headers, :uri]
    ],
    longpoll: false

  # Suporte a CORS
  plug CORSPlug,
    origin: ["*"],
    headers: ["Authorization", "Content-Type", "Accept", "Origin", "User-Agent", "DNT", "Cache-Control", "X-Mx-ReqToken", "Keep-Alive", "X-Requested-With", "If-Modified-Since"]

  # Parser de requisições JSON
  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug AluraWeb.Router
end

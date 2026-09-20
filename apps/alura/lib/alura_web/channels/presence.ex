defmodule AluraWeb.Presence do
  @moduledoc """
  Rastreamento de presença em tempo real (online, ausente, ocupado, invisível).
  Utiliza Phoenix.Presence com backend OTP distribuído (sem depender de queries constantes no Postgres).
  """
  use Phoenix.Presence,
    otp_app: :alura,
    pubsub_server: Alura.PubSub
end

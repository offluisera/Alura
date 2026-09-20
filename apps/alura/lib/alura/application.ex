defmodule Alura.Application do
  @moduledoc """
  Supervision Tree principal da Alura.
  Inicia o Ecto Repo, Phoenix PubSub, Presence e o Endpoint HTTP/WebSocket.
  """
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # 1. Repositório Ecto (Supabase PostgreSQL)
      Alura.Repo,
      # 2. PubSub para canais em tempo real
      {Phoenix.PubSub, name: Alura.PubSub},
      # 3. Phoenix Presence para rastreamento de status de usuários
      AluraWeb.Presence,
      # 4. Endpoint HTTP / WebSocket
      AluraWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: Alura.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    AluraWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

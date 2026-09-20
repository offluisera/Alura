defmodule AluraWeb.HealthController do
  use AluraWeb, :controller

  @doc """
  Endpoint de verificação de saúde (Health Check).
  Retorna status 200 OK com timestamp e versão da aplicação.
  """
  def index(conn, _params) do
    # Verifica conexão com o banco de dados
    db_status =
      case Ecto.Adapters.SQL.query(Alura.Repo, "SELECT 1") do
        {:ok, _} -> "connected"
        {:error, _} -> "disconnected"
      end

    json(conn, %{
      status: "ok",
      app: "alura",
      version: "0.1.0",
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      database: db_status
    })
  end
end

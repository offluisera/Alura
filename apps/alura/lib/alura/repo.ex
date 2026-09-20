defmodule Alura.Repo do
  @moduledoc """
  Adaptador Ecto para comunicação com o banco de dados PostgreSQL gerenciado pelo Supabase.
  """
  use Ecto.Repo,
    otp_app: :alura,
    adapter: Ecto.Adapters.Postgres
end

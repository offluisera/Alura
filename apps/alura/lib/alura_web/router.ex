defmodule AluraWeb.Router do
  use AluraWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  # Health Check público para monitoramento, Docker e Nginx
  scope "/", AluraWeb do
    pipe_through :api

    get "/health", HealthController, :index
  end

  # API v1 para recursos do sistema
  scope "/api/v1", AluraWeb do
    pipe_through :api

    # Endpoints de domínios serão mapeados aqui nas próximas fases
  end
end

defmodule AluraWeb do
  @moduledoc """
  Ponto de entrada para definir funcionalidades web comuns na Alura:
  controladores, roteadores, canais e plugs.
  """

  def controller do
    quote do
      use Phoenix.Controller,
        namespace: AluraWeb,
        formats: [:json],
        layouts: [json: AluraWeb.Layouts]

      import Plug.Conn
      unquote(verified_routes())
    end
  end

  def router do
    quote do
      use Phoenix.Router, helpers: false

      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  def verified_routes do
    quote do
      use Phoenix.VerifiedRoutes,
        endpoint: AluraWeb.Endpoint,
        router: AluraWeb.Router,
        statics: ~w()
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end

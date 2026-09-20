defmodule AluraWeb.ErrorJSON do
  @moduledoc """
  Renderizador padrão de erros em formato JSON.
  """

  def render(template, _assigns) do
    %{errors: %{detail: Phoenix.Controller.status_message_from_template(template)}}
  end
end

defmodule AluraWeb.UserChannel do
  use AluraWeb, :channel

  @impl true
  def join("user:" <> user_id, _params, socket) do
    if socket.assigns.user_id == user_id do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  @impl true
  def handle_in("signal", payload, socket) do
    push(socket, "signal", payload)
    {:reply, :ok, socket}
  end
end

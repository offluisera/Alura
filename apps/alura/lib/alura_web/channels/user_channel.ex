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
  def handle_in("signal", %{"to_user_id" => to_user_id} = payload, socket)
      when is_binary(to_user_id) do
    signal =
      payload
      |> Map.put("from_user_id", socket.assigns.user_id)

    AluraWeb.Endpoint.broadcast!("user:#{to_user_id}", "signal", signal)
    {:reply, :ok, socket}
  end

  def handle_in("signal", _payload, socket) do
    {:reply, {:error, %{reason: "invalid_signal"}}, socket}
  end
end

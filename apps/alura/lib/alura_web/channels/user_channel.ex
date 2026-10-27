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
    to_user_id = payload["to_user_id"] || payload["toUserId"]

    if is_binary(to_user_id) && to_user_id != "" do
      signal =
        payload
        |> Map.put("from_user_id", socket.assigns.user_id)
        |> Map.put("fromUserId", socket.assigns.user_id)

      AluraWeb.Endpoint.broadcast!("user:#{to_user_id}", "signal", signal)
      {:reply, :ok, socket}
    else
      {:reply, {:error, %{reason: "invalid_signal_recipient"}}, socket}
    end
  end
end

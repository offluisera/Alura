defmodule AluraWeb.UserSocket do
  use Phoenix.Socket

  channel "call:*", AluraWeb.CallChannel
  channel "user:*", AluraWeb.UserChannel

  @impl true
  def connect(params, socket, _connect_info) do
    user_id = params["user_id"] || "anonymous"
    {:ok, assign(socket, :user_id, user_id)}
  end

  @impl true
  def id(socket), do: "users_socket:#{socket.assigns.user_id}"
end

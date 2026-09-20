defmodule AluraWeb.UserSocket do
  use Phoenix.Socket

  # Canais mapeados
  channel "call:*", AluraWeb.CallChannel
  # channel "room:*", AluraWeb.RoomChannel
  # channel "conversation:*", AluraWeb.ConversationChannel

  @impl true
  def connect(params, socket, _connect_info) do
    # Suporta autenticação por token ou atribuição de user_id
    user_id = params["user_id"] || "anonymous"
    {:ok, assign(socket, :user_id, user_id)}
  end

  @impl true
  def id(socket), do: "users_socket:#{socket.assigns.user_id}"
end

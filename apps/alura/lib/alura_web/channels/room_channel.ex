defmodule AluraWeb.RoomChannel do
  @moduledoc """
  Canal Phoenix para canais de texto dentro de servidores/comunidades da Alura.
  Gerencia:
  - Presença de usuários visualizando o canal
  - Mensagens em tempo real (message.created, message.updated, message.deleted)
  - Indicador de digitação (typing)
  - Reações a mensagens (reaction.added, reaction.removed)
  """
  use AluraWeb, :channel
  alias AluraWeb.Presence

  @impl true
  def join("room:" <> room_id, _params, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :room_id, room_id)}
  end

  @impl true
  def handle_info(:after_join, socket) do
    {:ok, _} =
      Presence.track(socket, socket.assigns.user_id, %{
        online_at: inspect(System.system_time(:second)),
        user_id: socket.assigns.user_id
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # Transmite nova mensagem enviada no canal
  @impl true
  def handle_in("new_message", payload, socket) do
    message_data =
      payload
      |> Map.put("user_id", socket.assigns.user_id)
      |> Map.put("room_id", socket.assigns.room_id)
      |> Map.put_new("created_at", DateTime.utc_now() |> DateTime.to_iso8601())

    broadcast!(socket, "message_created", message_data)
    {:reply, :ok, socket}
  end

  # Transmite atualização / edição de mensagem
  @impl true
  def handle_in("edit_message", %{"id" => message_id} = payload, socket) do
    broadcast!(socket, "message_updated", %{
      id: message_id,
      content: payload["content"],
      room_id: socket.assigns.room_id,
      updated_at: DateTime.utc_now() |> DateTime.to_iso8601()
    })

    {:reply, :ok, socket}
  end

  # Transmite exclusão de mensagem
  @impl true
  def handle_in("delete_message", %{"id" => message_id}, socket) do
    broadcast!(socket, "message_deleted", %{
      id: message_id,
      room_id: socket.assigns.room_id
    })

    {:reply, :ok, socket}
  end

  # Indicador de digitação (usuário digitando...)
  @impl true
  def handle_in("typing", %{"is_typing" => is_typing} = payload, socket) do
    broadcast_from!(socket, "user_typing", %{
      user_id: socket.assigns.user_id,
      username: payload["username"] || "Alguém",
      is_typing: is_typing,
      room_id: socket.assigns.room_id
    })

    {:reply, :ok, socket}
  end

  # Reação com emoji adicionada ou removida
  @impl true
  def handle_in("reaction", payload, socket) do
    broadcast!(socket, "reaction_updated", %{
      message_id: payload["message_id"],
      emoji: payload["emoji"],
      user_id: socket.assigns.user_id,
      action: payload["action"] || "add"
    })

    {:reply, :ok, socket}
  end
end

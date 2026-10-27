defmodule AluraWeb.CommunityChannel do
  @moduledoc """
  Canal Phoenix para o escopo do Servidor / Comunidade.
  Gerencia:
  - Presença global de membros dentro da comunidade (online, away, busy, offline)
  - Notificações de servidor (criação de canais, alteração de cargos, entrada/saída de membros)
  """
  use AluraWeb, :channel
  alias AluraWeb.Presence

  @impl true
  def join("community:" <> community_id, params, socket) do
    send(self(), {:after_join, params})
    {:ok, assign(socket, :community_id, community_id)}
  end

  @impl true
  def handle_info({:after_join, params}, socket) do
    user_id = socket.assigns.user_id

    {:ok, _} =
      Presence.track(socket, user_id, %{
        user_id: user_id,
        community_id: socket.assigns.community_id,
        username: params["username"] || "Membro",
        display_name: params["display_name"] || params["username"],
        avatar_url: params["avatar_url"],
        status: params["status"] || "online",
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # Atualização de status de presença na comunidade
  @impl true
  def handle_in("status_update", %{"status" => status} = payload, socket) do
    user_id = socket.assigns.user_id

    Presence.update(socket, user_id, fn meta ->
      meta
      |> Map.put(:status, status)
      |> Map.put(:custom_status, payload["custom_status"])
    end)

    {:reply, :ok, socket}
  end

  # Broadcast de atualização administrativa (cargos, canais)
  @impl true
  def handle_in("community_event", payload, socket) do
    broadcast_from!(socket, "community_event", payload)
    {:reply, :ok, socket}
  end
end

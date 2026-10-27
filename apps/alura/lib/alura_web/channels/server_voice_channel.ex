defmodule AluraWeb.ServerVoiceChannel do
  @moduledoc """
  Canal Phoenix para orquestração de salas de voz de servidores e comunidades em tempo real.
  Gerencia:
  - Presença de membros conectados nas salas de voz do servidor via Phoenix.Presence
  - Sinalização WebRTC Mesh (offer, answer, ice_candidate, screen_share_stop)
  - Detecção de atividade de voz (voice_speaking)
  - Efeitos sonoros sincronizados (soundboard)
  """
  use AluraWeb, :channel
  alias AluraWeb.Presence

  @impl true
  def join("server_voice:" <> server_id, params, socket) do
    send(self(), {:after_join, params})
    {:ok, assign(socket, :server_id, server_id)}
  end

  @impl true
  def handle_info({:after_join, params}, socket) do
    room_id = params["room_id"]
    user_id = socket.assigns.user_id

    # Rastreia presença inicial
    {:ok, _} =
      Presence.track(socket, user_id, %{
        user_id: user_id,
        room_id: room_id,
        username: params["username"] || "Membro",
        display_name: params["display_name"] || params["username"] || "Você",
        avatar_url: params["avatar_url"],
        is_muted: params["is_muted"] || false,
        is_deafened: params["is_deafened"] || false,
        has_camera: params["has_camera"] || false,
        is_sharing_screen: params["is_sharing_screen"] || false,
        online_at: inspect(System.system_time(:second))
      })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

  # Atualização dinâmica de presença (mute, deafen, câmera, troca de sala de voz)
  @impl true
  def handle_in("voice_presence", payload, socket) do
    user_id = socket.assigns.user_id

    Presence.update(socket, user_id, fn meta ->
      meta
      |> Map.put(:room_id, payload["room_id"])
      |> Map.put(:is_muted, payload["is_muted"] || false)
      |> Map.put(:is_deafened, payload["is_deafened"] || false)
      |> Map.put(:has_camera, payload["has_camera"] || false)
      |> Map.put(:is_sharing_screen, payload["is_sharing_screen"] || false)
      |> Map.put(:username, payload["username"] || meta[:username])
      |> Map.put(:display_name, payload["display_name"] || meta[:display_name])
      |> Map.put(:avatar_url, payload["avatar_url"] || meta[:avatar_url])
    end)

    {:reply, :ok, socket}
  end

  # Transmite indicador de fala em tempo real
  @impl true
  def handle_in("voice_speaking", %{"is_speaking" => is_speaking} = payload, socket) do
    broadcast_from!(socket, "voice_speaking", %{
      user_id: socket.assigns.user_id,
      is_speaking: is_speaking,
      room_id: payload["room_id"]
    })

    {:reply, :ok, socket}
  end

  # Roteamento de sinalização WebRTC Mesh (offer / answer / candidate / screen_share_stop)
  @impl true
  def handle_in("voice_signal", %{"type" => type} = payload, socket) do
    target_id = payload["target_id"] || payload["targetId"]

    signal_payload = %{
      sender_id: socket.assigns.user_id,
      senderId: socket.assigns.user_id,
      target_id: target_id,
      targetId: target_id,
      type: type,
      sdp: payload["sdp"],
      candidate: payload["candidate"],
      room_id: payload["room_id"]
    }

    broadcast_from!(socket, "voice_signal", signal_payload)
    {:reply, :ok, socket}
  end

  # Efeitos sonoros disparados na sala de voz
  @impl true
  def handle_in("soundboard", payload, socket) do
    broadcast!(socket, "soundboard", %{
      sender_id: socket.assigns.user_id,
      sound_id: payload["sound_id"] || payload["soundId"],
      mp3_url: payload["mp3_url"] || payload["mp3Url"],
      label: payload["label"],
      emoji: payload["emoji"],
      sender_name: payload["sender_name"] || payload["senderName"]
    })

    {:reply, :ok, socket}
  end
end

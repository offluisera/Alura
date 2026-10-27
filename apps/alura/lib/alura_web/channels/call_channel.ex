defmodule AluraWeb.CallChannel do
  @moduledoc """
  Canal Phoenix para sinalização WebRTC de chamadas (áudio, vídeo e tela).
  Eventos suportados:
  - offer
  - answer
  - ice_candidate
  - screen_share_start
  - screen_share_stop
  - stream_viewer_join
  - stream_viewer_leave
  - call_end
  """
  use AluraWeb, :channel
  alias AluraWeb.Presence

  @impl true
  def join("call:" <> call_id, _params, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :call_id, call_id)}
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

  # Encaminha sinais WebRTC aos demais participantes da chamada
  @impl true
  def handle_in("signal", %{"type" => type} = payload, socket) do
    to_user_id = payload["to_user_id"] || payload["toUserId"]

    signal_data = %{
      type: type,
      from_user_id: socket.assigns.user_id,
      to_user_id: to_user_id,
      call_id: socket.assigns.call_id,
      payload: Map.get(payload, "payload", %{})
    }

    broadcast_from!(socket, "signal", signal_data)
    {:reply, :ok, socket}
  end
end

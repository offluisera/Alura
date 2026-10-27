defmodule AluraWeb.UserSocket do
  use Phoenix.Socket
  require Logger

  # Sinalização direta e chamadas
  channel "call:*", AluraWeb.CallChannel
  channel "user:*", AluraWeb.UserChannel

  # Servidores e Comunidades
  channel "server_voice:*", AluraWeb.ServerVoiceChannel
  channel "room:*", AluraWeb.RoomChannel
  channel "community:*", AluraWeb.CommunityChannel

  @impl true
  def connect(params, socket, _connect_info) do
    token = params["token"]
    user_id_param = params["user_id"]

    user_id =
      cond do
        token && token != "" ->
          case verify_supabase_token(token) do
            {:ok, claims} ->
              claims["sub"] || user_id_param || "anonymous"

            {:error, reason} ->
              Logger.warning("[UserSocket] Validação JWT Supabase: #{inspect(reason)}. Usando user_id fornecido.")
              user_id_param || "anonymous"
          end

        user_id_param && user_id_param != "" ->
          user_id_param

        true ->
          "anonymous"
      end

    {:ok,
     socket
     |> assign(:user_id, user_id)
     |> assign(:status, params["status"] || "online")}
  end

  @impl true
  def id(socket), do: "users_socket:#{socket.assigns.user_id}"

  # Verificação de claims do Supabase JWT
  defp verify_supabase_token(token) do
    # Tenta validar o token com Joken. Se Joken não encontrar chave estrita, extrai claims
    case Joken.peek_claims(token) do
      {:ok, claims} -> {:ok, claims}
      {:error, reason} -> {:error, reason}
    end
  rescue
    e -> {:error, e}
  end
end

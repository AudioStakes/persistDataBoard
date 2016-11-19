defmodule FlaskOnPhoenix.RoomChannel do
  use Phoenix.Channel

  def join("rooms:lobby", auth_msg, socket) do
    {:ok, socket}
  end
  def join("rooms:" <> _private_room_id, _auth_msg, socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("sticky:create", %{"left" => x, "top" => y, "backgroundColor" => f}, socket) do
    broadcast! socket, "sticky:create", %{left: x, top: y, backgroundColor: f}
    {:noreply, socket}
  end

  def handle_in("frame:create", %{"left" => x, "top" => y}, socket) do
    broadcast! socket, "frame:create", %{left: x, top: y}
    {:noreply, socket}
  end

  def handle_in("sticky:modified", %{
      "id" => a, "left" => b, "top" => c, "width" => d, "height" => e,
      "scaleX" => f, "scaleY" => g, "angle" => h, "group_left" => i, "group_top" => j,
      "group_width" => k, "group_height" => l, "group_scaleX" => m, "group_scaleY" => n, "group_angle" => o,
      "text" => p
    }, socket) do

    broadcast! socket, "sticky:modified", %{
      id: a, left: b, top: c, width: d, height: e,
      scaleX: f, scaleY: g, angle: h, group_left: i, group_top: j,
      group_width: k, group_height: l, group_scaleX: m, group_scaleY: n, group_angle: o,
      text: p
    }
    {:noreply, socket}
  end
end
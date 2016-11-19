defmodule FlaskOnPhoenix.PageController do
  use FlaskOnPhoenix.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end

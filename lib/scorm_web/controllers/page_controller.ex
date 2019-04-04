defmodule ScormWeb.PageController do
  use ScormWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end

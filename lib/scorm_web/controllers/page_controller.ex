defmodule ScormWeb.PageController do
  use ScormWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def fly(conn, _params) do
    render(conn, "fly.html")
  end

  def letters(conn, _params) do
    render(conn, "letters.html")
  end
end

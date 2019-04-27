defmodule ScormWeb.Router do
  use ScormWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", ScormWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/fly", PageController, :fly
    get "/letters", PageController, :letters
    get "/quiz", QuizController, :index
    post "/quiz", QuizController, :new
  end

  # Other scopes may use custom stacks.
  # scope "/api", ScormWeb do
  #   pipe_through :api
  # end
end

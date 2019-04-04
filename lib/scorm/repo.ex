defmodule Scorm.Repo do
  use Ecto.Repo,
    otp_app: :scorm,
    adapter: Ecto.Adapters.Postgres
end

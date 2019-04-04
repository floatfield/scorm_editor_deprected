defmodule ScormWeb.QuizController do
    require Logger
    @root_dir File.cwd!
    @quiz_dir "#{File.cwd!}/scorm_packages/quiz"
    @file_asset_dir "#{File.cwd!}/priv/static/files"

    use ScormWeb, :controller

    def index(conn, _params) do
        render(conn, "index.html")
    end

    def new(conn, %{"words" => words}) do
        %{
            "description" => description,
            "right_number" => right_n,
            "wrong_number" => wrong_n,
            "min_successful_series" => min_success
        } = words
        right_words = get_file_content(words, "right")
        wrong_words = get_file_content(words, "wrong")
        {right_number, _} = Integer.parse(right_n)
        {wrong_number, _} = Integer.parse(wrong_n)
        {min_successful_series, _} = Integer.parse(min_success)
        json = %{
            "description" => description,
            "minSuccessSeries" => min_successful_series,
            "rightNumber" => right_number,
            "wrongNumber" => wrong_number,
            "right" => to_words(right_words),
            "wrong" => to_words(wrong_words)
        }
        encoded_string = "export default #{Poison.encode!(json)}"
        create_quiz_scrom(encoded_string)
        render(conn, "new.html")
    end

    defp get_file_content(words, field) do
        %{^field => %Plug.Upload{path: path}} = words
        {:ok, file} = File.open(path, [:utf8])
        IO.read(file, :all)
    end

    defp to_words(str) do
        str
        |> String.split(",")
        |> Enum.map(&String.trim/1)
    end

    defp create_quiz_scrom(string_to_write) do
        {:ok, file} = File.open("#{@quiz_dir}/src/config.js", [:utf8, :write])
        IO.write(file, string_to_write)
        File.cd! @quiz_dir, fn () -> 
            System.cmd("npm", ["run", "build"])
            :ok = File.cp "#{@quiz_dir}/dist/quiz.zip", "#{@file_asset_dir}/quiz.zip"
            :ok = File.rm "#{@quiz_dir}/dist/quiz.zip"
        end
    end
end
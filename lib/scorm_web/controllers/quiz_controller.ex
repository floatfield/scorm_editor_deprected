defmodule ScormWeb.QuizController do
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
            "min_successful_series" => min_success,
            "file_name" => file_name
        } = words
        answers = get_file_content(words, "answers")
        {right, wrong} = parse_answers(answers)
        marks = pick_marks(words)
        {right_number, _} = Integer.parse(right_n)
        {wrong_number, _} = Integer.parse(wrong_n)
        {min_successful_series, _} = Integer.parse(min_success)
        json = %{
            "description" => description,
            "minSuccessSeries" => min_successful_series,
            "rightNumber" => right_number,
            "wrongNumber" => wrong_number,
            "right" => right,
            "wrong" => wrong,
            "marks" => marks
        }
        encoded_string = "export default #{Poison.encode!(json)}"
        create_quiz_scrom(encoded_string, file_name)
        render(conn, "new.html", file_name: file_name)
    end

    defp get_file_content(words, field) do
        %{^field => %Plug.Upload{path: path}} = words
        {:ok, file} = File.open(path, [:utf8])
        IO.read(file, :all)
    end

    defp parse_answers(answers_str) do
        [right, wrong] = String.split(answers_str, "-----")
        {to_words(right), to_words(wrong)}
    end

    defp to_words(str) do
        str
        |> String.split("\n")
        |> Enum.map(&String.trim/1)
        |> Enum.uniq
        |> Enum.filter(fn s -> String.length(s) > 0 end)
    end

    defp create_quiz_scrom(string_to_write, file_name) do
        {:ok, file} = File.open("#{@quiz_dir}/src/config.js", [:utf8, :write])
        IO.write(file, string_to_write)
        File.cd! @quiz_dir, fn () ->
            System.cmd("npm", ["run", "build"])
            :ok = File.cp "#{@quiz_dir}/dist/quiz.zip", "#{@file_asset_dir}/#{file_name}.zip"
            :ok = File.rm "#{@quiz_dir}/dist/quiz.zip"
        end
    end

    defp pick_marks(words) do
        words
        |> Enum.filter(&is_mark/1)
        |> Enum.map(&to_mark/1)
    end

    defp is_mark({ key, val }) do
        String.starts_with?(key, "mark") and String.length(val) > 0
    end

    defp to_mark({ key, val }) do
        tries_number = key
        |> String.split("_")
        |> Enum.at(1)
        |> Integer.parse(10)
        |> elem(0)
        %{
            "triesNumber" => tries_number,
            "mark" => val
        }
    end
end
open Config;
open Shuffle;

let testPassed = (currentTry, minSuccessSeries) =>
    List.length(currentTry) == minSuccessSeries && List.for_all(s => s, currentTry);

let checkWords = (state: state, words: list(string)) => {
    let { tries: prevTries, currentTry: prevTry, answers: prevAnswers, config } = state;
    let rightAnswers = Array.to_list(config.right);
    let rightNumber = min(config.rightNumber, List.length(rightAnswers));

    let wordsAreRight = List.length(words) == rightNumber && List.for_all(a => List.mem(a, rightAnswers), words);
    let answers = prevAnswers @ words;
    let tries = wordsAreRight ? prevTries : prevTries @ [prevTry @ [false]];
    let currentTry = wordsAreRight ?  prevTry @ [wordsAreRight] : [];
    if (testPassed(currentTry, config.minSuccessSeries)) {
        {
            ...state,
            quizState: Passed,
            answers,
            currentTry
        }
    } else {
        {
            ...state,
            tries,
            answers,
            currentTry
        }
    }
};

let reducer = (state: state, action: action) =>
    switch (action) {
    | CheckWords(words) => checkWords(state, words)
    };

[@react.component]
let make = (~quizConfig: quizConfig, ~scormApi: scormApi) => {
    let (state, dispatch) = React.useReducer(reducer, {
        config: quizConfig,
        tries: [],
        currentTry: [],
        answers: [],
        quizState: InProgress
    });
    let right = pickNRandom(quizConfig.rightNumber, Array.to_list(quizConfig.right));
    let wrong = pickNRandom(quizConfig.wrongNumber, Array.to_list(quizConfig.wrong));
    let words = right @ wrong
    |> shuffle;
    let app = switch(state.quizState) {
    | Passed => <Result state scormApi />
    | InProgress => <Quiz state dispatch words />
    };
    <div className="ui teal segment">
        app
    </div>
};
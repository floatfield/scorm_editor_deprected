open Config;
open Shuffle;

let testPassed = (currentTry, minSuccessSeries) =>
    List.length(currentTry) == minSuccessSeries && List.for_all(s => s, currentTry);

let checkWords = (state: state, words: list(string), rightNumber: int) => {
    let { tries: prevTries, currentTry: prevTry, answers: prevAnswers, config } = state;
    let rightAnswers = Array.to_list(config.right);

    let wordsAreRight = List.length(words) == rightNumber && List.for_all(a => List.mem(a, rightAnswers), words);
    let answers = prevAnswers @ words;
    let currentTry = prevTry @ [wordsAreRight];
    let tries = initial(prevTries) @ [currentTry];
    if (testPassed(currentTry, config.minSuccessSeries)) {
        {
            ...state,
            quizState: Passed,
            tries,
            answers,
            currentTry
        }
    } else {
        {
            ...state,
            tries,
            answers,
            currentTry,
            rightNumber: None
        }
    }
};

let checkNewTry = (state: state) => {
    if (!last(state.currentTry)) {
        {
            ...state,
            currentTry: [],
            tries: state.tries @ [[]]
        }
    } else {
        state
    }
};

let setRightNumber = (state: state, rightNumber: int) => {
    {...state, rightNumber: Some(rightNumber)};
};

let reducer = (state: state, action: action) =>
    switch (action, state.rightNumber) {
    | (CheckWords(words), Some(rightNumber)) => checkWords(state, words, rightNumber) |> checkNewTry
    | (SetRightNumber(rightNumber), _) => setRightNumber(state, rightNumber)
    | (_, None) => state
    };

[@react.component]
let make = (~quizConfig: quizConfig, ~scormApi: scormApi) => {
    let (state, dispatch) = React.useReducer(reducer, {
        config: quizConfig,
        tries: [[]],
        currentTry: [],
        answers: [],
        quizState: InProgress,
        rightNumber: None
    });
    let app = switch (state.rightNumber, state.quizState) {
    | (None, InProgress) => {
        Random.self_init();
        let rightNumber = Random.int(quizConfig.maxRightNumber - quizConfig.minRightNumber + 1) + quizConfig.minRightNumber;
        dispatch(SetRightNumber(rightNumber));
        ReasonReact.null;
    }
    | (Some(rightNumber), InProgress) => {
        let wrongNumber = quizConfig.questionNumber - rightNumber;
        let right = pickNRandom(rightNumber, Array.to_list(quizConfig.right));
        let wrong = pickNRandom(wrongNumber, Array.to_list(quizConfig.wrong));
        let words = right @ wrong
        |> shuffle;
        <Quiz state dispatch words />;
    }
    | (_, Passed) => <Result state scormApi />;
    };
    <div className="ui teal segment">
        app
    </div>
};
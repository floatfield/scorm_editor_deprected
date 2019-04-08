import React, { useState, useReducer } from "react";
import { Form, Button, Segment, Checkbox, Label, Message } from "semantic-ui-react";
import { curry, pipe, take, isEmpty, nth, remove, without } from "ramda";
import config from "./config";

const { minSuccessSeries, right, wrong, rightNumber, wrongNumber, description } = config;

const rn = Math.min(rightNumber, right.length);
const wn = Math.min(wrongNumber, wrong.length);

const initialState = {
    successfulTries: 0,
    tries: 0,
    answers: [],
    passed: false
};

const actions = {
    CHECK_WORDS: (state, action) => {
        const { payload: words } = action;
        let { successfulTries, tries, passed, answers: prevAnswers } = state;
        const wordsAreRight = words.length === rn && words.every(w =>right.includes(w));
        const answers = prevAnswers.concat(words);
        successfulTries = wordsAreRight
            ? successfulTries + 1
            : 0;
        tries += 1;
        
        if (successfulTries === minSuccessSeries) {
            passed = true;
            if (state.api) {
                const result = `Количество попыток: ${tries}; ${answers.join("--")}`;
                state.api.LMSSetValue("cmi.core.score.raw", "100");
                state.api.LMSSetValue("cmi.core.score.max", "100");
                state.api.LMSSetValue("cmi.core.score.min", "0");
                state.api.LMSSetValue("cmi.comments", result);
                state.api.LMSCommit("");
                state.api.LMSFinish("");
            }
        }
        return { ...state, successfulTries, passed, tries, answers };
    }
};

const reducer = (state, action) => {
    const act = actions[action.type];
    return act !== undefined
        ? act(state, action)
        : state;
};

export const App = ({ scormAPI }) => {
    const store = useReducer(
        reducer,
        {
            ...initialState,
            api: scormAPI
        }
    );
    const [state] = store;
    const words = pickRandomItems(right, wrong, rn, wn);
    const mainApp = state.passed
        ? <Label color= "green" content="Выполнено!" icon="check" />
        : <Quiz store={store} words={words} />;
    return <Segment color="teal">{mainApp}</Segment>;
};

const Quiz = ({ store, words }) => {
    const [_, dispatch] = store;
    const [checkedWords, setCheckedWords] = useState([]);
    const toggleWord = word => {
        const newWords = checkedWords.includes(word)
            ? without([word], checkedWords)
            : [...checkedWords, word];
        setCheckedWords(newWords);
    };
    const fields = words.map(
        (word, i) => (
            <Form.Field
                control={Checkbox}
                label={word}
                key={i}
                checked={checkedWords.includes(word)}
                onClick={() => toggleWord(word)}
            />
        )
    );
    return (
        <div>
            <Message
                content={description}
            />
            <Form>
                {fields}
                <Form.Field
                    control={Button}
                    content="Готово"
                    onClick={() => {
                        dispatch({
                            type: "CHECK_WORDS",
                            payload: checkedWords
                        });
                        setCheckedWords([]);
                    }}
                />
            </Form>
        </div>
    );
};

const pickRandomItems = (right, wrong, rightNumber, wrongNumber) => {
    const xs = takeNRandom(rightNumber)(right);
    const ys = takeNRandom(wrongNumber)(wrong);
    return shuffle([], [...xs, ...ys]);
};

const takeNRandom = n => pipe(
    shuffle([]),
    take(n)
);

const shuffle = curry(
    (res, xs) => {
        const randIndex = random(0, xs.length);
        return isEmpty(xs)
            ? res
            : shuffle([nth(randIndex, xs), ...res], remove(randIndex, 1, xs));
    }
);

const random = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

import React, { useState, useReducer } from "react";
import { Form, Button, Segment, Checkbox, Label, Message, Icon, Grid } from "semantic-ui-react";
import { curry, pipe, take, isEmpty, nth, remove, without } from "ramda";
import config from "./config";

const { minSuccessSeries, right, wrong, rightNumber, wrongNumber, description } = config;

const rn = Math.min(rightNumber, right.length);
const wn = Math.min(wrongNumber, wrong.length);

const initialState = {
    tries: [],
    currentTry: [],
    answers: [],
    passed: false
};

const actions = {
    CHECK_WORDS: (state, action) => {
        const { payload: words } = action;
        let { tries, currentTry, passed, answers: prevAnswers } = state;
        const wordsAreRight = words.length === rn && words.every(w =>right.includes(w));
        const answers = prevAnswers.concat(words);
        currentTry = wordsAreRight
            ? [...currentTry, true]
            : [...currentTry, false];
        
        if (testPassed(currentTry,minSuccessSeries)) {
            passed = true;
            if (state.api) {
                const triesNumber = tries.length + 1;
                const result = `Количество попыток: ${triesNumber}; ${answers.join("--")}`;
                state.api.LMSSetValue("cmi.core.score.raw", "100");
                state.api.LMSSetValue("cmi.core.score.max", "100");
                state.api.LMSSetValue("cmi.core.score.min", "0");
                state.api.LMSSetValue("cmi.comments", result);
                state.api.LMSCommit("");
                state.api.LMSFinish("");
            }
        } else if(!wordsAreRight) {
            tries.push(currentTry);
            currentTry = [];
        }
        return { ...state, passed, tries, answers, currentTry };
    }
};

const testPassed = (currentTry, minSuccessSeries) =>
    currentTry.length === minSuccessSeries && currentTry.every(success => success);

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
        ? <Result state={state} />
        : <Quiz store={store} words={words} />;
    return <Segment color="teal">{mainApp}</Segment>;
};

const Quiz = ({ store, words }) => {
    const [state, dispatch] = store;
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
    const triesLog = createTryLog(state);
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
            <div>{triesLog}</div>
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

const createTryLog = ({ tries, currentTry }) => {
    const rows = [...tries, currentTry].map((t, i) => {
        const buttons = t.map((success, i) => {
            const key = `try_${i}`;
            const name = success ? "check" : "close";
            const color = success ? "green" : "red";
            return (
                <Button icon key={key} color={color}>
                    <Icon name={name}></Icon>
                </Button>
            );
        });
        return (
            <Grid.Row>
                <Grid.Column width={3}>Попытка {i + 1}</Grid.Column>
                <Grid.Column>
                    <Button.Group>
                        {buttons}
                    </Button.Group>
                </Grid.Column>
            </Grid.Row>
        );
    });
    return (
        <Grid columns={2} padded>
            {rows}
        </Grid>
    );
};

const Result = ({ state }) => {
    return (
        <div>
            <Label color="green" content="Выполнено!" icon="check" />
            {createTryLog(state)}
        </div>
    );
};
import React from "react";

const hide = state => {
    const { sentences, speed } = state;
    const hiddenSentencesNumber = state.hiddenSentencesNumber + 1;
    const currentSentence = sentences[hiddenSentencesNumber];
    const timeTillNextHide = calculateWaitTime(currentSentence, speed);
    const lettersToHide = countLettersToHide(state, currentSentence);
    return {
        ...state,
        hiddenSentencesNumber,
        timeTillNextHide,
        lettersToHide
    };
};

const countLettersToHide = (state, currentSentence) => {
    const lettersToHide = state.lettersToHide + currentSentence.length + 2;
    return lettersToHide < state.text.length
        ? lettersToHide
        : state.text.length;
}

const actions = {
    "HIDE_NEXT": hide
};

const reducer = (state, action) => {
    const f = actions[action.type];
    return f
        ? f(state, action.payload)
        : state;
};

const mkInitialState = (text, speed) => {
    const sentences = text.split(".").map(s => s.trim());
    const timeTillNextHide = calculateWaitTime(sentences[0], speed);
    const lettersToHide = sentences[0].length + 2;
    return {
        text,
        speed,
        sentences,
        timeTillNextHide,
        lettersToHide,
        hiddenSentencesNumber: 0,
    }
};

const calculateWaitTime = (sentence, speed) => {
    const words = sentence.split(" ").length;
    return Math.ceil(60 * words / speed) * 1000;
};

export const App = ({ text }) => {
    const ref = React.useRef(null);
    const store = React.useReducer(reducer, mkInitialState(text, 200));
    React.useEffect(hideNext(ref, store));
    return (
        <div
            ref={ref}
            tabIndex="0"
            className="ui teal segment"
            onMouseDown={onMouseDown}
        >
            {text}
        </div>
    );
};

const hideNext = (ref, store) => () => {
    const [state, dispatch] = store;
    const { timeTillNextHide, lettersToHide } = state;
    setTimeout(() => {
        hideLetters(ref, lettersToHide);
        dispatch({
            type: "HIDE_NEXT",
            payload: {}
        })
    }, timeTillNextHide);
};

const hideLetters = (ref, n) => {
    const range = document.createRange();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        selection.removeAllRanges();
    }
    const textNode = [...ref.current.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    range.setStart(textNode, 0);
    range.setEnd(textNode, n);
    selection.addRange(range);
};

const onMouseDown = e => {
    e.preventDefault();
};
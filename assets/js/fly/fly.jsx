import React, { useReducer, useEffect, useRef, Fragment } from "react";
import { Divider, Form, Button, Message } from "semantic-ui-react";
import { useAnimation } from "react-rebound";
import { update, indexOf } from "ramda";
import * as classNames from "classnames";

const directionMap = {
    "up": [-1, 0],
    "down": [1, 0],
    "left": [0, -1],
    "right": [0, 1]
};

const counterDirections = {
	up: "down",
	down: "up",
	left: "right",
	right: "left"
};

const initialState = {
	state: "initialize",
    participants: ["", ""],
    currentPlayer: null,
	previousDirection: null,
	position: [1, 1],
	valid: true,
	forbbidenDirection: null,
    arrowAnimation: false,
    message: null,
    trainingGame: true
};

const editParticipant = (state, { name, index }) => {
    const participants = update(index, name, state.participants);
    return {
        ...state,
        participants
    };
};

const addParticipant = state => ({
    ...state,
    participants: state.participants.concat("")
});

const startGame = state => {
    const valid = state.participants.every(p => p !== "");
    const appState = valid ? "play" : "initialize";
    const message = valid ? null : "Введите имена участников";
    return {
        ...state,
        message,
        currentPlayer: state.participants[0],
        state: appState
    }
};

const moveFly = (state, direction) => {
    const arrowAnimation = true;
    if (direction === counterDirections[state.previousDirection]) {
		return {
			...state,
            arrowAnimation,
			forbbidenDirection: direction
		};
	}
    const delta = directionMap[direction];
    const position = [
        state.position[0] + delta[0],
        state.position[1] + delta[1]
    ];
    const valid = position.every(coord => coord >= 0 && coord <= 2);
    const nextPlayer = getNextPlayer(state);
    return {
        ...state,
		position,
		valid,
        arrowAnimation,
        currentPlayer: nextPlayer,
		previousDirection: direction,
		forbbidenDirection: null
	};
};

const getNextPlayer = ({ currentPlayer, participants }) => {
    const current = indexOf(currentPlayer, participants);
    return participants[(current + 1) % participants.length];
};

const stopAnimation = state => ({
    ...state,
    arrowAnimation: false
});

const finishTraining = state => ({
    ...state,
    trainingGame: false
});

const actions = {
	EDIT_PARTICIPANT: editParticipant,
	ADD_PARTICIPANT: addParticipant,
	START_GAME: startGame,
	MOVE_FLY: moveFly,
	STOP_ANIMATION: stopAnimation,
	FINISH_TRAINING: finishTraining
};

const reducer = (state, action) => {
    const f = actions[action.type];
    return f ? f(state, action.payload) : state;
};

const Fly = ({ store }) => {
    const [state, dispatch] = store;
    const ref = useRef(null);
    useEffect(() => ref.current.focus());
    const headerClass = classNames("ui header", {
        red: !state.valid
    });
    const finishTraining = () => dispatch({
        type: "FINISH_TRAINING",
        payload: {}
    });
    const goButton = state.trainingGame
        ? <Button onClick={finishTraining}>Начать игру!</Button>
        : null;
    const bugWithGrids = state.trainingGame || !state.valid
        ? (
            <Fragment>
                <Divider />
                <Divider />
                <Divider vertical />
                <Divider vertical />
                <Bug state={state} />
            </Fragment>
        )
        : null;
    return (
		<div>
			<h2 className={headerClass}>{state.currentPlayer}</h2>
			<div
				className="fly ui teal segment"
				tabIndex="0"
				onKeyDown={mkKeyDown(state, dispatch)}
				ref={ref}
			>
				{bugWithGrids}
				<Direction store={[state, dispatch]} />
			</div>
            {goButton}
		</div>
	);
};

const mkKeyDown = (state, dispatch) => e => {
    e.preventDefault();
    const directions = {
		ArrowUp: "up",
		ArrowDown: "down",
		ArrowLeft: "left",
		ArrowRight: "right"
	};
    const direction = directions[e.key];
    if (direction && state.valid) {
        dispatch({
            type: "MOVE_FLY",
            payload: direction
        });
    }
};

const Bug = ({ state }) => {
    const { position, valid } = state;
	const left = 100 + 200 * position[1];
    const top = 100 + 200 * position[0];
    const className = classNames("ui huge bug icon", {
        red: !valid
    });
    const style = { left, top };
    if (!valid) {
        return <i ref={ref} className={className} style={style} />;
    }
    const ref = React.useRef();
    useAnimation(ref, style);
    return <i ref={ref} className={className} />;
};

const Direction = ({ store }) => {
    const [state, dispatch] = store;
    const className = classNames("direction ui huge icon", {
		[`arrow ${state.previousDirection}`]:
			state.forbbidenDirection == null,
		animated: state.arrowAnimation,
		"red times circle": state.forbbidenDirection !== null
	});
    const stopAnimation = () => {
        dispatch({ type: "STOP_ANIMATION", payload: {} });
    };
    return <i className={className} onAnimationEnd={stopAnimation} />;
};

const Participants = ({ store }) => {
    const [state, dispatch] = store;
    const message = state.message
        ? <Message error content={state.message} />
        : null;
    const names = state.participants.map((name, i) => {
        const onChange = e => {
            dispatch({
                type: "EDIT_PARTICIPANT",
                payload: {
                    name: e.target.value,
                    index: i
                }
            });
        };
        return (
            <Form.Field key={i}>
                <input placeholder="Имя Фамилия" value={name} onChange={onChange}/>
            </Form.Field>
        );
    });
    const addParticipant = () => dispatch({
        type: "ADD_PARTICIPANT",
        payload: {}
    });
    const startGame = () => dispatch({
        type: "START_GAME"
    });
    return (
		<Form error={state.message !== null}>
            <div className="ui header">Участники</div>
            {message}
			{names}
			<Form.Field>
				<Button
                size="tiny"
                icon="plus"
                basic
                onClick={addParticipant}
            />
			</Form.Field>
			<Form.Field>
                <Button onClick={startGame}>Начать</Button>
			</Form.Field>
		</Form>
	);
};

const phases = {
	initialize: Participants,
    play: Fly
};

export const FlyApp = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const Component = phases[state.state];
    if (!Component) {
        return null;
    }
    return <Component store={[state, dispatch]} />;
};
import React, { useReducer, useEffect } from "react";
import { Segment, Button } from "semantic-ui-react";
import { curry, pipe, nth, take, isEmpty, remove, range, identity, findIndex, zipWith } from "ramda";
import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext, DragSource, DropTarget } from 'react-dnd'

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

const easyTypes = range(0, 8).map(_ => "rect");

const hardTypes = [
    "rect",
    "rect-cross",
    "circle",
    "circle-eq",
    "cross",
    "diamond",
    "triangle"
];

const reducers = {
    "SET_DIFFICULTY": (state, difficulty) => {
        const types = difficulty === "easy"
            ? easyTypes
            : hardTypes;
        const {
            rightCells,
            sourceCells
        } = mkCells(types);
        return {
            ...state,
            phase: "show",
            rightCells,
            sourceCells
        }
    },
    "SET_PHASE": (state, phase) => ({
        ...state,
        phase
    }),
    "DROP_FIGURE": (state, { index, type }) => {
        const sourceCells = withoutCell(state.sourceCells, type);
        const targetCells = [...state.targetCells, { index, type }];
        const phase =  sourceCells.length === 0
            ? "result"
            : state.phase;
        return {
            ...state,
            phase,
            targetCells,
            sourceCells
        };
    }
};

const mkCellItem = (index, type) => ({ index, type });

const mkCells = types => {
    const num = types.length;
    const rightIndices = takeNRandom(num)(range(0, 16));
    const sourceIndices = range(0, num);
    const rightCells = zipWith(mkCellItem, rightIndices, types);
    const sourceCells = zipWith(mkCellItem, sourceIndices, types);
    return {
        rightCells,
        sourceCells
    };
};

const withoutCell = (cells, sourceType) => {
    const indexOfType = findIndex(({ type }) => type === sourceType, cells);
    return indexOfType >= 0
        ? remove(indexOfType, 1, cells)
        : cells;
};

const reducer = (state, action) => {
    const act = reducers[action.type];
    return act !== undefined
        ? act(state, action.payload)
        : state;
};

const ChooseDifficulty = props => {
    const [,dispatch] = props.store;
    const setDifficulty = difficulty => () => dispatch({
        type: "SET_DIFFICULTY",
        payload: difficulty
    });
    return (
        <Segment color="teal" className="wrapper">
            <Button.Group>
                <Button onClick={setDifficulty("easy")}>Легко</Button>
                <Button.Or text="/" />
                <Button onClick={setDifficulty("hard")} positive>Сложно</Button>
            </Button.Group>
        </Segment>
    );
};

const ShowMatrix = props => {
    const [state, dispatch] = props.store;
    useEffect(() => {
        setTimeout(() => {
            dispatch({
                type: "SET_PHASE",
                payload: "act"
            });
        }, 30000);
    });
    return (
        <Segment color="teal">
            <h3 className="ui header">
                В течение 30 секунд смотрите внимательно на фигуры квадрата и старайтесь запомнить их расположение.
            </h3>
            <div className="wrapper">
                <Matrix
                    name="destination"
                    selected={state.rightCells}
                    elements={range(0, 16)}
                    rows={4}
                    columns={4}
                    droppable={false}
                />
            </div>
        </Segment>
    );
};

const ReproduceMatrix = props => {
    const [state, dispatch] = props.store;
    return (
        <Segment color="teal">
            <h3 className="ui header">
                Воспроизведите фигуры квадрата, перетащив элементы на поле.
            </h3>
            <div className="wrapper">
                <Matrix
                    name="destination"
                    selected={state.targetCells}
                    elements={range(0, 16)}
                    rows={4}
                    columns={4}
                    droppable={true}
                    dispatch={dispatch}
                />
                <Matrix
                    name="source"
                    selected={state.sourceCells}
                    elements={range(0, 8)}
                    rows={2}
                    columns={4}
                    draggable={true}
                />
            </div>
        </Segment>
    );
};

const ResultMatrix = props => {
    const [state] = props.store;
    return (
        <Segment color="teal">
            <h3 className="ui header">
                Оцените свою работу.
            </h3>
            <div className="wrapper">
                <Matrix
                    name="destination"
                    selected={state.targetCells}
                    elements={range(0, 16)}
                    rows={4}
                    columns={4}
                    droppable={false}
                />
                <Matrix
                    name="destination"
                    selected={state.rightCells}
                    elements={range(0, 16)}
                    rows={4}
                    columns={4}
                    droppable={false}
                />
            </div>
        </Segment>
    );
};

const Phases = {
    chooseDifficulty: ChooseDifficulty,
    show: ShowMatrix,
    act: ReproduceMatrix,
    result: ResultMatrix
};

const initialState = {
    phase: "chooseDifficulty",
    difficulty: null,
    targetCells: [],
    rightCells: [],
    sourceCells: []
};

const Application = ({ scormAPI }) => {
    const store = useReducer(
        reducer,
        {
            ...initialState,
            api: scormAPI
        }
    );
    const [state] = store;
    const Phase = Phases[state.phase] || Phases.show;
    return <Phase store={store} />
};

const Matrix = props => {
    const cells = props.elements.map(i => {
        const item = props.selected.find(({ index }) =>
            index === i) || { type: "empty"};
        return (
            <DroppableCell
                index={i}
                type={item.type}
                draggable={props.draggable || false}
                droppable={props.droppable || false}
                dispatch={props.dispatch || identity}
                key={i}
            />
        );
    });
    const dividers = createDividers(props.rows, props.columns);
    return (
        <div className={`${props.name} matrix`}>
            {cells}
            {dividers}
        </div>
    );
};

const CellItem = props => {
    const { connectDragSource, draggable, type } = props;
    const cellItem = type === "empty"
        ? null
        : <div className={type}></div>;
    return draggable && type !== "empty"
        ? connectDragSource(cellItem)
        : cellItem;
};

const cellItemSource = {
    beginDrag: props => props
};

const dragCollect = connect => ({
    connectDragSource: connect.dragSource()
});

const DraggableCellItem = DragSource("CELL_ITEM", cellItemSource, dragCollect)(CellItem);

const Cell = props => {
    const { connectDropTarget, droppable, draggable, type } = props;
    const cell = (
        <div className="cell">
            <DraggableCellItem type={type} draggable={draggable} />
        </div>
    );
    return droppable
        ? connectDropTarget(cell)
        : cell;
};

const cellTarget = {
    drop: (props, monitor) => {
        const item = monitor.getItem();
        props.dispatch({
            type: "DROP_FIGURE",
            payload: {
                type: item.type,
                index: props.index
            }
        });
        return {
            index: props.index,
            type: item.type
        };
    }
};

const dropCollect = connect => ({
    connectDropTarget: connect.dropTarget()
});

const DroppableCell = DropTarget("CELL_ITEM", cellTarget, dropCollect)(Cell);

const createDividers = (n, m) => {
    const verticalDividers = range(0, (m - 1)).map(i => {
        const style = {
            left: `${(i + 1) * 100}px`,
            height: `${n * 100}px`
        };
        return <div style={style} className="divider vertical" key={`v_${i}`}></div>;
    });
    const horizontalDividers = range(0, (n - 1)).map(i => {
        const style = {
            top: `${(i + 1) * 100}px`
        };
        return <div style={style} className="divider" key={`h_${i}`}></div>;
    });
    return [...verticalDividers, ...horizontalDividers];
};

export const App = DragDropContext(HTML5Backend)(Application);
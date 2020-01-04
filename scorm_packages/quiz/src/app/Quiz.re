[@react.component]
let make = (~state: Config.state, ~dispatch, ~words) => {
    let (checkedWords, setWords) = React.useState(() => []);

    let toggleWord = word => {
        let newWords: list(string) = List.mem(word, checkedWords)
            ? List.filter(w => w !== word, checkedWords)
            : checkedWords @ [word];
        setWords(_ => newWords);
    };

    let fields = List.mapi((i, w) => {
        let checked = List.mem(w, checkedWords);
        let checkboxClass = ["ui checkbox", checked ? "checked" : ""]
            |> String.concat(" ");
        <div className="field" key=string_of_int(i) onClick={_ => toggleWord(w)}>
            <div className=checkboxClass>
                <input className="hidden" tabIndex=0 type_="checkbox" readOnly=true checked=checked/>
                <label>{ReasonReact.string(w)}</label>
            </div>
        </div>
    }, words);

    <div>
        <div className="ui message">
            <div className="content">
                <p>{ReasonReact.string(state.config.description)}</p>
            </div>
        </div>
        <form className="ui form">
            {ReasonReact.array(Array.of_list(fields))}
            <div className="field">
                <button
                    className="ui button"
                    onClick={e => {
                        ReactEvent.Synthetic.preventDefault(e);
                        dispatch(Config.CheckWords(checkedWords));
                        setWords(_ => []);
                    }}
                >{ReasonReact.string({j|Готово|j})}</button>
            </div>
        </form>
        <div><TriesLog state=state /></div>
    </div>
};
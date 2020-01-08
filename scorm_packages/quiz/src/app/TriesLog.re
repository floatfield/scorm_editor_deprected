let to_items = (xs) => ReasonReact.array(Array.of_list(xs));

[@react.component]
let make = (~state: Config.state) => {
    let rows = state.tries
        |> List.mapi((i, t) => {
            let buttons = List.mapi((j, success) => {
                let key = {j|try_$j|j};
                let (name, color) = success ? ("check icon", "green") : ("close icon", "red");
                let buttonClassName = ["ui icon button", color]
                    |> String.concat(" ");
                <button key=key className=buttonClassName>
                    <i ariaHidden=true className=name />
                </button>
            }, t);
            let tryNumber = i + 1;
            let name = {j|Попытка $tryNumber|j};
            <div key=string_of_int(i) className="row">
                <div className="three wide column">{ReasonReact.string(name)}</div>
                <div className="column">
                    <div className="ui buttons">{to_items(buttons)}</div>
                </div>
            </div>
        });
    <div className="ui padded two column grid">{to_items(rows)}</div>
};
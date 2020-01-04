let rec findOption: ('a => bool, list('a)) => option('a) = (predicate, xs) => {
    switch(xs) {
    | [] => None
    | [y, ...ys] => predicate(y) ? Some(y) : findOption(predicate, ys)
    };
};

[@react.component]
let make = (~state: Config.state, ~scormApi: Config.scormApi) => {
    React.useEffect0(
        () => {
            let marks = Array.to_list(state.config.marks);
            let triesNumber = List.length(state.tries);
            let markEntry: Config.markConfig = switch (findOption((x: Config.markConfig) => x.triesNumber === triesNumber, marks)) {
            | None => { triesNumber: 0, mark: "2" }
            | Some(x) => x
            };
            let answers = state.answers |> String.concat("--");
            let result = {j|Количество попыток: $triesNumber; $answers|j}
            scormApi.lmsSetValue("cmi.core.score.raw", markEntry.mark);
            scormApi.lmsSetValue("cmi.core.score.max", "5");
            scormApi.lmsSetValue("cmi.core.score.min", "0");
            scormApi.lmsSetValue("cmi.comment", result);
            scormApi.lmsCommit("");
            scormApi.lmsFinish("");
            None;
        }
    );
    <div>
        <div className="ui green label">
            <i className="check icon" ariaHidden=true />
            {ReasonReact.string({j|Выполнено!|j})}
        </div>
        <div><TriesLog state=state /></div>
    </div>
};
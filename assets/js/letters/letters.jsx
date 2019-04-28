import React, { useEffect, useState } from "react";
import { Grid, Segment, Button, Message, GridColumn } from "semantic-ui-react";
import { range, groupBy, identity, values, pipe, any } from "ramda";
import * as random from "random";

const commandLetters = ["Л", "П", "В"];
const letters = [
	"А",
	"Б",
	"В",
	"Г",
	"Д",
	"Е",
	"Ё",
	"Ж",
	"З",
	"И",
	"Й",
	"К",
	"Л",
	"М",
	"Н",
	"О",
	"П",
	"Р",
	"С",
	"Т",
	"У",
	"Ф",
	"Х",
	"Ц",
	"Ч",
	"Ш",
	"Щ",
	"Ъ",
	"Ы",
	"Ь",
	"Э",
	"Ю",
	"Я"
];

export const LettersApp = () => {
    const [level, setLevel] = useState(null);
    return level === null
        ? <LevelSelector setLevel={setLevel} />
        : <Letters level={level} />;
};

const LevelSelector = ({ setLevel }) => (
    <Segment color="teal">
		<Message info>
			<p>Вам предлагается потренироваться в совершении трех  действий одновременно, в выполнении которых задействованы разные полушария. Ваша задача  - читать вслух буквы первого ряда, следить за буквами второго ряда и поднимать руки согласно инструкции.</p>
		</Message>
        <Grid>
			<Grid.Row textAlign="center">
				<GridColumn>
					<Button.Group>
						<Button positive onClick={() => setLevel("easy")}>Лёгко</Button>
						<Button.Or text="" />
						<Button onClick={() => setLevel("hard")}>Сложно</Button>
					</Button.Group>
				</GridColumn>
			</Grid.Row>
		</Grid>
    </Segment>
);

const Letters = ({ level }) => {
    const [state, setState] = useState(mkState(6, level));
    const letterColumns = mkLetterColumns(state.letters);
    const commadColumns = mkLetterColumns(state.commandLetters);
    useEffect(() => {
        setTimeout(() => setState(mkState(6, level)), 10000);
    });
    return (
        <Segment color="teal">
			<Message info>
				<p>Сядьте прямо. Руки положите перед собой. Ваша задача - читать буквы первого ряда и одновременно поднимать руки. Если под буквой стоит "Л", поднимайте левую руку. Если под буквой стоит "П", поднимайте правую руку. Если под буквой стоит "В", поднимайте обе руки. Буквы будут постоянно меняться. Постарайтесь прочитать несколько рядов без ошибок.</p>
			</Message>
            <Grid columns="six" celled="internally" padded>
                <Grid.Row textAlign="center">{letterColumns}</Grid.Row>
                <Grid.Row textAlign="center">{commadColumns}</Grid.Row>
            </Grid>
        </Segment>
    );
};

const mkState = (n, level) => ({
	letters: mkLetters(n, level === "easy" ? letters : commandLetters ),
	commandLetters: mkLetters(n, commandLetters)
});

const mkLetters = (n, ls) => {
	const letters = range(0, n).map(_i => ls[random.int(0, ls.length - 1)]);
	const greater = pipe(
		groupBy(identity),
		values,
		any(x => x.length > Math.ceil(n / ls.length))
	)(letters);
	return greater
		? mkLetters(n, ls)
		: letters;
};

const mkLetterColumns = ls =>
    ls.map((letter, i) => (
        <Grid.Column key={i}>
            <h1 className="ui header">{letter}</h1>
        </Grid.Column>
    ));


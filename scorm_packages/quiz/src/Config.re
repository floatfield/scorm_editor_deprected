type markConfig = {
    triesNumber: int,
    mark: string
};

type scormApi = {
  lmsSetValue: (string, string) => unit,
  lmsCommit: string => unit,
  lmsFinish: string => unit
};

type quizConfig = {
    minSuccessSeries: int,
    right: array(string),
    wrong: array(string),
    rightNumber: int,
    wrongNumber: int,
    description: string,
    marks: array(markConfig)
};

type action =
  | CheckWords(list(string));

type quizState =
  | InProgress
  | Passed;

type state = {
    config: quizConfig,
    tries: list(list(bool)),
    currentTry: list(bool),
    answers: list(string),
    quizState: quizState
};

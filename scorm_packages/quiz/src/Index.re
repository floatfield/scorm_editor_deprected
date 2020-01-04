open Config

[@bs.module "./scormFunctions"] external scormInit: unit => scormApi = "scormProcessInitialize";
[@bs.val] external quizConfig: quizConfig = "__quizConfig";

let scormApi = scormInit();

ReactDOMRe.renderToElementWithId(<App quizConfig scormApi />, "some");
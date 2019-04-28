import React from "react";
import ReactDOM from "react-dom";
import { LettersApp } from "./some";
import { scormProcessInitialize } from "./scormFunctions";

const API = scormProcessInitialize();

ReactDOM.render(
    <LettersApp scormAPI={API} />,
    document.querySelector("#some")
);
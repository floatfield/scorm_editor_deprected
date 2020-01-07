import React from "react";
import ReactDOM from "react-dom";
import { App } from "./some";
import { scormProcessInitialize } from "./scormFunctions";

const API = scormProcessInitialize();

ReactDOM.render(
    <App scormAPI={API} />,
    document.querySelector("#some")
);
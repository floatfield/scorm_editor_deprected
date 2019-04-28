import React from "react";
import ReactDOM from "react-dom";
import { FlyApp } from "./some";
import { scormProcessInitialize } from "./scormFunctions";

const API = scormProcessInitialize();

ReactDOM.render(
    <FlyApp scormAPI={API} />,
    document.querySelector("#some")
);
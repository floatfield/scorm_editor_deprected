// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css";
import React from "react";
import ReactDOM from "react-dom";
import { FlyApp } from "./fly/fly";
import { LettersApp } from "./letters/letters";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative paths, for example:
// import socket from "./socket"

const flyWrapper = document.querySelector("#fly-wrapper");
if (flyWrapper !== null) {
    ReactDOM.render(<FlyApp />, flyWrapper);
}

const lettersWrapper = document.querySelector("#letters-wrapper");
if (lettersWrapper !== null) {
	ReactDOM.render(<LettersApp />, lettersWrapper);
}
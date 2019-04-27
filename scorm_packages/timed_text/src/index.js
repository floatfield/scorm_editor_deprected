import React from "react";
import ReactDOM from "react-dom";
import { App } from "./some";
import { scormProcessInitialize } from "./scormFunctions";

const API = scormProcessInitialize();

const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam non tempor ex. Nunc a nulla at odio feugiat pharetra eu et nisi. Nam ornare lacinia lacus. Suspendisse ut magna ut ex tristique scelerisque. Donec rutrum libero nec risus aliquet sodales. Maecenas egestas, risus vel tempor consectetur, neque est molestie lacus, ac tempor urna ligula nec magna. Integer at nulla hendrerit, fermentum augue eu, pharetra nisi. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam dictum urna non enim pulvinar, ac euismod nisl laoreet. Donec lorem magna, imperdiet at porttitor facilisis, congue et metus. Sed lectus magna, auctor eleifend leo eget, tempor accumsan lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nullam eu felis id quam pulvinar commodo. Nulla facilisi.";

document.addEventListener("mousedown", e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
});

ReactDOM.render(
    <App scormAPI={API} text={text} />,
    document.querySelector("#some")
);
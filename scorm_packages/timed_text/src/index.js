import React from "react";
import ReactDOM from "react-dom";
import { App } from "./some";
import { scormProcessInitialize } from "./scormFunctions";

const API = scormProcessInitialize();

const text = "Более сотни лет аналоговая собака виляла цифровым хвостом. Попытки расширить возможности наших органов чувств – зрения, слуха, и даже, в каком-то смысле, осязания, вели инженеров и учёных на поиски лучших компонентов для телеграфа, телефона, радио и радаров. Лишь по счастливой случайности эти поиски обнаружили путь к созданию новых типов цифровых машин. И я решил рассказать историю этой постоянной экзаптации, во время которой инженеры электросвязи поставляли исходные материалы для первых цифровых компьютеров, а иногда даже сами проектировали и создавали эти компьютеры.";

document.addEventListener("mousedown", e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
});

ReactDOM.render(
    <App scormAPI={API} text={text} />,
    document.querySelector("#some")
);
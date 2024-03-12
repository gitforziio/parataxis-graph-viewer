debugger;

import React from "../../vendor/react.js";
import ReactDOM from "../../vendor/react-dom.js";
import { MyApp } from "./app.js";

// console.log('React:\n', React);
// console.log('ReactDOM:\n', ReactDOM);

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(MyApp));

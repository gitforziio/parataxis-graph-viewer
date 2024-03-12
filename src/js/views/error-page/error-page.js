import ReactRouterDom from "../../../../vendor/react-router-dom.js";
import { createElement as vNode } from "../../../../vendor/react.js";

export default function ErrorPage() {
  const error = ReactRouterDom.useRouteError();
  console.error(error);

  return vNode('div', null, [
    vNode('h1', null, 'Oops!'),
    vNode('p', null, `${error.status} error: ${error.statusText}`),
    vNode(ReactRouterDom.Link, {to: '/'}, '返回首页'),
  ]);
}
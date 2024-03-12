import { createElement as vNode, Fragment } from "../../../../vendor/react.js";
import ReactRouterDom from "../../../../vendor/react-router-dom.js";

export default function PageNotFound() {
  return vNode(Fragment, null, [
    vNode('p', null, '页面被吞噬啦。。。'),
    vNode(ReactRouterDom.Link, {to: '/'}, '返回首页'),
  ]);
}
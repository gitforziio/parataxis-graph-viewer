import { createElement as vNode, useState, useEffect, useRef, useMemo } from "../../../vendor/react.js";

import {
  normalize_All,
} from "../lib/my-vis-data-formatter.mjs.js";

const view_data_to_my_items = (view_data) => {
  return normalize_All(view_data);
};

export default function MySegAndPosPanel(props) {
  const my_items = useMemo(()=>view_data_to_my_items(props?.data), [props?.data]);
  return vNode('div', {className: "my-1 ms-3 vstack gap-2 flex-wrap"}, [
    my_items.map((my_item, my_idx)=>vNode('div', {
      key: `${my_idx}`,
      className: "hstack gap-2 flex-wrap",
    }, [
      vNode('a', {
        className: "fw-normal text-muted",
        target: "_blank",
        href: my_item?.ref_info?.link ?? my_item?.ref_info?.href ?? `https://cn.bing.com/search?q=${my_item?.ref_info?.text ?? my_item.header}`,
      }, my_item?.header??"<???>"),
      vNode('span', {className: "fw-normal me-2"}, (my_item?.items??[]).map(list=>list.map(pr=>vNode('span', {className: "fw-normal me-2"}, [
        vNode('span', {className: "text-success"}, pr[0]),
        vNode('span', {className: "text-muted"}, "/"),
        pr[1]==null ? null : vNode('span', {className: "text-muted"}, pr[1]),
      ])))),
    ])),
  ]);
};

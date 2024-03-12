import { createElement as vNode, Fragment, useState, useMemo, useEffect } from "../../../../vendor/react.js";
// import ReactRouterDom from "../../../../vendor/react-router-dom.js";
import {
  Layout,
  Menu,
  Row,
  Col,
  Space,
  Switch,
  Tooltip,
  Button,
  Select,
  Checkbox,
  Input,
  TagInput,
  InputNumber,
  Upload,
  MessagePlugin,
  DialogPlugin,
} from "../../../../vendor/tdesign.min.js";

import PGVis from "../../components/PGVis.js";


import Lodash from "../../../../vendor/lodash.mjs.js";
import storage from "../../utils/store.js";


export default function DetailBlock(props) {

  const [cached_content, set_cached_content] = useState(null);
  useEffect(async()=>{
    const init_cached_content = await storage?.getItem?.("cached_content") ?? null;
    set_cached_content(init_cached_content);
  }, []);

  const data_list = props?.data_list??[];
  const [data_idx_control__main_idx, set__data_idx_control__main_idx] = useState(props?.data_idx_control__main_idx??0);
  const [data_idx_control__nlp_idx, set__data_idx_control__nlp_idx] = useState(props?.data_idx_control__nlp_idx??0);
  const data_item = useMemo(()=>{
    return data_list?.[data_idx_control__main_idx??0]
  }, [data_list, data_idx_control__main_idx]);
  const nlp_data = useMemo(()=>{
    return (data_item?.nlp_outputs??[])[data_idx_control__nlp_idx];
  }, [data_item?.nlp_outputs, data_idx_control__nlp_idx]);



  const go_nth_item = (idx) => {
    const min_idx = 0;
    const max_idx = (data_list?.length??0)-1;
    if (idx >= min_idx && idx <= max_idx) {
      if (data_idx_control__main_idx!=idx) {
        set__data_idx_control__main_idx(idx);
        set__data_idx_control__nlp_idx(0);
        return true;
      };
      MessagePlugin.info("无变化");
      return false;
    };
    MessagePlugin.info("超出范围了");
    return false;
  };
  const go_previous_item = () => {
    const main_idx = data_idx_control__main_idx??0;
    go_nth_item(main_idx-1);
  };
  const go_next_item = () => {
    const main_idx = data_idx_control__main_idx??0;
    go_nth_item(main_idx+1);
  };


  const go_previous_nlp_idx = () => {
    const min_idx = 0;
    const nlp_idx = data_idx_control__nlp_idx??0;
    if (nlp_idx > min_idx) {
      set__data_idx_control__nlp_idx(nlp_idx-1);
    } else {MessagePlugin.info("没有啦");};
  };
  const go_next_nlp_idx = () => {
    const max_idx = (data_item?.nlp_outputs?.length??0)-1;
    const nlp_idx = data_idx_control__nlp_idx??0;
    if (nlp_idx < max_idx) {
      set__data_idx_control__nlp_idx(nlp_idx+1);
    } else {MessagePlugin.info("没有啦");};
  };


  return vNode('div', {className: "my-5"}, [
    vNode('h4', {className: "mb-3"}, "详情"),
    vNode('div', {className: "my-1 hstack gap-1"}, [
      vNode(Button, { theme: "default", size: "small", onClick: ()=>{go_previous_item()}, }, "上一块"),
      vNode('span', {className: "mx-1"}, ``),
      vNode(Button, { theme: "default", size: "small", onClick: ()=>{go_previous_nlp_idx()}, }, "上一条"),
      vNode('span', {}, `第${(1+(+data_idx_control__nlp_idx))}条/共${data_item?.nlp_outputs?.length??0}条`),
      vNode(Button, { theme: "default", size: "small", onClick: ()=>{go_next_nlp_idx()}, }, "下一条"),
      vNode('span', {className: "mx-1"}, ``),
      vNode(Button, { theme: "default", size: "small", onClick: ()=>{go_next_item()}, }, "下一块"),
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      nlp_data?.text==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "文本"),
        vNode('code', {
          onClick: ()=>{console.log(nlp_data)},
        }, nlp_data.text),
      ],
    ]),
    vNode('div', {className: "my-1 hstack gap-1 flex-wrap"}, [
      nlp_data?.sent==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "分词"),
        ...(nlp_data?.sent??[]).map((it, idx)=>vNode('span', {className: "badge rounded-pill text-bg-light fw-normal"}, [vNode('span', {className: "text-black-50"}, `[${idx}]`), " ", vNode('code', {}, it), ])),
      ],
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      nlp_data?.text==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "字符数"),
        vNode('span', {}, nlp_data?.text?.length??0),
      ],
      nlp_data?.sent==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "分词数"),
        vNode('span', {}, nlp_data?.sent?.length??0),
      ],
    ]),

    vNode(PGVis, {
      data: nlp_data,
      key: `vis-[${data_idx_control__main_idx}][${data_idx_control__nlp_idx}]${nlp_data?.text}`,
      elementId: "diagram",
    }),
  ]);

};

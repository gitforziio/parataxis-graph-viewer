import { createElement as vNode, Fragment, useState, useMemo, useEffect } from "../../../../vendor/react.js";
// import ReactRouterDom from "../../../../vendor/react-router-dom.js";
import MyViewPanelGroup from "../../components/MyViewPanelGroup.js";
import {
  Layout,
  Menu,
  Row,
  Col,
  Space,
  Tooltip,
  Textarea,
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
import Lodash from "../../../../vendor/lodash.mjs.js";
import storage from "../../utils/store.js";
import { save as saveIt, saveLines, saveText, saveBlob } from "../../utils/save.js";

export default function FileReaderDemoSettings(props) {

  const basicMaterialTags = [
    '单人',
    '双人',
    '多人',
    '无器械',
    '有器械',
  ];
  const basicFragTags = [
    '配列-LZ:[+部位]&V',
    '配列-LZ:[+部位1]&“和”&[+部位2]&V',
    '配列-LZ:[+部位]&[±位置]&V',
    '配列-LZ:[+部位]&[±方向]&V',
    '配列-LZ:[+部位]&[±源点]&[±终点]&V',
    '配列-LZ:[+部位]&[±路径]&V',
    '配列-LZ:[+部位]&[±距离]&V',
    '配列-LZ:[+部位]&[±角度]&V',
    '配列-LZ:[+部位]&V&[+客体]',
    '配列-LZ:[+部位]&向&[+客体]&V',
    '特征-LZ:[+位置]',
    '特征-LZ:[+源点]',
    '特征-LZ:[+终点]',
    '特征-LZ:[+方向]',
    '特征-LZ:[+路径]',
    '特征-LZ:[+距离]',
    '特征-LZ:[+角度]',
    '特征:[+客体]',
    '特征:[+动向]',
    '特殊句式-LZ:把/将...',
    '特殊句式-LZ:使...',
    '特殊句式:让...',
    '特殊句式:用...',
    '特点:[+时间]',
    '特点:[+方式/方法]',
    '特点:[+连词]',
    '特点:[+随动]',
    '特点:[+单音节动作]',
    '特点:[+单音节部位]',
  ];

  const [primaryMaterialTags, set_primaryMaterialTags] = useState(basicMaterialTags);
  const [primaryFragTags, set_primaryFragTags] = useState(basicFragTags);
  useEffect(async()=>{
    const init_primaryMaterialTags = await storage?.getItem?.("primaryMaterialTags") ?? [];
    if (init_primaryMaterialTags?.length) {set_primaryMaterialTags(Lodash.uniq([...basicMaterialTags, ...init_primaryMaterialTags]));};
    const init_primaryFragTags = await storage?.getItem?.("primaryFragTags") ?? [];
    if (init_primaryFragTags?.length) {set_primaryFragTags(Lodash.uniq([...basicFragTags, ...init_primaryFragTags]));};
  }, []);
  useEffect(async()=>{
    props?.onSetMaterialTags?.( Lodash.uniq([...primaryMaterialTags, ...(props?.materialTags??[])]) );
  }, [primaryMaterialTags]);
  useEffect(async()=>{
    props?.onSetFragTags?.( Lodash.uniq([...primaryFragTags, ...(props?.fragTags??[])]) );
  }, [primaryFragTags]);

  return vNode('div', {}, [
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      vNode('span', {className: "fw-bold text-muted"}, "条目级预设标签"),
      vNode(TagInput, {
        value: primaryMaterialTags,
        onChange: async(newTags)=>{
          set_primaryMaterialTags(newTags);
          await storage.setItem("primaryMaterialTags", newTags);
        },
        clearable: true,
      }),
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      vNode('span', {className: "fw-bold text-muted"}, "片段级预设标签"),
      vNode(TagInput, {
        value: primaryFragTags,
        onChange: async(newTags)=>{
          set_primaryFragTags(newTags);
          await storage.setItem("primaryFragTags", newTags);
        },
        clearable: true,
      }),
    ]),
  ]);
};

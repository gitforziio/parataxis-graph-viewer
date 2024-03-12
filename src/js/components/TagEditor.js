import { createElement as vNode, useState } from "../../../vendor/react.js";
import {
  Button,
  Select,
  Checkbox,
} from "../../../vendor/tdesign.min.js";
import Lodash from "../../../vendor/lodash.mjs.js";

const getTagContent = tag => {
  if (Lodash.isString(tag)) {return tag};
  return tag?.label ?? tag?.value ?? tag?.face ?? tag?.content ?? tag?.text;
};

const TagEditor = props => {

  const [isEditing, set_isEditing] = useState(false);

  return vNode('div', {className: "my-1 vstack gap-1"}, [

    vNode('div', {className: "my-1 hstack gap-2"}, [

      (props?.value??[]).map((tag, idx)=>vNode('span', {className: "badge text-bg-light"}, getTagContent(tag)??"???")),

      vNode(Button, { theme: "default", size: "small", onClick: async()=>{
        set_isEditing(!isEditing);
      }, }, isEditing ? "完成" : "编辑"),
    ]),

    !isEditing ? null : [
      vNode(Select, {
        placeholder: "选择或输入并回车",
        multiple: true,
        filterable: true,
        creatable: true,
        clearable: true,
        options: props?.options,
        value: props?.value,
        defaultValue: props?.defaultValue,
        onChange: props?.onChange,
        onCreate: props?.onCreate,
      }),
      vNode(Checkbox.Group, {
        options: props?.options,
        value: props?.value,
        defaultValue: props?.defaultValue,
        onChange: props?.onChange,
      }),
    ],

  ]);
};

export default TagEditor;

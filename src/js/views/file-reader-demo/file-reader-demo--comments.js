import { createElement as vNode, Fragment, useState, useMemo, useEffect } from "../../../../vendor/react.js";
import {
  Textarea,
  Button,
  MessagePlugin,
  DialogPlugin,
} from "../../../../vendor/tdesign.min.js";
import Lodash from "../../../../vendor/lodash.mjs.js";
import storage from "../../utils/store.js";
import { save as saveIt, saveLines, saveText, saveBlob } from "../../utils/save.js";

export default function FileReaderDemoComments(props) {
  // userName
  // comments
  // onChange(newComments)

  const [editing, set_editing] = useState(false);
  const [boxContent, set_boxContent] = useState("");


  return vNode('div', {
    className: "vstack gap-1",
  }, [
    vNode('div', {className: "vstack gap-1"}, [
      !editing ? vNode('div', {}, vNode(Button, {
        theme: "default", size: "small",
        onClick: ()=>{
          if (!props?.userName?.length) {
            MessagePlugin.warning("请先设置用户名！");
            return;
          };
          set_boxContent("");
          set_editing(true);
        },
      }, "新增")) : [
        vNode(Textarea, {
          value: boxContent,
          autosize: { minRows: 3, maxRows: 10 },
          onChange: (value)=>{
            set_boxContent(value);
          },
        }),
        vNode('div', {className: "my-1 hstack gap-2"}, [
          vNode(Button, {
            theme: "primary", size: "small",
            onClick: ()=>{
              if (!props?.userName?.length) {
                MessagePlugin.warning("请先设置用户名！");
                return;
              };
              if (!boxContent?.length) {
                MessagePlugin.warning("请先填写内容！");
                return;
              };
              const the_comments = [...(props?.comments??[])];
              the_comments.push({
                user: { userName: props?.userName, },
                content: boxContent,
                time: (new Date()).toISOString(),
              });
              props?.onChange?.(the_comments);
              set_editing(false);
            },
          }, "确定"),
          vNode(Button, {
            theme: "default", size: "small",
            onClick: ()=>{
              set_editing(false);
            },
          }, "取消"),
        ]),
      ],
    ]),
    (props?.comments??[]).map((comment, idx)=>vNode('div', {
      className: ["hstack gap-2 flex-wrap"].join(" "),
      key: `[${idx}]-[${comment?.time}]-[${(comment?.user?.userName ?? "")}]`,
    }, [
      vNode('span', {className: "text-"}, comment?.user?.userName ?? "<无名氏>"),
      comment?.time==null ? null : ["在", vNode('span', {}, (new Date(comment.time)).toLocaleString())],
      ["说: ", vNode('span', {}, comment?.content ?? vNode('span', {className: "text-muted"}, "无内容"))],
      vNode(Button, {
        theme: "default", size: "small",
        onClick: ()=>{
          const myDialog = DialogPlugin({
            header: "删除留言",
            body: (comment?.user?.userName ?? "")!=(props?.userName ?? "") ? "请注意：这不是你的留言。确定要删除吗？" : "确定要删除吗？",
            onConfirm: ({ event, trigger }) => {
              const the_comments = [...(props?.comments??[])];
              the_comments.splice(idx, 1);
              props?.onChange?.(the_comments);
              myDialog.hide();
            },
            onClose: ({ event, trigger }) => {
              myDialog.hide();
            },
          });
        },
      }, "删除"),
    ])),
  ]);
};

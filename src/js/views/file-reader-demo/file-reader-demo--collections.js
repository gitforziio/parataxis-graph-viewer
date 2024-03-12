import { createElement as vNode, Fragment, useState, useMemo, useEffect, memo, useRef } from "../../../../vendor/react.js";
import {
  Tooltip,
  Textarea,
  Button,
  Select,
  Checkbox,
  Input,
  TagInput,
  InputNumber,
  MessagePlugin,
  DialogPlugin,
} from "../../../../vendor/tdesign.min.js";

import DnD from "../../../../vendor/react-beautiful-dnd.mjs.js";
const { DragDropContext, Droppable, Draggable } = DnD;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const MaterialItem = React.forwardRef((props, ref) => {
  return vNode('div', {
    ref: ref,
    key: `MaterialItem-${(props?.materialIdx??0)}`,
    className: "my-1 hstack gap-2 flex-wrap",
    ...props.draggableProps,
  }, [
    vNode('span', {
      className: "fw-normal text-muted",
      ...props.dragHandleProps,
    }, `[${((props?.materialIdx??0)+1)}]`),
    vNode('span', {
      className: "fw-normal text-muted",
    }, props?.material?.head??"<无题>"),
    vNode(Button, {
      theme: "default", size: "small",
      onClick: ()=>{
        const myDialog = DialogPlugin({
          header: "删除收集的条目",
          body: "确定要删除吗？",
          onConfirm: ({ event, trigger }) => {
            const the_collectedMaterials = [...(props?.collectedMaterials??[])];
            the_collectedMaterials.splice((props?.materialIdx??0), 1);
            props?.onSetCollectedMaterials?.(the_collectedMaterials);
            myDialog.hide();
          },
          onClose: ({ event, trigger }) => {
            myDialog.hide();
          },
        });
      },
    }, "删除"),
    props?.material?.nlp_outputs?.map((frag, fr_idx)=>vNode('span', {key: `${fr_idx}`, className: [
      "fw-normal",
      frag?.fav ? "text-danger" : "text-",
    ].join(" ")}, frag?.text??"<无内容>")),
  ])
});
const MaterialItemWrap = (props)=>{
  return vNode(Draggable, {
    draggableId: `MaterialItemWrap-${props?.material?.fidx}-${props?.material?.sidx}-${props?.material?.head}`,
    index: props?.materialIdx,
  }, provided => vNode(MaterialItem, {
    ref: provided.innerRef,
    draggableProps: provided.draggableProps,
    dragHandleProps: provided.dragHandleProps,
    material: props.material,
    materialIdx: props.materialIdx,
    collectedMaterials: props.collectedMaterials,
    onSetCollectedMaterials: props.onSetCollectedMaterials,
  }));
};

const MaterialList = memo(function MaterialList(props) {
  return vNode('div', {className: "my-1 vstack gap-2 flex-wrap"}, [
    (props?.collectedMaterials??[]).map((mtrl, mt_idx)=>vNode(MaterialItemWrap, {
      key: `MaterialItemWrap-${mtrl?.fidx}-${mtrl?.sidx}-${mtrl?.head}`,
      index: mt_idx,
      material: mtrl,
      materialIdx: mt_idx,
      collectedMaterials: props?.collectedMaterials,
      onSetCollectedMaterials: props?.onSetCollectedMaterials,
    })),
  ]);
});

function FileReaderDemoCollections(props) {

  const readAsFile = async()=>{
    const newAppData = {
      current_file_info: {
        name: "已收集的条目",
      },
      data_list: props?.collectedMaterials,
    };
    if (props?.appData?.data_list?.length) {
      const myDialog = DialogPlugin({
        header: "作为文件加载",
        body: "请注意：这会取代已加载的文件，确定要加载吗？",
        onConfirm: ({ event, trigger }) => {
          props?.onAppDataChange?.(newAppData);
          myDialog.hide();
        },
        onClose: ({ event, trigger }) => {
          myDialog.hide();
        },
      });
    } else {
      props?.onAppDataChange?.(newAppData);
    };
  };


  const [collectedMaterials, set__collectedMaterials] = useState(props?.collectedMaterials??[]);
  useEffect(()=>{
    set__collectedMaterials(props?.collectedMaterials);
  }, [props?.collectedMaterials]);
  useEffect(()=>{
    props?.onSetCollectedMaterials?.(collectedMaterials);
  }, [collectedMaterials]);


  function onDragEnd(result) {
    if (!result.destination) {return;};
    if (result.destination.index === result.source.index) {return;};
    const new_collectedMaterials = reorder(
      collectedMaterials,
      result.source.index,
      result.destination.index
    );
    console.log(new_collectedMaterials);
    set__collectedMaterials(new_collectedMaterials);
  };

  return vNode('div', {}, [
    // vNode('h5', {className: "h5"}, "已收集的条目"),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      vNode('span', {className: "fw-bold text-muted"}, "操作"),
      vNode(Tooltip, {
        content: "将已收集的条目作为文件加载，请注意：会取代已加载的文件",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: readAsFile,
      }, "作为文件读取")),
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      vNode('span', {className: "fw-bold text-muted"}, "内容"),
    ]),
    vNode(DragDropContext, {onDragEnd: onDragEnd}, [
      vNode(Droppable, {droppableId: "droppable-material-list"},
        provided => vNode('div', {
          ref: provided.innerRef,
          ...provided.draggableProps,
        }, [
          vNode(MaterialList, {
            collectedMaterials: collectedMaterials,
            onSetCollectedMaterials: set__collectedMaterials,
          }),
          provided.placeholder,
        ]),
      ),
    ]),



    // vNode('h5', {className: "h5"}, "已收集的片段"),
    // vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
    //   vNode('span', {className: "fw-bold text-muted"}, "收集的片段"),
    // ]),
  ]);
};

export default FileReaderDemoCollections;

import { createElement as vNode, useState, useMemo, useEffect, useRef } from "../../../vendor/react.js";
import MyPGVis from "../lib/my-pg-vis.mjs.js";
import {
  Tooltip,
  MessagePlugin,
  DialogPlugin,
} from "../../../vendor/tdesign.min.js";
import { save as saveIt, saveLines, saveText, saveBlob } from "../utils/save.js";

import _ from "../../../vendor/lodash.mjs.js";


export default function PGVis(props) {
  const elementId = useMemo(()=>{
    return (props?.elementId??"diagram");
  }, [props.elementId]);

  const visData = useMemo(()=>{
    const that = {
      text: "",
      spans: [],
      nodes: [],
      edges: [],
    };

    const sent = props?.data?.sent??[];
    for (let ii=0; ii<sent.length; ii++) {
      const word = sent[ii];  // word 是单词的字符串
      const start = that.text.length;
      const span = {
        idx: ii,
        range: [start, start+word.length],
        text: word,
      };
      that.spans.push(span);
      that.text = `${that.text}${word}`;
    }

    const getNodeFace = node => `[${node.idx}]${node.word}`;

    const relData = props?.data?.relData??[];
    const units = relData.map(it=>[it.word1, it.word2]).flat().filter(it=>it!=null);
    const uniqUnits = _.uniqBy(units, it=>{
      return getNodeFace(it);
      // if (it?.idx < 0) {
      //   return it;
      // }
      // return it.idx;
    });
    for (let ii=0; ii<uniqUnits.length; ii++) {
      const unit = uniqUnits[ii];
      const node = {
        idx: getNodeFace(unit),
        label: unit.word,
        anchors: [],
        is_root: unit.word=="ROOT",
      };
      if (unit.idx>=0) { node.anchors.push(unit.idx); }
      that.nodes.push(node);
    }
    for (let ii=0; ii<relData.length; ii++) {
      const rel = relData[ii];  // {word1, word2, relVal}
      const edge = {
        source: getNodeFace(rel.word2),
        target: getNodeFace(rel.word1),
        edge: rel.relVal,
      };
      that.edges.push(edge);
    }


    return that;


  }, [props.data]);




  const [alt, set_alt] = useState("");



  const myVis = new MyPGVis({
    config: {
      window: window,
      document: document,
      elementId: elementId,

      level_height: 70,
      base_height: 10,

      alphaTarget: 0,
      alphaDecay: 0.05, // 0.1,  // 力道衰减率
      velocityDecay: 0.3, // 0.3,  // 速度衰减率 越大结束越快 // 每个 tick 速度 = 速度*(1-速度衰减率)
    },
    data: {
      // entries: entries,
      // relations: [],
      // attributes: [
      //   // Format: [${ID}, ${TYPE}, ${TARGET}],
      // ],
      ...visData,
    },
  });

  const [theVis, set_theVis] = useState(myVis);

  useEffect(()=>{
    if (
      true
      &&(theVis?.data?.tokens?.length??0)<40
      &&(theVis?.data?.spans?.length??0)<40
      &&(theVis?.data?.nodes?.length??0)<60
    ) {
      theVis.clean();
      theVis.init(true);
      set_alt("");
    } else {
      set_alt("节点较多，请点击「重新绘制」手动加载");
    };
  }, []);

  const myVisEventHandlerInfoList = [
    {name: "click", fn: (event)=>{
      if (event?.target == theVis.svg.node()) {
        console.log("click:\n", event);
        theVis?.clearInvolve();
      };
    }},
    {name: "click-unit", fn: (event)=>{
      const datum = event?.detail?.datum;
      const vis = event?.detail?.vis;
      vis?.involveUnit(datum);
      console.log("click-unit:\n", event);
    }},
    // {name: "involved", fn: (event)=>{
    //   console.log("involved:\n", event);
    // }},

    {name: "end", fn: (event)=>{
      // console.log("end:\n", event);
    }},
    {name: "drag-start", fn: (event)=>{
      // console.log("drag-start:\n", event);
    }},
    {name: "drag-end", fn: (event)=>{
      // console.log("drag-end:\n", event);
    }},
    // { name: "drag-move", fn: (event)=>{console.log("drag-move:\n", event);} },
    // { name: "drag", fn: (event)=>{console.log("drag:\n", event);} },
    // { name: "resize", fn: (event)=>{console.log("resize:\n", event);} },
    // { name: "tick", fn: (event)=>{console.log("tick:\n", event);} },
  ];
  const myVisWrapperRef = useRef(null);
  useEffect(()=>{
    const myVisWrapper = myVisWrapperRef.current;
    for (const info of myVisEventHandlerInfoList) {
      myVisWrapper.addEventListener(info.name, info.fn);
    };
    return ()=>{
      for (const info of myVisEventHandlerInfoList) {
        myVisWrapper.removeEventListener(info.name, info.fn);
      };
    };
  }, []);

  const showJson = async(flag="data", indent=undefined)=>{
    const myDialog = DialogPlugin({
      width: "80%",
      header: "查看JSON",
      body: vNode('div', {
        className: "",
      }, [
        vNode('div', {}, [
          vNode('textarea', {
            className: [
              "form-control",
              // "form-control-sm",
            ].join(" "),
            // value: JSON.stringify(props?.data, null, 2),
            // value: JSON.stringify(props?.['sourceData']),
            value: JSON.stringify(props?.[flag], null, indent),
          }),
        ]),
      ]),
      cancelBtn: false,
      onConfirm: ({ event, trigger }) => {
        myDialog.hide();
      },
      onClose: ({ event, trigger }) => {
        myDialog.hide();
      },
    });
  };



  const saveSVG = async()=>{
    // MessagePlugin.info("功能待开发");
    if (theVis?.svg?.node?.()==null) {
      MessagePlugin.info("请先绘制图形");
      return;
    };

    const node = theVis?.svg?.node?.()?.cloneNode?.(true);
    const d3Node = MyPGVis.D3.select(node);

    d3Node
      .attr("height", 2 * theVis.rootHeight)
      .attr("width", 2 * theVis.rootWidth)
      .attr("viewBox", theVis.rootViewBox)
      .call(theVis.zoom.transform, MyPGVis.D3.zoomIdentity)
    ;

    saveText(d3Node?.node?.()?.outerHTML, `${elementId}.svg`);
  };



  return vNode('div', {
    className: [
      "my-2 p-2",
      "bg-white",
      "border border-1 rounded",
      "overflow-auto",
    ].join(" ")
  }, [
    vNode('div', {className: "diagram-wrap my-2"}, [
      vNode('div', {}, [
        vNode('diagram', {
          ref: myVisWrapperRef,
          id: elementId, className: "diagram",
        }),
        vNode('div', {
          className: [
            "text-muted text-center",
            alt?.length ? "--d-none" : "d-none",
          ].join(" "),
        }, alt),
      ]),
    ]),
    vNode('div', {className: "hstack gap-1 justify-content-center"}, [
      vNode(Tooltip, {
        content: "重新绘制整个图形",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: async()=>{
          await theVis.clean();
          await theVis.init(true);
          set_alt("");
          set_theVis(theVis);
        },
      }, "重新绘制")),
      vNode(Tooltip, {
        content: "在图中拖拽或缩放之后，重新调整到合适的布局",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: ()=>{
          theVis.resize();
        },
      }, "适应画布")),
      vNode(Tooltip, {
        content: "微微扰动布局，使节点之间分布更合适",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: ()=>{
          theVis.fineTuning();
        },
      }, "微扰布局")),
      vNode(Tooltip, {
        content: "查看针对可视化工具处理之后的json格式数据",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: async()=>{
          showJson('data');
        },
      }, "查看JSON")),
      vNode(Tooltip, {
        content: "查看原始的json格式数据内容",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: async()=>{
          showJson('sourceData');
        },
      }, "查看原始JSON")),
      vNode(Tooltip, {
        content: "将此图形以SVG格式导出保存",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: saveSVG,
      }, "导出SVG")),
      true ? null : vNode(Tooltip, {
        content: "将此图形以PNG格式导出保存",
      }, vNode('button', {
        type: "button",
        className: [
          "btn btn-sm",
          "btn-outline-secondary",
        ].join(" "),
        onClick: async()=>{
          MessagePlugin.info("功能待开发");
          return;
          // if (theVis?.svg?.node?.()==null) {
          //   MessagePlugin.info("请先绘制图形");
          //   return;
          // };
          // svgToPng(theVis?.svg?.node?.(), theVis?.svg?.attr("width"), theVis?.svg?.attr("height"), (blob)=>{
          //   saveBlob(blob, `${elementId}.png`);
          //   console.log("png blob\n", blob);
          // });
        },
      }, "导出PNG")),
    ]),
  ]);
};

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
// import TagEditor from "../../components/TagEditor.js";
// import MyViewPanelGroup from "../../components/MyViewPanelGroup.js";
// import MySegAndPosPanel from "../../components/MySegAndPosPanel.js";




import DetailBlock from "./file-reader-demo--DetailBlock.js";


import Lodash from "../../../../vendor/lodash.mjs.js";
import storage from "../../utils/store.js";
import { save as saveIt, saveLines, saveText, saveBlob } from "../../utils/save.js";

// import FileReaderDemoComments from "./file-reader-demo--comments.js";
// import FileReaderDemoSettings from "./file-reader-demo--settings.js";
// import FileReaderDemoCollections from "./file-reader-demo--collections.js";

function getCurrentDate(needTime = false) {
  const d = new Date();
  let month = d.getMonth() + 1;
  month = month < 10 ? `0${month}` : month;
  const date = `${d.getFullYear()}-${month}-${d.getDate()}`;
  const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  if (needTime) return [date, time].join(' ')
  return date;
};





export default function FileReaderDemo() {

  const [files, set_files] = useState([]);
  const [current_file_info, set__current_file_info] = useState({});




  const requestMethod = async (file_or_files) => {
    // 自定义加载方法。
    // 返回值 status 表示加载成功或失败，error 或 response.error 表示加载失败的原因，response 表示请求加载成功后的返回数据，response.url 表示加载成功后的图片地址。
    // 示例一：{ status: 'fail', error: '加载失败', response }。示例二：{ status: 'success', response: { url: 'https://tdesign.gtimg.com/site/avatar.jpg' } }。
    return new Promise((resolve, reject) => {
      try {
        if (file_or_files==null) {
          file_or_files=[];
        } else if (file_or_files!=null && !Array.isArray(file_or_files)) {
          file_or_files = [file_or_files];
        };
        if (file_or_files?.length > 1) {
          file_or_files = [file_or_files[0]];
        };
        const fileWrap = file_or_files[0];
        // console.log('fileWrap\n', fileWrap);
        // console.log('fileWrap\n', JSON.stringify(fileWrap, null, 2));

        const file = fileWrap?.raw;
        if (file==null) {throw "file is null."};
        const fileReader = new FileReader();

        fileReader.onload = (event) => {
          // console.log('fileReader onload');
          // console.log(fileReader.result);
          resolve({
            status: 'success',
            event: event,
            response: {
              url: "https://tdesign.gtimg.com/site/avatar.jpg",
              textContent: fileReader.result,
            },
          });
        };

        fileReader.onerror = (event) => {
          console.log('fileReader onerror');
          reject({
            status: 'fail',
            error: '加载失败: fileReader onerror',
            event: event,
            response: {
              url: "https://tdesign.gtimg.com/site/avatar.jpg",
            },
          });
        };

        fileReader.onabort = (event) => {
          console.log('fileReader onabort');
          reject({
            status: 'fail',
            error: '加载失败: fileReader onabort',
            event: event,
            response: {
              url: "https://tdesign.gtimg.com/site/avatar.jpg",
            },
          });
        };

        fileReader.readAsText(file);

      } catch(err) {
        reject({
          status: 'fail',
          error: `加载失败: ${err}`,
          err: err,
          response: {
            url: "https://tdesign.gtimg.com/site/avatar.jpg",
          },
        });
      };
    });
  };

  const formatResponse = (res) => {
    // 响应结果添加加载时间字段，用于 UI 显示
    res.uploadTime = getCurrentDate();
    console.log('res\n', res);
    return res;
  };
  const onFail = (context) => {
    console.log('uploadFailContext\n', context);
    MessagePlugin.error('加载失败: 请管理员在控制台查看细节');
  };




  const [cached_content, set_cached_content] = useState(null);
  useEffect(async()=>{
    const init_cached_content = await storage?.getItem?.("cached_content") ?? null;
    set_cached_content(init_cached_content);
  }, []);

  const [data_list, set__data_list] = useState([]);
  const [data_idx_control__main_idx, set__data_idx_control__main_idx] = useState(0);
  const [data_idx_control__nlp_idx, set__data_idx_control__nlp_idx] = useState(0);
  const data_item = useMemo(()=>{
    return data_list?.[data_idx_control__main_idx??0]
  }, [data_list, data_idx_control__main_idx]);
  const nlp_data = useMemo(()=>{
    return (data_item?.nlp_outputs??[])[data_idx_control__nlp_idx];
  }, [data_item?.nlp_outputs, data_idx_control__nlp_idx]);

  const nlp_item_num = useMemo(()=>{
    return Lodash.sum(data_list.map(it=>(it?.nlp_outputs?.length??0)));
  }, [data_list]);

  const total_char_num = useMemo(()=>{
    return Lodash.sum(
      data_list.map(
        it=>Lodash.sum((it?.nlp_outputs??[]).map(iq=>iq?.text?.length??0))
      )
    );
  }, [data_list]);

  const pro = async(context, json_content) => {
    const already_processed = json_content?.[0]?.nlp_outputs!=null;
    const ok_content = already_processed ? json_content : [{nlp_outputs: json_content.map((it, idx)=>({
      _idx: idx,
      text: (it?.sent??[]).join(""),
      ...it,
    }))}];
    set__data_list(ok_content);
    const all_fidxes = Lodash.uniq(json_content.map(it=>it?.fidx)).filter(it=>it!=null);
    const new_file_info = {
      name: context?.file?.name,
      fidx: all_fidxes.length==1 ? all_fidxes[0] : undefined,
    };
    set__current_file_info(new_file_info);

    // await proTags(json_content);
  };

  const onSuccess = async(context) => {
    const textContent = context?.response?.textContent;
    if (!textContent?.length) {
      MessagePlugin.error('加载失败: 没有文本内容');
      return;
    };
    let jsonContent;

    try {
      jsonContent = JSON.parse(textContent);
      if (!Array.isArray(jsonContent)) {
        // TODO
        // jsonContent = [jsonContent];
      };
      await pro(context, jsonContent);

      MessagePlugin.success('加载成功 (json)');
      return;
    } catch (json_error) {
      console.log(json_error);
      try {
        jsonContent = textContent.split("\n").filter(it=>it.length).map(it=>JSON.parse(it));
        await pro(context, jsonContent);

        MessagePlugin.success('加载成功 (jsonlines)');
        return;
      } catch (jsonlines_error) {
        MessagePlugin.error('加载失败: 无法解析的 json 或 jsonlines 内容');
        return;
      };
    };
  };


  const FileBlock = ()=>vNode('div', {className: "my-5"}, [
    vNode('h4', {className: "mb-3"}, "文件"),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      false ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "选择文件"),
        vNode(Upload, {
          // className: "mx-auto",
          theme: 'file',  // file | file-flow
          autoUpload: true,
          multiple: false,
          data: { extraData: 123, fileName: 'certificate' },
          draggable: true,
          action: null,
          requestMethod: requestMethod,
          files: files,
          formatResponse: formatResponse,
          onChange: set_files,
          onFail: onFail,
          onSuccess: onSuccess,
        }),
      ],
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      current_file_info?.name==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "文件名"),
        current_file_info.name,
      ],
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      (!data_list?.length) ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "分块数量"),
        data_list.length,
      ],
    // ]),
    // vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      (!nlp_item_num) ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "条目数量"),
        nlp_item_num,
      ],
      (!total_char_num) ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "总字符数"),
        total_char_num,
      ],
    ]),
    vNode('div', {className: "my-1 hstack gap-1"}, [
      (!data_list?.length)&&(cached_content==null) ? null :
      vNode('span', {className: "fw-bold text-muted"}, "缓存操作"),
      (!data_list?.length) ? null :
      vNode(Tooltip, {
        content: "将当前文件内容保存到浏览器缓存中，请注意：会取代缓存中已有的内容",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: async()=>{
          const new_cached_content = {current_file_info: current_file_info, data_list: data_list};
          await storage.setItem("cached_content", new_cached_content).then(()=>{
            set_cached_content(new_cached_content);
            MessagePlugin.success("已保存");
          });
        },
      }, "保存到缓存")),
      cached_content==null ? null :
      vNode(Tooltip, {
        content: "从浏览器缓存中读取内容",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: async()=>{
          set__current_file_info(cached_content?.current_file_info);
          set__data_list(cached_content?.data_list);
          // await proTags(cached_content?.data_list);
          MessagePlugin.success("已读取");
        },
      }, "从缓存读取")),
      cached_content==null ? null :
      vNode(Tooltip, {
        content: "将浏览器缓存中的内容清除",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: async()=>{
          await storage.removeItem("cached_content").then(()=>{
            set_cached_content(null);
            MessagePlugin.warning("已清除");
          });
        },
      }, "清除缓存")),
    ]),
    (!data_list?.length) ? null :
    vNode('div', {className: "my-1 hstack gap-1"}, [
      vNode('span', {className: "fw-bold text-muted"}, "全部导出为"),
      vNode(Tooltip, {
        content: "导出到JSON文件（缩进）",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: ()=>{
          saveIt(data_list, `${(current_file_info?.name??"").replace(/\.[^\.]+$/g, "")}[exported].json`);
          MessagePlugin.success("已导出");
        },
      }, "JSON(缩进)")),
      vNode(Tooltip, {
        content: "导出到JSON文件（无缩进）",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: ()=>{
          saveText(JSON.stringify(data_list), `${(current_file_info?.name??"").replace(/\.[^\.]+$/g, "")}[exported].json`);
          MessagePlugin.success("已导出");
        },
      }, "JSON(紧凑)")),
      vNode(Tooltip, {
        content: "导出到JSON Lines文件（每行一个JSON对象）",
      }, vNode(Button, {
        theme: "default", size: "small", onClick: ()=>{
          saveLines(data_list, `${(current_file_info?.name??"").replace(/\.[^\.]+$/g, "")}[exported].jsonl`);
          MessagePlugin.success("已导出");
        },
      }, "JSON Lines")),
    ]),
  ]);



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

  const MaterialBlock = ()=>vNode('div', {className: "my-5"}, [
    vNode('h4', {className: "mb-3"}, "条目总览"),
    vNode('div', {className: "my-1 hstack gap-1"}, [
      vNode(Button, { theme: "default", size: "small", onClick: ()=>{go_previous_item()}, }, "上一块"),
      vNode(InputNumber, {
        theme: "normal", size: "small", align: "center",
        style: { width: 160, },
        placeholder: null,
        defaultValue: (1+(+data_idx_control__main_idx)),
        value: (1+(+data_idx_control__main_idx)),
        onChange: (nv)=>{go_nth_item(nv-1)},
        label: "第", suffix: `块/共${data_list?.length??0}块`,
      }),
      vNode(Button, { theme: "default", size: "small", onClick: ()=>{go_next_item()}, }, "下一块"),
    ]),
    vNode('div', {className: "my-1 hstack gap-2 flex-wrap"}, [
      data_item?.source_file_name==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "来源文件"),
        vNode('span', {}, data_item.source_file_name),
      ],
      data_item?.sidx==null ? null : [
        vNode('span', {className: "fw-bold text-muted"}, "手工编号"),
        data_item.sidx,
      ],
    ]),



    vNode('div', {
      className: "mt-3 mb-1 hstack gap-2 flex-wrap",
    }, [
      vNode('span', {className: "fw-bold text-muted"}, "各文本片段"),
      vNode('div', {className: "hstack gap-1 flex-wrap border border-secondary rounded p-2 overflow-auto max-vh-50"}, (data_item?.nlp_outputs??[]).map((nlp_item, idx)=>vNode('button', {
        type: "button",
        className: [
          "me-3",
          "btn btn-sm",
          nlp_item?.fav ? (
            idx==data_idx_control__nlp_idx ? "btn-danger" : "btn-outline-danger"
          ) : (
            idx==data_idx_control__nlp_idx ? "btn-primary" : "btn-outline-secondary"
          ),
          "position-relative",
        ].join(" "),
        onClick: ()=>{set__data_idx_control__nlp_idx(idx);},
      }, [
        // nlp_item?.frag_idx==null ? null : vNode('span', {}, `[${nlp_item?.frag_idx}]`),
        vNode('span', {}, `[${idx+1}] `),
        vNode('span', {}, `${nlp_item?.text??"<无内容>"}`),
        !nlp_item?.tags?.length ? null : vNode('span', {
          className: ["position-absolute top-0 start-100 translate-middle", "badge rounded-pill bg-secondary"].join(" "),
          title: `含${nlp_item?.tags?.length}个标签`,
        }, `${nlp_item?.tags?.length}`),
      ]))),
    ]),

  ]);






  return vNode('div', null, [

    vNode("p", {}, [
      vNode("span", {}, "获取数据请访问："),
      vNode("a", {
        href: "https://github.com/gertrude95/Chinese-Parataxis-Graph-Parsing",
        target: "_blank",
      }, "https://github.com/gertrude95/Chinese-Parataxis-Graph-Parsing"),
    ]),

    vNode("p", {}, [
      vNode("span", {}, "本项目代码(github)："),
      vNode("a", {
        href: "https://github.com/gitforziio/parataxis-graph-viewer",
        target: "_blank",
      }, "https://github.com/gitforziio/parataxis-graph-viewer"),
    ]),

    FileBlock(),

    nlp_data==null ? null :
    vNode(DetailBlock, {
      data_list,
      data_idx_control__main_idx,
      data_idx_control__nlp_idx,
    }),

    (!data_list?.length) ? null :
    MaterialBlock(),

    // vNode('div', {className: "my-2"}, [`${JSON.stringify(nlp_data)}`]),
    // vNode('div', {className: "my-2"}, [`${JSON.stringify(data_list)}`]),
  ]);
};

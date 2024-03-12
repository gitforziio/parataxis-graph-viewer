import { createElement as vNode, useState, useMemo } from "../../../vendor/react.js";
import MyViewPanel from "./MyViewPanel.js";
import { Collapse } from "../../../vendor/tdesign.min.js";
const { Panel: CollapsePanel } = Collapse;
import Lodash from "../../../vendor/lodash.mjs.js";

import {
  formatter_All,
} from "../lib/my-vis-data-formatter.mjs.js";

const view_data_to_panel_items = (view_data) => {
  return formatter_All(view_data);
};

export default function MyViewPanelGroup(props) {

  // console.log('MyViewPanelGroup(props):\n', props);

  const panel_items = useMemo(()=>view_data_to_panel_items(props?.data), [props?.data]);
  const primary_panel_list = useMemo(()=>Array.from({length: panel_items?.length??0}, (value, index) => index + 1), [props?.data]);
  const [panel_list, set_panel_list] = useState(primary_panel_list);

  const [temp_panel_list, set_temp_panel_list] = useState(primary_panel_list);
  const [should_use_temp, set_should_use_temp] = useState(false);

  const [last_target_list, set_last_target_list] = useState(primary_panel_list);

  const [last_primary_target_list, set_last_primary_target_list] = useState(primary_panel_list);

  const onExpandAll = () => {
    // console.log(panel_list);
    set_temp_panel_list([...last_primary_target_list]);
    set_should_use_temp(true);
    set_panel_list(primary_panel_list);
  };
  const onUnExpandAll = () => {
    // console.log(panel_list);
    set_temp_panel_list([...last_primary_target_list]);
    set_should_use_temp(true);
    set_panel_list([]);
  };

  return vNode('div', {
    className: "vstack gap-2",
  }, [
    vNode('div', {
      className: "hstack gap-1",
    }, [
      vNode('button', { type: "button", className: [ "btn btn-sm", "btn-light", ].join(" "),
        onClick: onExpandAll,
      }, "展开全部"),
      vNode('button', { type: "button", className: [ "btn btn-sm", "btn-light", ].join(" "),
        onClick: onUnExpandAll,
      }, "折叠全部"),
      vNode('button', { type: "button", className: [ "btn btn-sm", "btn-light", ].join(" "),
        onClick: ()=>{console.log(props?.data);},
      }, "log"),
    ]),
    vNode(Collapse, {
      // defaultValue: primary_panel_list,

      value: panel_list,
      onChange: (target_panel_list)=>{

        console.log(" ");

        set_last_primary_target_list([...target_panel_list]);

        // console.log("should_use_temp:", should_use_temp);
        console.log("panel_list:", panel_list);
        console.log("last_target_list:", last_target_list);
        console.log("temp_panel_list:", temp_panel_list);
        console.log("target_panel_list:", target_panel_list);

        if (
          should_use_temp
          || Lodash.xor(panel_list, last_target_list).length
          || Lodash.xor(temp_panel_list, last_target_list).length
        ) {
          if (should_use_temp) {
            console.log("🚧 should_use_temp");
          };
          if (Lodash.xor(panel_list, last_target_list).length) {
            console.log("⛔️ Lodash.xor(panel_list, last_target_list).length");
          };
          if (Lodash.xor(temp_panel_list, last_target_list).length) {
            console.log("⛔️ Lodash.xor(temp_panel_list, last_target_list).length");
          };

          const add_list = Lodash.difference(target_panel_list, temp_panel_list);
          const remove_list = Lodash.difference(temp_panel_list, target_panel_list);
          const change_list = Lodash.union(add_list, remove_list);

          console.log("add_list:", add_list);
          console.log("remove_list:", remove_list);
          console.log("change_list:", change_list);

          let new_panel_list = panel_list;
          for (const it of change_list) {
            if (new_panel_list.includes(it)) {
              new_panel_list = Lodash.difference(new_panel_list, [it]);
            } else {
              new_panel_list.push(it);
            };
          };
          // console.log("new_panel_list:", new_panel_list);

          set_temp_panel_list([...target_panel_list]);
          target_panel_list = new_panel_list;
        } else {
          set_temp_panel_list([...target_panel_list]);
        };

        console.log("final target_panel_list:", target_panel_list);
        set_panel_list([...target_panel_list]);
        set_last_target_list([...target_panel_list]);
        set_should_use_temp(false);
      },

      // defaultExpandAll: true,
      expandOnRowClick: false,
    }, panel_items.map((wrap, idx)=>vNode(CollapsePanel, {
      value: idx+1,
      header: `[${idx+1}] ${wrap.header}`,
      key: idx,
      headerRightContent: wrap?.ref_info==null ? null : vNode('a', {
        className: ["fw-normal", "text-decoration-none", "text-muted"].join(" "),
        target: "_blank",
        href: wrap?.ref_info?.link ?? wrap?.ref_info?.href ?? `https://cn.bing.com/search?q=${wrap?.ref_info?.text ?? wrap.header}`,
      }, wrap?.ref_info?.text ?? "参考"),
    }, wrap.items.map(it=>vNode('div', {
      key: it.key,
    }, vNode(MyViewPanel, {
      data: it.data,
      sourceData: it.sourceData,
      elementId: it.elementId,
    })))))),
  ]);
};

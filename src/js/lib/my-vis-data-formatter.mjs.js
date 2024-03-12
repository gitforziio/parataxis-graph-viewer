import Lodash from "../../../vendor/lodash.mjs.js";

function functionLoader(funcString) {
  return new Function(`return (${funcString})`)();
};

export function formatter_AMR_HanLP(it) {
  const that = {
    input: it.input,
    spans: [],
    nodes: [],
    edges: it.edges,
    tops: it.tops,
  };
  for (const node of it.nodes) {
    const deno = {
      idx: node.id,
      label: node.label,
      anchors: [],
    };
    for (const frag of node.anchors) {
      const span = {
        idx: that.spans.length,
        range: [frag.from, frag.to],
      };
      that.spans.push(span);
      deno.anchors.push(span.idx);
    };
    that.nodes.push(deno);
  };
  return that;
};

export function formatter_Con_HanLP(it) {
  const process_tree = (tree, node_list=[], arc_list=[], spans=[], text_wrap={text:""}, parent={})=>{
    const label_or_text = tree[0];
    const children = tree?.[1]??[];

    const type = children?.length ? "label" : "text";

    const this_node = {
      idx: null,
    };
    this_node[type] = label_or_text;
    if (type!="text") {
      this_node.idx = node_list.length;
      node_list.push(this_node);
    } else {
      this_node.type = type;
      this_node.span = {
        idx: spans.length,
        range: [text_wrap.text.length, text_wrap.text.length+label_or_text.length],
        text: label_or_text,
      };
      spans.push(this_node.span);
      text_wrap.text = `${text_wrap.text}${label_or_text}`;
    };

    if (children?.length) {
      children.forEach((child,ii)=>{
        const dog = process_tree(child, node_list, arc_list, spans, text_wrap, this_node);
        if (dog?.self?.type=="text") {
          this_node.text = dog.self.text;
          this_node.anchors = [dog.self.span.idx];
        } else {
          arc_list.push({
            source: this_node.idx,
            target: dog.self.idx,
          });
        };
      });
    };
    return {
      self: this_node,
      nodes: node_list,
      arcs: arc_list,
      spans,
      text: text_wrap.text,
    };
  };
  const baba = process_tree(it);
  baba.self.is_root=true;
  const that = {nodes: baba.nodes, arcs: baba.arcs, spans: baba.spans, text: baba.text};
  return that;
};

export function formatter_Con_Stanza(it) {
  const process_tree = (tree, node_list=[], arc_list=[], spans=[], text_wrap={text:""}, parent={})=>{

    if (typeof(tree)==="string") {
      tree = [tree];
    };

    const label_or_text = tree[0];
    const children = tree?.[1]??[];

    const type = children?.length ? "label" : "text";

    const this_node = {
      idx: null,
    };
    this_node[type] = label_or_text;
    if (type!="text") {
      this_node.idx = node_list.length;
      node_list.push(this_node);
    } else {
      this_node.type = type;
      this_node.span = {
        idx: spans.length,
        range: [text_wrap.text.length, text_wrap.text.length+label_or_text.length],
        text: label_or_text,
      };
      spans.push(this_node.span);
      text_wrap.text = `${text_wrap.text}${label_or_text}`;
    };

    if (children?.length) {
      children.forEach((child,ii)=>{
        const dog = process_tree(child, node_list, arc_list, spans, text_wrap, this_node);
        if (dog?.self?.type=="text") {
          this_node.text = dog.self.text;
          this_node.anchors = [dog.self.span.idx];
        } else {
          arc_list.push({
            source: this_node.idx,
            target: dog.self.idx,
          });
        };
      });
    };

    return {
      self: this_node,
      nodes: node_list,
      arcs: arc_list,
      spans,
      text: text_wrap.text,
    };
  };
  const baba = process_tree(it);
  baba.self.is_root=true;
  const that = {nodes: baba.nodes, arcs: baba.arcs, spans: baba.spans, text: baba.text};
  return that;
};

function __make_new_list(list) {
  const new_list = list.map(it=>{
    const spans = [];
    let last_slot = 0;
    for (let ii in it) {
      const new_slot = last_slot+it[ii][0].length;
      spans.push({
        id: ii,
        range: [last_slot, new_slot],
        text: it[ii][0],
        label: it[ii][3],
        anchors: [ii],
        is_root: it[ii][1]==0?true:undefined,
        source: it[ii][1]-1>=0?it[ii][1]-1:undefined,
        target: ii,
        edge: it[ii][2],
      });
      last_slot = new_slot;
    };
    const dict = {
      tokens: spans,
    };
    return dict;
  });
  return new_list;
};

export function formatter_Dep_HanLP(item, idx, wrap, standard="UD") {
  const nlp = wrap.by_hanlp;
  const list = [];
  for (const sentence_idx in nlp.tok) {
    const cws = nlp.tok[sentence_idx];
    // const poses = nlp.pos[sentence_idx];
    const heads = nlp[`dep/${standard}`][sentence_idx].map(it=>it[0]);
    const labels = nlp[`dep/${standard}`][sentence_idx].map(it=>it[1]);
    list.push(Lodash.zip(cws, heads, labels));
  };
  // console.log(list);
  const new_list = __make_new_list(list);
  // console.log(new_list[idx]);
  return new_list[idx];
};

export function formatter_Dep_LTP(item, idx, wrap, label="dep") {
  const nlp = wrap.by_ltp;
  const list = [];
  for (const sentence_idx in nlp.cws) {
    const cws = nlp.cws[sentence_idx];
    const poses = nlp.pos[sentence_idx];
    const heads = nlp[label][sentence_idx].head;
    const labels = nlp[label][sentence_idx].label;
    list.push(Lodash.zip(cws, heads, labels, poses));
  };
  // console.log(list);
  const new_list = __make_new_list(list);
  // console.log(new_list[idx]);
  return new_list[idx];
};

export function formatter_Dep_FastHan(item, idx, wrap) {
  const nlp = wrap.by_fasthan;
  const list = nlp.parse;
  // console.log(list);
  const new_list = __make_new_list(list);
  // console.log(new_list[idx]);
  return new_list[idx];
};



// export function normalize_Seg_LTP(wrap) {
//   const nlp = wrap.by_ltp;
//   return nlp?.cws ?? [];
// };
// export function normalize_Seg_HanLP(wrap) {
//   const nlp = wrap.by_hanlp;
//   return nlp?.tok ?? [];
// };
export function normalize_Seg_FastHan(wrap) {
  const nlp = wrap.by_fasthan;
  return (nlp?.cws ?? []).map(list=>list.map(it=>[it]));
};

export function normalize_POS_FastHan(wrap) {
  const nlp = wrap.by_fasthan;
  return nlp?.pos ?? [];
};
export function normalize_POS_JieBa(wrap) {
  return wrap?.by_jieba==null ? [] : [wrap.by_jieba];
};
export function normalize_POS_PKUSeg(wrap) {
  return wrap?.by_pkuseg==null ? [] : [wrap.by_pkuseg];
};

export function normalize_POS_Stanza(wrap, standard="u") {
  // u  x
  const nlp = wrap.by_stanza;
  if (nlp?.tokens?.[0]?.[0]?.[`${standard}pos`]==null) {return []};
  return nlp.tokens.map(token_list=>token_list.map(token=>[token.text, token[`${standard}pos`]]));
};
export function normalize_POS_HanLP(wrap, standard="CTB") {
  // CTB  PKU  863
  const nlp = wrap.by_hanlp;
  if (nlp?.[`pos/${standard}`]==null) {return []};
  const token_lists = nlp?.tok ?? [];
  const result = [];
  for (const list_idx in token_lists) {
    const token_list = token_lists[list_idx];
    const pos_list = nlp[`pos/${standard}`]?.[list_idx]??[];
    const posed_list = Lodash.zip(token_list, pos_list);
    result.push(posed_list);
  };
  return result;
};
export function normalize_POS_LTP(wrap) {
  const nlp = wrap.by_ltp;
  if (nlp?.[`pos`]==null) {return []};
  const word_lists = nlp?.cws ?? [];
  const result = [];
  for (const list_idx in word_lists) {
    const word_list = word_lists[list_idx];
    const pos_list = nlp[`pos`]?.[list_idx]??[];
    const posed_list = Lodash.zip(word_list, pos_list);
    result.push(posed_list);
  };
  return result;
};


const ref_info_dict = {
  'amr': {
    link: "https://github.com/amrisi/amr-guidelines/blob/master/amr.md",
  },
  'hanlp-con': {
    link: "https://hanlp.hankcs.com/docs/annotations/constituency/index.html",
  },
  'stanza-con': {
    link: "https://stanfordnlp.github.io/stanza/constituency.html",
  },
  'hanlp-dep-pmt': {
    link: "https://hanlp.hankcs.com/docs/annotations/dep/pmt.html",
  },
  'hanlp-dep-sd': {
    link: "https://hanlp.hankcs.com/docs/annotations/dep/index.html",
  },
  'hanlp-dep-ud': {
    link: "https://hanlp.hankcs.com/docs/annotations/dep/ud.html",
  },
  'fasthan-dep': {
    link: "https://github.com/fastnlp/fastHan/blob/master/README.md?plain=1#L167",
  },
  'ltp-dep': {
    link: "http://ltp.ai/docs/appendix.html#id5",
  },
  'ltp-sdp': {
    link: "http://ltp.ai/docs/appendix.html#id6",
  },
  'fasthan-cws': {
    link: "https://github.com/fastnlp/fastHan/blob/master/README.md?plain=1#L139",
  },
  'fasthan-pos': {
    link: "https://github.com/fastnlp/fastHan/blob/master/README.md?plain=1#L167",
  },
  'jieba-pos': {
    link: "https://github.com/fxsjy/jieba/blob/master/README.md?plain=1#L195",
  },
  'pkuseg-pos': {
    link: "https://github.com/lancopku/pkuseg-python/blob/master/tags.txt",
  },
  'ltp-pos': {
    link: "http://ltp.ai/docs/appendix.html#id2",
  },
  'hanlp-pos-ctb': {
    link: "https://hanlp.hankcs.com/docs/annotations/pos/ctb.html",
    other_links: [
      "https://blog.csdn.net/qq_19472829/article/details/105656597",
      "https://www.jianshu.com/p/ae3bf4bc62f4",
    ],
  },
  'hanlp-pos-pku': {
    link: "https://hanlp.hankcs.com/docs/annotations/pos/pku.html",
  },
  'hanlp-pos-863': {
    link: "https://hanlp.hankcs.com/docs/annotations/pos/863.html",
  },
  'stanza-pos-u': {
    link: "https://universaldependencies.org/u/pos/",
  },
  'stanza-pos-x': {
    link: "https://stanfordnlp.github.io/stanza/pos.html#description",
  },
};


export function normalize_All(view_data) {
  const list_ = [];
  const step = (data, byWho, tag, list, header, normalize_fn, ref_info) => {
    if (data?.[byWho]?.[tag] != null) {
      list.push({
        header: header,
        items: normalize_fn(data),
        ref_info: ref_info ?? null,
      });
    };
  };

  step(view_data, 'by_fasthan', 'cws', list_, 'FastHan(CWS)', normalize_Seg_FastHan, ref_info_dict['fasthan-cws']);
  step(view_data, 'by_fasthan', 'pos', list_, 'FastHan', normalize_POS_FastHan, ref_info_dict['fasthan-pos']);
  step(view_data, 'by_jieba', 0, list_, 'JieBa', normalize_POS_JieBa, ref_info_dict['jieba-pos']);
  step(view_data, 'by_pkuseg', 0, list_, 'PKU-Seg', normalize_POS_PKUSeg, ref_info_dict['pkuseg-pos']);
  step(view_data, 'by_ltp', 'cws', list_, 'LTP', normalize_POS_LTP, ref_info_dict['ltp-pos']);
  step(view_data, 'by_stanza', 'tokens', list_, 'Stanza(UD)', wrap=>normalize_POS_Stanza(wrap, "u"), ref_info_dict['stanza-pos-u']);
  step(view_data, 'by_stanza', 'tokens', list_, 'Stanza(CTB[XPOS])', wrap=>normalize_POS_Stanza(wrap, "x"), ref_info_dict['stanza-pos-x']);
  step(view_data, 'by_hanlp', 'pos/CTB', list_, 'HanLP(CTB)', wrap=>normalize_POS_HanLP(wrap, "CTB"), ref_info_dict['hanlp-pos-ctb']);
  step(view_data, 'by_hanlp', 'pos/PKU', list_, 'HanLP(PKU)', wrap=>normalize_POS_HanLP(wrap, "PKU"), ref_info_dict['hanlp-pos-pku']);
  step(view_data, 'by_hanlp', 'pos/863', list_, 'HanLP(863)', wrap=>normalize_POS_HanLP(wrap, "863"), ref_info_dict['hanlp-pos-863']);

  return list_;
};


export function formatter_List(it) {
  const group_pairs = Lodash.toPairs(Lodash.groupBy(it.items, "_l"));
  const that = {...it};
  that.items = undefined;
  for (const pair of group_pairs) {
    if (that[pair[0]]==null) {that[pair[0]]=[]};
    pair[1].map(xx=>xx._i).forEach(xx=>that[pair[0]].push(xx));
  };
  return that;
};

export function formatter_All(view_data) {
  const list_ = [];

  if (view_data?.by_list != null) {
    list_.push({
      header: "",
      items: [{
        key: `diagram-by_list-0`,
        data: formatter_List(view_data?.by_list),
        sourceData: view_data?.by_list,
        elementId: `diagram-by_list-0`,
      }],
    });
  };

  if (view_data?.by_standard != null) {
    list_.push({
      header: "",
      items: [{
        key: `diagram-by_standard-0`,
        data: view_data?.by_standard,
        sourceData: view_data?.by_standard,
        elementId: `diagram-by_standard-0`,
      }],
    });
  };

  const step = (data, byWho, tag, list, header, formatter_fn, ref_info) => {
    if (data?.[byWho]?.[tag] != null) {
      list.push({
        header: header,
        items: data[byWho][tag].map((detail_item, detail_idx)=>({
          key: `diagram-${byWho}-${tag.split("/").join("-")}-${detail_idx}`,
          data: formatter_fn(detail_item, detail_idx, data),
          sourceData: detail_item,
          elementId: `diagram-${byWho}-${tag.split("/").join("-")}-${detail_idx}`,
        })),
        ref_info: ref_info ?? null,
      });
    };
  };

  step(view_data, 'by_hanlp', 'amr', list_, 'AMR by HanLP', formatter_AMR_HanLP, ref_info_dict['amr']);

  step(view_data, 'by_hanlp', 'con/full', list_, 'Con.(CTB full) by HanLP', formatter_Con_HanLP, ref_info_dict['hanlp-con']);
  step(view_data, 'by_hanlp', 'con/major', list_, 'Con.(CTB major) by HanLP', formatter_Con_HanLP, ref_info_dict['hanlp-con']);
  step(view_data, 'by_stanza', 'con', list_, 'Con. by Stanza', formatter_Con_Stanza, ref_info_dict['stanza-con']);

  step(view_data, 'by_hanlp', 'dep/PMT', list_, 'Dep.(PMT) by HanLP', (it, idx, da)=>formatter_Dep_HanLP(it, idx, da, "PMT"), ref_info_dict['hanlp-dep-pmt']);
  step(view_data, 'by_hanlp', 'dep/SD', list_, 'Dep.(SD) by HanLP', (it, idx, da)=>formatter_Dep_HanLP(it, idx, da, "SD"), ref_info_dict['hanlp-dep-sd']);
  step(view_data, 'by_hanlp', 'dep/UD', list_, 'Dep.(UD) by HanLP', (it, idx, da)=>formatter_Dep_HanLP(it, idx, da, "UD"), ref_info_dict['hanlp-dep-ud']);
  step(view_data, 'by_fasthan', 'parse', list_, 'Dep.(CTB9) by FastHan', formatter_Dep_FastHan, ref_info_dict['fasthan-dep']);
  step(view_data, 'by_ltp', 'dep', list_, 'Dep. by LTP', (it, idx, da)=>formatter_Dep_LTP(it, idx, da, "dep"), ref_info_dict['ltp-dep']);
  step(view_data, 'by_ltp', 'sdp', list_, 's.d.p. by LTP', (it, idx, da)=>formatter_Dep_LTP(it, idx, da, "sdp"), ref_info_dict['ltp-sdp']);

  return list_;
};

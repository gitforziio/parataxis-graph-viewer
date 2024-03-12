

// https://github.com/d3/d3/blob/main/API.md
// https://github.com/d3/d3-selection/blob/v3.0.0/README.md
// https://github.com/d3/d3-force/blob/v3.0.0/README.md
// https://observablehq.com/@d3/simulation-tick?collection=@d3/d3-force
// https://github.com/d3/d3-shape/blob/v3.1.0/README.md#curveCatmullRom

// https://developer.mozilla.org/zh-CN/docs/Web/SVG/Element
// https://developer.mozilla.org/zh-CN/docs/Web/API/SVGGraphicsElement/getBBox

// https://www.bing.com/search?form=MOZLBR&pc=MOZI&q=js%E5%88%A4%E6%96%AD%E5%8D%8A%E8%A7%92%E6%88%96%E5%85%A8%E8%A7%92

// https://github.com/spyysalo/conllu.js/blob/master/conllu.js#L187
// https://universaldependencies.org/conllu_viewer.html
// http://brat.nlplab.org/features.html
// http://brat.nlplab.org/embed.html#live
// http://www.nactem.ac.uk/brat/#/GENIA-Metaknowledge/10023774

// 图布局算法之Stress Majorization
// https://zhuanlan.zhihu.com/p/317840611


import D3 from '../../../vendor/d3.js';

const console_log = (...args) => {
  if (false) {console.log(...args);};
};

const Math_sum = (...args) => {return args.reduce((ss, nn)=>((+ss)+(+nn)), 0);};
const Math_avg = (...args) => {return Math_sum(...args)/args?.length;};

const Lo_intersection = (list1, list2) => {return list2.filter(it=>list1.indexOf(it)>-1);};

const dictBy = (collection, key) => {
  const keyTypeFnMap = {
    "string": (it, key)=>it?.[key],
    "function": (it, key)=>key(it),
  };
  const keyTypeFn = keyTypeFnMap[typeof key];
  const dict = {};
  collection.forEach(it=>{
    dict[keyTypeFn(it, key)] = it;
  });
  return dict;
};



const MyPGVis = class MyPGVis {
  static d3 = D3;
  static D3 = D3;

  static configSelection = function (selection, config={}) {
    const fns = ["classed", "attr", "style"];
    for (const key of Object.keys(config)) {
      const value = config[key];
      let args = [];
      if (Array.isArray(value)) {args = value;};
      if (Object.prototype.toString.call(value) === '[object Object]') {
        args = Object.entries(value);
      };
      if (fns.includes(key)) {
        for (const arg of args) {
          selection?.[key]?.(...arg);
        };
      };
    };
    return selection;
  }

  static getRelatedThings = function (vis, datum) {
    const things = {
      self: datum,
      span_links: vis?.forced_nodes_and_links?.span_unit_links?.filter?.(it=>it?.target==datum),
      child_unit_links: vis?.forced_nodes_and_links?.unit_unit_links?.filter?.(it=>it?.source==datum),
      parent_unit_links: vis?.forced_nodes_and_links?.unit_unit_links?.filter?.(it=>it?.target==datum),
    };
    things.spans = things.span_links.map(it=>it?.source).filter(it=>it!=null);
    things.child_units = things.child_unit_links.map(it=>it?.target).filter(it=>it!=null);
    things.parent_units = things.parent_unit_links.map(it=>it?.source).filter(it=>it!=null);

    for (const child_unit of things.child_units) {
      const child_things = MyPGVis.getRelatedThings(vis, child_unit);
      for (const key of [
        "span_links", "child_unit_links",
        "spans", "child_units",
      ]) {
        for (const item of child_things[key]) {
          if (!things[key].includes(item)) {
            things[key].push(item);
          };
        };
      };
    };
    things.chars = things.spans.map(
      it=>it.indices.map(
        xx=>vis?.things?.charDict?.[xx]
      ).filter(
        xx=>xx!=null
      )
    ).flat();

    return things;

    // span_links.forEach(it=>{
    //   it.selected.dispatch("involved", {
    //     bubbles: true,
    //     cancelable: true,
    //     detail: {
    //       type: "involved",
    //       datum: it,
    //     },
    //   });
    // });
  }

  static VisElement = class VisElement {
    constructor(seed) {
      this.__seed__ = seed;
      Object.assign(this, seed);
      this.__selection__ = null;
      this.__docNode__ = null;
    };
    toJSON() {
      return this.__seed__;
    }
    toString() {
      return `<VisElement ${this?.__seed__?.toString?.()}>` ?? "<VisElement>";
    }
    selection(...args) {
      if (!!args[0]) {
        this.__selection__ = args[0];
        this.__docNode__ = this.__selection__.node();
      };
      return this.__selection__;
    }
    get selected() {return this.selection();}
    docNode(...args) {
      if (!!args[0]) {
        this.__docNode__ = args[0];
        this.__selection__ = MyPGVis.D3.select(this.__docNode__);
      };
      return this.__docNode__;
    }
    getBBox() {
      return this?.__docNode__?.getBBox?.();
    }
    get bBox() {return this.getBBox();}
    get box() {return this.getBBox();}
    get boxWidth() {return this.bBox?.width;}
    get boxHeigth() {return this.bBox?.height;}
    jointPoint(key=null) {
      const box = this.bBox;
      const fn_map = {
        center: () => ({
          x: box?.x + box?.width/2,
          y: box?.y + box?.height/2,
        }),
        top: () => ({
          x: box?.x + box?.width/2,
          y: box?.y,
        }),
        right: () => ({
          x: box?.x + box?.width,
          y: box?.y + box?.height/2,
        }),
        bottom: () => ({
          x: box?.x + box?.width/2,
          y: box?.y + box?.height,
        }),
        left: () => ({
          x: box?.x,
          y: box?.y + box?.height/2,
        }),
        topLeft: () => ({
          x: box?.x,
          y: box?.y,
        }),
        topRight: () => ({
          x: box?.x + box?.width,
          y: box?.y,
        }),
        bottomRigth: () => ({
          x: box?.x + box?.width,
          y: box?.y + box?.height,
        }),
        bottomLeft: () => ({
          x: box?.x,
          y: box?.y + box?.height,
        }),
      };
      return fn_map?.[key]?.() ?? fn_map["center"]();
    }
    jP(...args) {return this.jointPoint(...args);}
    get jointPoints() {
      const box = this.bBox;
      return {
        center: {
          x: box?.x + box?.width/2,
          y: box?.y + box?.height/2,
        },
        top: {
          x: box?.x + box?.width/2,
          y: box?.y,
        },
        right: {
          x: box?.x + box?.width,
          y: box?.y + box?.height/2,
        },
        bottom: {
          x: box?.x + box?.width/2,
          y: box?.y + box?.height,
        },
        left: {
          x: box?.x,
          y: box?.y + box?.height/2,
        },
        topLeft: {
          x: box?.x,
          y: box?.y,
        },
        topRight: {
          x: box?.x + box?.width,
          y: box?.y,
        },
        bottomRigth: {
          x: box?.x + box?.width,
          y: box?.y + box?.height,
        },
        bottomLeft: {
          x: box?.x,
          y: box?.y + box?.height,
        },
      };
    }
    get jPs() {return this.jointPoints;}
  }






  constructor(wrap) {
    this.config = {

      svgStyle: wrap?.config?.svgStyle ?? [
        `g.d3vis-chart-root[data-involving] :is(text:not(.chunk-text), rect, circle) {
          opacity: 0.5;
        }`,
        `g.d3vis-chart-root[data-involving] [data-involved="true"] :is(text:not(.chunk-text), rect, circle) {
          opacity: 1;
        }
        g.d3vis-chart-root[data-involving] [data-involved="true"] :is(text:not(.chunk-text), rect, circle) {
          opacity: 1;
        }
        g.d3vis-chart-root[data-involving] :is(text:not(.chunk-text), rect, circle)[data-involved="true"] {
          opacity: 1;
        }`,
        `g.d3vis-chart-root[data-involving] :is(.chunk-text tspan) {
          fill-opacity: 0.5;
          stroke-opacity: 0.5;
        }`,
        `g.d3vis-chart-root[data-involving] [data-involved="true"] :is(.chunk-text tspan) {
          fill-opacity: 1;
          stroke-opacity: 1;
        }
        g.d3vis-chart-root[data-involving] [data-involved="true"] :is(.chunk-text tspan) {
          fill-opacity: 1;
          stroke-opacity: 1;
        }
        g.d3vis-chart-root[data-involving] :is(.chunk-text tspan)[data-involved="true"] {
          fill-opacity: 1;
          stroke-opacity: 1;
        }`,
        `g.arc-span-unit-wrap path {
          opacity: 0.25;
          stroke-width: 1;
          stroke-dasharray: 2 2;
          transition: opacity 0.8s, stroke-width 0.8s;
        }`,
        `g.arc-span-unit-wrap path:hover {
          opacity: 1;
          stroke-width: 3;
        }`,
        `g.arc-span-unit-wrap[data-involved="true"] path {
          opacity: 1;
          stroke-width: 3;
          stroke-dasharray: 6 4;
        }`,
      ].join("\n").replace(/[\s\t]+/g, " "),

      alphaTarget: wrap?.config?.alphaTarget ?? 0,
      dragAlphaTarget: wrap?.config?.dragAlphaTarget ?? 0.05,  // 0.2  0.05
      alphaDecay: wrap?.config?.alphaDecay ?? 0.1,
      velocityDecay: wrap?.config?.velocityDecay ?? 0.3,

      resizeAtEnd: wrap?.config?.resizeAtEnd ?? false,
      resizeAtEndState: false,

      realTimeResize: wrap?.config?.realTimeResize ?? false,
      realTimeResizeState: false,
      // TODO: 改名
      // realTimeResize 控制的东西很有限 不过现在一两句话说不清

      level_height: wrap?.config?.level_height ?? 100,
      base_height: wrap?.config?.base_height ?? 70,

      width:     wrap?.config?.width ?? 400,
      height:    wrap?.config?.height ?? 240,

      window:    wrap?.config?.window ?? null,
      document:  wrap?.config?.document ?? null,
      elementId: wrap?.config?.elementId ?? "diagram",

      padding: {
        top:    wrap?.config?.padding?.top ?? 20,
        right:  wrap?.config?.padding?.right ?? 20,
        bottom: wrap?.config?.padding?.bottom ?? 20,
        left:   wrap?.config?.padding?.left ?? 20,
      },

      unit_width:          wrap?.config?.unit_width ?? 14,
      unit_spacing:        wrap?.config?.unit_spacing ?? 2,
      unit_rx:             wrap?.config?.unit_rx ?? 2,
      unit_default_fill:   wrap?.config?.unit_default_fill ?? "#fafafa",
      unit_default_stroke: wrap?.config?.unit_default_stroke ?? "#eee",

      text_size:           wrap?.config?.text_size ?? "10px",

      default_bg_fill:     wrap?.config?.default_bg_fill ?? "#eee",

      default_format: {
        splitter: wrap?.config?.default_format?.splitter ?? " ",
      },

    };
    this.config_unit_step = this.config.unit_width + this.config.unit_spacing;
    this.data = wrap?.data ?? {};
  }

  async clean() {
    const elementId = this.config.elementId;
    d3.select(`#${elementId}`).selectAll(`svg`).remove();
  }

  clearInvolve() {
    this?.svg_g_root.attr("data-involving", null);
    this?.things?.chars?.forEach?.(it=>{it.selected.attr("data-involved", null);});
    for (const set of ["chunk_nodes", "span_nodes", "unit_nodes", "span_unit_links", "unit_unit_links"]) {
      for (const it of (this?.forced_nodes_and_links?.[set]??[])) {
        it.selected.attr("data-involved", null);
      };
    };
  }
  involveUnit(datum) {
    this?.clearInvolve();
    this?.svg_g_root.attr("data-involving", true);

    const relatedThings = MyPGVis.getRelatedThings?.(this, datum);
    for (const set of ["chars", "spans", "child_units", "span_links", "child_unit_links"]) {
      for (const it of (relatedThings?.[set]??[])) {
        it.selected.attr("data-involved", true);
        // it.state_involved = true;
      };
    };
    datum.selected.attr("data-involved", true);
  }

  async init(realTimeResize=false) {
    const cfgSlct = MyPGVis.configSelection;
    const d3 = MyPGVis.D3;
    const text = this?.data?.text??"";
    const chars = text.split("");
    const the_len = chars.length;
    const the_hit = 1;
    const config = this.config;
    const config_unit_step = this.config_unit_step;
    // ['T9_11', '测试', [[9, 11]]]

    const elementId = this.config.elementId;

    this.viewBox = {
      // xx: -config.width/2,
      // yy: -config.height/2,
      xx: - 20,
      yy: - config.height + 20,
      ww: config.width,
      hh: config.height,
    };
    const viewBox = this.viewBox;

    this.svg = d3.create("svg")
      .attr("baseProfile", "full")
      .attr("xmlns", "http://www.w3.org/2000/svg")
      .attr("version", "1.1")
      .classed("svg-vis", true)
      .attr("viewBox", [viewBox.xx, viewBox.yy, viewBox.ww, viewBox.hh])
      .attr("width", viewBox.ww)
      .attr("height", viewBox.hh)
      .style("font-size", config.text_size)
      // .attr("width", `${the_len * config_unit_step + config.unit_spacing + config.margin.left + config.margin.right}`)
      // .attr("height", `${the_hit * config_unit_step + config.unit_spacing + config.margin.top + config.margin.bottom}`)
    ;
    this.svg_style = this.svg.append("style")
      .text(this?.config?.svgStyle)
    ;

    // Per-type markers, as they don't inherit styles.
    const svg_defs = this.svg.append("defs");

    // <filter id="shadow2">
    //   <feDropShadow dx="0" dy="0" stdDeviation="0.5" flood-color="cyan" />
    // </filter>

    // https://stackoverflow.com/questions/20778568/how-to-make-an-inset-drop-shadow-in-svg

    const shadow_filter = cfgSlct(svg_defs.append("filter"), {
      attr: {
        "id": `svg-filter-shadow`,
      },
    });
    const shadow = cfgSlct(shadow_filter.append("feDropShadow"), {
      attr: {
        dx: 0,
        dy: 2,
        "stdDeviation": "2",
        "flood-color": "yellow",
      },
    });

    const marker1 = cfgSlct(svg_defs.append("marker"), {
      attr: {
        "id": `svg-mark-arrow`,
        "viewBox": "0 -5 10 10",
        "refX": 10-2,
        "refY": -0,
        "markerWidth": 6,
        "markerHeight": 6,
        "orient": "auto",
      },
    });
    cfgSlct(marker1.append("path"), {
      attr: {
        "fill": "transparent",
        "stroke": "black",
        "stroke-width": 2,
        "d": "M0,-5L10,0L0,5",
      },
    });

    const marker2 = cfgSlct(svg_defs.append("marker"), {
      attr: {
        "id": `svg-mark-triangle`,
        "viewBox": "0 -5 10 10",
        "refX": 10-2,
        "refY": -0,
        "markerWidth": 6,
        "markerHeight": 6,
        "orient": "auto",
      },
    });
    cfgSlct(marker2.append("path"), {
      attr: {
        "fill": "black",
        "d": "M0,-5L10,0L0,5",
      },
    });

    const marker3 = cfgSlct(svg_defs.append("marker"), {
      attr: {
        "id": `svg-mark-triangle-start`,
        "viewBox": "0 -5 10 10",
        "refX": 0-2,
        "refY": -0,
        "markerWidth": 6,
        "markerHeight": 6,
        "orient": "auto",
      },
    });
    cfgSlct(marker3.append("path"), {
      attr: {
        "fill": "black",
        "d": "M10,-5L0,0L10,5",
      },
    });

    // this.svg_g_bg = this.svg.append("g")
    //   .attr("class", "d3vis-chart-bg")
    //   .attr("transform", `translate(${config.margin.left}, ${config.margin.top})`)
    //   .attr("fill", `${config.default_bg_fill}`)
    // ;
    this.svg_g_root = this.svg.append("g")
      .attr("class", "d3vis-chart-root")
      // .attr("transform", `translate(${config.margin.left}, ${config.margin.top})`)
    ;

    // 先把图层安排好
    const svg_g_root = this.svg_g_root;
    this.units_g = svg_g_root.append("g").classed("units-group", true);
    this.spans_g = svg_g_root.append("g").classed("spans-group", true);
    this.arcs_g = svg_g_root.append("g").classed("arcs-group", true);
    this.chars_g = svg_g_root.append("g").classed("chars-group", true);
    this.chunks_g = svg_g_root.append("g").classed("chunks-group", true);

    // const curve_drawer = d3.line().curve(d3.curveCatmullRom.alpha(0.125));
    // this.curve_drawer = curve_drawer;

    const 缩放行为的处理函数 = (event)=>{
      const tran = event.transform;
      this.svg_g_root.attr("transform", tran);
    };
    const zoom_behavior = MyPGVis.D3.zoom();
    zoom_behavior.on("zoom", 缩放行为的处理函数);
    zoom_behavior.clickDistance(8);
    this.svg.call(zoom_behavior);
    this.svg.call(zoom_behavior.transform, MyPGVis.D3.zoomIdentity);
    this.zoom = zoom_behavior;

    await d3.select(`#${elementId}`).node().append(this.svg.node());
    this.draw(realTimeResize);

  }  // end init

  // update() {
  //   this.draw();
  // }

  draw(realTimeResize=false) {
    // 告诉浏览器用此函数更新动画
    // requestAnimationFrame( ()=>{this.draw();} );

    const d3 = MyPGVis.D3;
    const text = this?.data?.text??"";
    const chars = text.split("");

    if (!this?.svg) {return;};

    // // 绘制原点
    // this.svg_g_root.selectAll("circle.zero").remove();
    // this.svg_g_root.append("circle").classed("zero", true).attr("cx", 0).attr("cy", 0).attr("r", 1);

    this._makeThings();
    this._drawChars();
    this._drawSpans();
    this._drawUnits();
    this._drawArcs();

    this._makeAndDrawForces(realTimeResize);

    // https://github.com/d3/d3-shape/blob/v3.1.0/README.md#link
    // https://github.com/d3/d3-shape/blob/v3.1.0/README.md#symbol
    // https://blog.logrocket.com/data-visualization-vue-js-d3/

  }

  _makeThings() {
    // console.log("_makeThings");
    const things = {
      chars: [],
      spans: [],
      chunks: [],
      units: [],
    };
    this.things = things;
    this._makeSpans();
    this._makeChars();
    this._makeChunks();
    this._makeUnits();
    this._makeForcedNodesAndLinks();
    // console.log(this.things);
  }

  _makeChars() {
    // console.log("_makeChars");
    const things = this.things;

    const data = this.data;

    const text = data?.text ?? data?.input ?? "";
    const chars = text.split("");

    const tokens = data?.tokens ?? data?.words ?? data?.spans ?? [];
    const splitter = data?.splitter ?? "";

    if (text?.length) {
      chars.forEach((char, idx)=>{
        things.chars.push(new MyPGVis.VisElement({
          type: char==this?.config?.default_format?.splitter ? "splitter" : "char",
          text: char,
          idx: idx,
          od: idx,
        }));
      });
    };

    if (!things.chars.length) {
      // TODO : 这里算法不太对 如果有些 token 是交叉着的 那么这个算法会导致序号错乱
      for (const ii in tokens) {
        const token = tokens[ii];
        const token_text = typeof(token)=="string" ? token : (token?.text ?? token?.word ?? token?.content ?? token?.face ?? "");
        const chars = token_text.split("");

        for (const jj in chars) {
          const char = chars[jj];
          things.chars.push(new MyPGVis.VisElement({
            type: "char",
            text: char,
            idx: things.chars.length,
            od: things.chars.length,
            idx_token: ii,
            idx_in_token: jj,
          }));
        };

        if (ii < tokens.length-1 && splitter?.length) {
          things.chars.push(new MyPGVis.VisElement({
            type: "splitter",
            text: splitter,
            idx: things.chars.length,
            od: things.chars.length,
          }));
        };
      };
    };
    things.charDict = dictBy(things.chars, "idx");
    // console.log(this.things.chars);
    return this.things.chars;
  }

  _makeSpans() {
    // console.log("_makeSpans");
    const things = this.things;
    const data = this.data;

    const indices_num_map = {};
    const spans = data?.spans ?? data?.tokens ?? [];

    for (const idx in spans) {
      const span = spans[idx];
      const range = span?.range?.length==2 ? span.range : span?.sliced?.length==2 ? span.sliced : null;
      if (range==null) {continue;};
      if (range[1] < range[0]) {
        [range[1], range[0]] = range;
      };
      const indices = [];
      for (let ii = range[0]; ii < range[1]; ii++) {
        indices.push(ii);
        if (!(ii in indices_num_map)) {
          indices_num_map[ii] = 0;
        };
        indices_num_map[ii] += 1;
      };
      const max_num = Math.max(...indices.map(index=>indices_num_map[index]));
      things.spans.push(new MyPGVis.VisElement({
        idx: span?.id ?? span?.idx ?? idx,
        od: idx,
        range: range,
        indices: indices,
        level: max_num,
      }));
    };
    things.spanDict = dictBy(things.spans, "idx");
    // console.log(this.things.spans);
    return this.things.spans;
  }

  _makeChunks() {
    // console.log("_makeChunks");
    const things = this.things;
    const data = this.data;
    const intersec = Lo_intersection;
    // -------- -------- -------- -------- -------- -------- --------
    // 把没划出来的那些字符也做出来

    if (!things?.chars?.length) {this._makeChars();};
    if (!things?.spans?.length) {this._makeSpans();};

    const charSpanDict = {};
    things.chars.forEach(char=>{
      charSpanDict[char.idx] = [];
    });
    things.spans.forEach(span=>{
      span.indices.forEach(idx=>{
        charSpanDict[idx].push(span.idx);
      });
    });

    const chunks_draft = [];
    let temp_chunk = [things.chars[0]];
    for (let ii=0; ii<things.chars.length-1; ii++) {
      const char0 = things.chars[ii];
      const char1 = things.chars[ii+1];

      const situation = (+(!!charSpanDict[char0?.idx]?.length))+(+(!!charSpanDict[char1?.idx]?.length));
      ({
        0: ()=>{
          if ((char0?.type=="splitter"&&temp_chunk.length>1)) {
            chunks_draft.push(temp_chunk); temp_chunk = [];
          };
        },
        1: ()=>{
          if (!(char1?.type=="splitter")) {
            chunks_draft.push(temp_chunk); temp_chunk = [];
          };
        },
        2: ()=>{
          if (!(intersec(charSpanDict[char0.idx], charSpanDict[char1.idx])?.length)) {
            chunks_draft.push(temp_chunk); temp_chunk = [];
          };
        },
      })?.[situation]?.();
      temp_chunk.push(char1);
    };
    chunks_draft.push(temp_chunk);
    // console.log(chunks_draft);

    for (const idx in chunks_draft) {
      const chunk = chunks_draft[idx]?.filter?.(it=>it!=null);
      const chunk_ = new MyPGVis.VisElement({
        idx: idx,
        od: idx,
        chars: chunk,
        x: 0,
        y: 0,
      });
      chunk_.chars.forEach(it=>it.chunk = chunk_);
      things.chunks.push(chunk_);
    };

    return this.things.chunks;

    // -------- -------- -------- -------- -------- -------- --------
  }

  _makeUnits() {
    const things = this.things;
    const data = this.data;

    const arcs = (this?.data?.arcs??this?.data?.edges??this?.data?.tokens??[]);

    const tops = data?.tops ?? data?.roots ?? [];
    const top = data?.top ?? data?.root ?? null;
    if (tops.length==0 && (top!=null)) {tops.push(top);};

    const list = data?.units??data?.nodes??data?.tokens??[];

    for (const idx in (list)) {
      const unit = list[idx];
      const unit_idx = unit?.idx ?? unit?.id ?? idx;
      const unit_ = new MyPGVis.VisElement({
        idx: unit_idx,
        od: unit?.od ?? idx,
        has_od: unit?.od!=null,
        level: unit?.level,
        depth: unit?.depth,
        text: unit?.text,
        type: unit?.type,
        label: unit?.label ?? unit?.pos ?? unit?.tag ?? null,
        is_top: unit?.is_top,
        is_root: unit?.is_root,
        ref_spans: unit?.ref_spans ?? unit?.spans ?? unit?.anchors ?? [],
        clue_spans: unit?.clue_spans ?? unit?.clues ?? [],
        details: unit?.details ?? [],
      });
      if (tops?.length&&tops.includes(unit_.idx)) {unit_.is_top = true;};
      things.units.push(unit_);
    };
    things.unitDict = dictBy(things.units, "idx");

    // 计算横向位置
    const rank_dict = {};
    const rank_fn = (it, depth=0)=>{
      console_log(" ");
      console_log(it?.idx);
      // if (depth>2) {
      //   console_log(depth);
      // };

      // 如果没有 spans 属性或者 spans 属性的长度为 0，则将 it 的排名设置为 it.od 或 0
      if (!this.things.spans?.length) {
        const rank = it?.has_od ? (it?.od??0) : 0;
        // 将 it 的编号和排名存储到 rank_dict 字典中
        rank_dict[it.idx] = rank;
        it.rank=rank;
        console_log("od", rank);
        return rank;
      };
      // 如果 rank_dict 字典中已经有了 it 的编号，则直接使用 it 的排名，不再调用 rank_fn 函数
      if (!!rank_dict?.[it.idx]) {
        const rank = rank_dict[it.idx];
        it.rank=rank;
        console_log("rank_dict", rank);
        return rank;
      };

      // 获取 it 的 ref_spans 和 clue_spans 中的所有 span
      const the_spans = [
        ...(it?.ref_spans??[]),
        ...(it?.clue_spans??[]),
      ].map(
        // 根据序号找到具体的 span
        idx=>this.things.spans.find(span=>span.idx==idx)
      ).filter(
        // 确保内容存在 ？
        xxx=>xxx?.indices?.[0]!=null
      );

      // 如果 the_spans 不为空，则计算这些 span 的平均排名，作为 it 的排名
      if (the_spans?.length) {
        console_log(the_spans);
        const rank = Math_avg(...the_spans.map(span=>(span?.indices?.[0])));
        rank_dict[it.idx] = rank;
        it.rank=rank;
        console_log("avg the_spans", rank);
        return rank;
      };

      // 如果 the_spans 为空 说明这玩意儿不对应具体的文本

      // 当 arcs 数组中存在与 it 对应的单元相关的目标单元时，使用这些目标单元的平均排名作为排名。
      // 获取所有指向 it 的单元的编号
      const target_idxes = arcs.filter(arc=>(arc?.source==it.idx||arc?.source?.idx==it.idx)).map(arc=>arc?.target?.idx??arc?.target);
      // 计算这些单元的排名，并将它们的平均值作为 it 的排名
      const target_ranks = target_idxes.map(idx=>{
        // 如果 rank_dict 字典中已经有了某个单元的编号，则直接使用该单元的排名
        if (!!rank_dict?.[idx]) {
          console_log("rank_dict");
          return rank_dict?.[idx];
        };
        // 如果递归太深，则排名为0
        if (depth > 20) {
          console_log("递归太深 0");
          return 0;
        };
        // 否则，调用 rank_fn 函数来计算该单元的排名
        console_log("rank_fn");
        return rank_fn(things.unitDict[idx], (depth+1));
      });
      console_log(target_ranks);
      const rank = Math_avg(...target_ranks);
      console_log("avg target_ranks", rank);
      rank_dict[it.idx] = rank;
      it.rank=rank;
      return rank;
    };
    things.units.forEach(it=>rank_fn(it));

    if (!!things.units.find(it=>it.level!=null)) {
      console_log("找到了预定义的 level");
      return this.things.units;
    };
    // -------- -------- -------- -------- -------- -------- --------
    if (!!things.units.find(it=>it.depth!=null)) {
      console_log("找到了预定义的 depth");
      const depthes = things.units.map(it=>+(it?.depth??0));
      const max_depth = Math.max(...depthes);
      const min_depth = Math.min(...depthes);
      things.units.forEach(unit=>{
        unit.depth = (unit.depth??min_depth) - min_depth + 1;
        // unit.level = max_depth - min_depth - (unit.depth??0) + 1;
        unit.level = (max_depth - min_depth) - (unit.depth-1) + 1;
      });
      return this.things.units;
    };
    // -------- -------- -------- -------- -------- -------- --------

    const depth_dict = {};
    // if (tops.length) {
    //   depth_dict[tops[0]] = 0;
    // } else {
    //   depth_dict[things.units[0]?.idx] = 0;
    // };
    depth_dict[things.units[0]?.idx] = 0;
    const idxes = things.units.map(it=>it.idx);
    const loop = () => {
      // 记录上一次遍历时已经遍历过的节点数量
      const last_keys_len = Object.keys(depth_dict).length;
      for (const idx of idxes) {
        if (idx in depth_dict) {
          // 寻找当前节点的所有子节点
          const target_idxes = arcs.filter(arc=>(arc?.source==idx||arc?.source?.idx==idx)).map(arc=>arc?.target?.idx??arc?.target);
          // 将子节点的深度设置为当前节点深度+1
          target_idxes.forEach(t_idx=>{
            if (!(t_idx in depth_dict)) {
              depth_dict[t_idx] = depth_dict[idx]+1;
            };
          });
          // 寻找当前节点的所有父节点
          const source_idxes = arcs.filter(arc=>(arc?.target==idx||arc?.target?.idx==idx)).map(arc=>arc?.source?.idx??arc?.source);
          // 将父节点的深度设置为当前节点深度-1
          source_idxes.forEach(s_idx=>{
            if (!(s_idx in depth_dict)) {
              depth_dict[s_idx] = depth_dict[idx]-1;
            };
          });
        };
      };

      const current_keys_len = Object.keys(depth_dict).length;  // 记录当前遍历时已经遍历过的节点数量
      const delta_len = (current_keys_len-last_keys_len);  // 计算新增加的 key 的数量
      // console.log(depth_dict);
      // console.log(delta_len);
      if (delta_len>0) {loop();} else {
        // 如果新增加的 key 数量大于 0，说明还有未遍历的单元需要处理，继续递归 loop
        // 否则
        const rest_idxes = idxes.filter(idx=>!(idx in depth_dict));  // 获取所有未处理过的单元的 idx
        if (rest_idxes.length) {
          // 在未处理过的单元中找到一个没有出边，只有入边的单元
          const new_bottom_idx = rest_idxes.find(idx=>{
            const flag1 = arcs.filter(arc=>(arc?.source==idx||arc?.source?.idx==idx)).length<=0;
            const flag2 = arcs.filter(arc=>(arc?.target==idx||arc?.target?.idx==idx)).length>0;
            return flag1&&flag2;
          });
          if (new_bottom_idx!=null) {
            depth_dict[new_bottom_idx] = Math.max(...Object.values(depth_dict));  // 设置它的深度为当前最大深度
            if (isNaN(depth_dict[new_bottom_idx])) {depth_dict[new_bottom_idx]=0;};  // 如果当前最大深度不是数字，说明没有其它单元，那么将它的深度设置为 0
            loop();  // 继续递归 loop
          };
        };
      };
      return delta_len;
    };
    // let gogo = true;
    // while (gogo) {
    //   if (loop()==0) {gogo=false};
    // };
    loop();

    const max_depth = Math.max(...Object.values(depth_dict));
    const min_depth = Math.min(...Object.values(depth_dict));
    things.units.forEach(unit=>{
      unit.depth = (depth_dict[unit?.idx]??min_depth) - min_depth + 1;
      unit.level = (max_depth - min_depth) - (unit.depth-1) + 1;
    });
    return this.things.units;

    // -------- -------- -------- -------- -------- -------- --------
  }

  _makeForcedNodesAndLinks() {
    const SELF = this;
    const chunk_nodes = [];
    const span_nodes = [];
    const unit_nodes = [];
    const span_unit_links = [];
    const unit_unit_links = [];
    for (const chunk of this.things.chunks) {
      chunk.node_type = "chunk";
      chunk.key = `chunk-${chunk.idx}`;
      // chunk.thing = chunk;
      chunk_nodes.push(chunk);
    };
    for (const span of this.things.spans) {
      span.node_type = "span";
      span.key = `span-${span.idx}`;
      // span.thing = span;
      span_nodes.push(span);
    };
    for (const unit of this.things.units) {
      unit.node_type = "unit";
      unit.key = `unit-${unit.idx}`;
      // unit.thing = unit;
      unit_nodes.push(unit);
      for (const rela of ["ref", "clue"]) {
        for (const span_idx of unit?.[`${rela}_spans`]??[]) {
          if (this.things.spans.find(it=>it.idx==span_idx)) {
            span_unit_links.push(new MyPGVis.VisElement({
              link_type: `span-[${rela}]-unit`,
              source: `span-${span_idx}`,
              // source_thing: this.things.spans.find(it=>it.idx==span_idx),
              target: `unit-${unit.idx}`,
              // target_thing: unit,
            }));
          };
        };
      };
    };
    for (const arc of (this?.data?.arcs??this?.data?.edges??this?.data?.tokens??[])) {
      if ((arc.source==null)||(arc.target==null)) {continue;};
      const source_key = `unit-${arc.source}`;
      const target_key = `unit-${arc.target}`;
      const edge = arc?.edge ?? arc?.arc ?? arc?.label;
      unit_unit_links.push(new MyPGVis.VisElement({
        link_type: `unit-[${edge ?? "arc"}]-unit`,
        label: edge ?? null,
        source: source_key,
        // source_thing: this.things.units.find(it=>it.idx==arc.source),
        target: target_key,
        // target_thing: this.things.units.find(it=>it.idx==arc.target),
      }));
      const target_unit = this.things.units.find(it=>it?.key==target_key);
      target_unit.target_num = (target_unit?.target_num??0) + 1;
      target_unit.linked_num = (target_unit?.linked_num??0) + 1;
      const source_unit = this.things.units.find(it=>it?.key==source_key);
      source_unit.source_num = (source_unit?.source_num??0) + 1;
      source_unit.linked_num = (source_unit?.linked_num??0) + 1;
    };
    // const order_links = [];
    // for (const unit1 of SELF.things.units) {
    //   for (const unit2 of SELF.things.units) {
    //     if (unit1.od >= unit2.od) {continue;};
    //     order_links.push({
    //       link_type: "order-link",
    //       source: unit1?.key,
    //       target: unit2?.key,
    //     });
    //   };
    // };
    this.forced_nodes_and_links = {
      chunk_nodes,
      span_nodes,
      unit_nodes,
      span_unit_links,
      unit_unit_links,
      // order_links,
    };
    return this.forced_nodes_and_links;
  }

  static joinFns = (typeName, enterClass) => {
    return [
      entered_selection => {
        return entered_selection
          .append(typeName)
          .classed(enterClass, true)
          .classed(`${enterClass}-new`, true)
        ;
      },
      updated_selection => {
        return updated_selection
        .classed(`${enterClass}-new`, false)
        ;
      },
      exited_selection => {
        return exited_selection.remove();
      },
    ];
  };

  _drawChars() {
    const emitFn = function (node, datum, typeName="someEvent") {
      // console.log(node, datum, typeName);
      d3.select(node).dispatch(typeName, {
        bubbles: true,
        cancelable: true,
        detail: datum,
      });
    };

    const d3 = MyPGVis.D3;
    const chunks = this.things.chunks;
    const chunks_g = this.chunks_g;
    chunks_g.selectAll("g.chunk-wrap").selectAll("*").remove();

    const _eachFn = function (datum, iii, group) {
      const parent_selection = d3.select(group[iii]);
      datum.selection(parent_selection);
      // console.log(datum);
      const chunk_text = parent_selection.append("text").classed("chunk-text", true);
      chunk_text.selectAll("tspan.char-tspan").data(datum.chars).join(
        ...MyPGVis.joinFns("tspan", "char-tspan"),
      )
      .text(char=>char.text)
      .attr("text-anchor", `${"middle"}`)
      .attr("data-idx", char=>char.idx)
      .attr("data-type", char=>char.type)
      .attr("data-token-idx", char=>char.idx_token)
      .attr("data-in-token-idx", char=>char.idx_in_token)
      .each(function(da, jjj, gg) {da.selection(d3.select(gg[jjj]));})
      .on("click", function (event) {emitFn(this, d3.select(this).datum(), "Duang");})
      .on("Duang", (event)=>{console.log(event.detail?.text);})
      ;
    };
    // const chunk_wraps =
    chunks_g.selectAll("g.chunk-wrap").data(chunks).join(
      ...MyPGVis.joinFns("g", "chunk-wrap"),
    )
    .each(_eachFn)
    .attr("data-od", da=>da.od)
    .attr("data-idx", da=>da.idx)
    ;

    return chunks_g;
  }

  // _drawCharsOld() {
  //   const d3 = MyPGVis.D3;
  //   const chars = this.things.chars;
  //   const chars_g = this.chars_g;
  //   const chars_text = chars_g.selectAll("text.chars-text").data([1]).join("text").classed("chars-text", true);

  //   const emitFn = function (node, datum, typeName="someEvent") {
  //     console.log(node, datum, typeName);
  //     d3.select(node).dispatch(typeName, {
  //       bubbles: true,
  //       cancelable: true,
  //       detail: datum,
  //     });
  //   };

  //   chars_text.selectAll("tspan.chars-tspan")
  //     .data(chars)
  //     .join(
  //       entered_selection => {
  //         return entered_selection
  //           .append("tspan")
  //           .classed("chars-tspan", true)
  //           .classed("chars-tspan-new", true)
  //         ;
  //       },
  //       updated_selection => {
  //         return updated_selection
  //           .classed("chars-tspan-new", false)
  //         ;
  //       },
  //       exited_selection => {
  //         return exited_selection.remove();
  //       },
  //     )
  //     .text(char=>char.text)
  //     .attr("data-idx", char=>char.idx)
  //     .attr("data-type", char=>char.type)
  //     .attr("data-token-idx", char=>char.idx_token)
  //     .attr("data-in-token-idx", char=>char.idx_in_token)
  //     .on("click", function (event) {emitFn(this, d3.select(this).datum(), "Duang");})
  //     .on("Duang", (event)=>{console.log(event.detail);})
  //   ;
  //   return chars_g;
  // }

  _drawSpans() {
    const d3 = MyPGVis.D3;
    const spans = this.things.spans;
    const spans_g = this.spans_g;

    spans_g.selectAll("g.span-wrap").selectAll("*").remove();

    const _compute = (datum) => {
      const level = datum?.level??1;
      const char0 = this.things.charDict[datum?.range?.[0]];
      const char1 = this.things.charDict[datum?.range?.[1]-1];
      const rect0WP = char0?.chunk?.bBox ?? {x:0,y:0,width:0,height:0};
      const rect0 = char0?.bBox ?? {x:0,y:0,width:0,height:0};
      const rect1WP = char1?.chunk?.bBox ?? {x:0,y:0,width:0,height:0};
      const rect1 = char1?.bBox ?? {x:0,y:0,width:0,height:0};
      // const x_start = ((rect0?.x+rect0?.width/2)-2);
      // const x_end = ((rect1?.x+rect1?.width/2)+2);
      const x_start = ((rect0WP?.x)+(rect0?.x));
      const x_end = ((rect1WP?.x)+(rect1?.x+rect1?.width));
      const y_all = ((rect0WP?.y)+(rect0?.y));
      // const level_h = 3.25;
      const level_h = 2;
      const width = x_end-x_start;
      // const height = rect0?.height;
      const height = level_h;
      const trans_x = (x_start+x_end)/2;
      // const trans_y = rect0?.y;
      const trans_y = y_all-level*level_h;
      return {
        level,
        rect0WP,
        rect1WP,
        rect0,
        rect1,
        x_start,
        x_end,
        y_all,
        level_h,
        width,
        height,
        trans_x,
        trans_y,
      };
    };

    const _eachFn = function (datum, iii, group) {
      const parent_selection = d3.select(group[iii]);
      datum.selection(parent_selection);
      const ccc = _compute(datum);
      // console.log(ccc);
      // datum._trans_x = ccc.trans_x;
      // datum._trans_y = ccc.trans_y;
      // datum.x = ccc.trans_x;
      // datum.y = ccc.trans_y;
      d3.select(group[iii])
        // .attr("transform", `translate(${ccc.trans_x}, ${ccc.trans_y})`)
        // .attr("data-trans-x", ccc.trans_x)
        // .attr("data-trans-y", ccc.trans_y)
        // .attr("x", ccc.trans_x)
        // .attr("y", ccc.trans_y)
        .append("rect")
        .attr("width", ccc.width)
        .attr("height", ccc.height)
        .attr("stroke", "green")
        .attr("fill", "#ffa")
      ;
    };

    spans_g.selectAll("g.span-wrap")
      .data(spans)
      .join(
        entered_selection => {
          return entered_selection
          .append("g")
          .classed("span-wrap", true)
          .classed("span-wrap-new", true)
          .each(_eachFn);
        },
        updated_selection => {
          return updated_selection
          .classed("span-wrap-new", false)
          .each(_eachFn);
        },
        exited_selection => {
          return exited_selection.remove();
        },
      )
      .attr("data-range", da=>da.range)
      .attr("data-idx", da=>da.idx)
    ;
    return spans_g;
  }

  _drawUnits() {
    const d3 = MyPGVis.D3;
    const units = this.things.units;
    const units_g = this.units_g;

    units_g.selectAll("g.unit-wrap").selectAll("*").remove();


    const _makeText = (datum) => {
      const text_part = `${datum?.text??""}`;
      const label_part = (datum?.label?.length&&datum.label!="_")? `${text_part.length?" ::":""}${datum.label}`:"";
      const text_label_part = `${text_part}${label_part}`;
      const type_part =
        (datum?.label?.length&&datum.label!="_") ?
          "" :
          datum?.type?.length&&datum?.type!="token" ?
          (
            text_part?.length ?
              (`(${datum.type})`) :
              (`${datum.type}`)
          ) :
          (
            text_part?.length ?
            (``) :
            (`(${datum.type})`)
          );
      // return `${text_label_part}${type_part}[${(datum?.rank??0)?.toFixed?.(2)}]`;
      // return `${text_label_part}${type_part}[${(datum?.level??0)?.toFixed?.(2)}]`;
      return `${text_label_part}${type_part}`;
    };

    const _eachFn = function (datum, iii, group) {
      const parent_selection = d3.select(group[iii]);
      datum.selection(parent_selection);
      // const bg_layer = parent_selection.selectAll("g.unit-bg-layer").data([datum]).join("g").classed("unit-bg-layer", true);
      const box_layer = parent_selection.selectAll("g.unit-box-layer").data([datum]).join("g").classed("unit-box-layer", true);
      const text_layer = parent_selection.selectAll("g.unit-text-layer").data([datum]).join("g").classed("unit-text-layer", true);
      // const joint_layer = parent_selection.selectAll("g.unit-joint-layer").data([datum]).join("g").classed("unit-joint-layer", true);
      datum._layers = {
        box: new MyPGVis.VisElement(),
        text: new MyPGVis.VisElement(),
        // joint: new MyPGVis.VisElement(),
      };
      datum._layers.box.selection(box_layer);
      datum._layers.text.selection(text_layer);
      // datum._layers.joint.selection(joint_layer);

      parent_selection.attr("transform", `translate(${(iii+1)*45}, ${-45})`);

      const text_label = text_layer
        .append("text")
        .classed("unit-label", true)
        .text(_makeText(datum))// + `L${datum.level??"_"}`+`D${datum.depth??"_"}`
        .attr("text-anchor", `${"middle"}`)
        .attr("x", 0)
        .attr("y", 0)
        // .attr("stroke", "black")
        .attr("fill", "black")
      ;
      const text_label_bbox = datum._layers.text.bBox;
      // const lineHeight = 14;

      // 需要处理文本换行问题
      // https://zhuanlan.zhihu.com/p/195108059
      if (datum?.details?.length) {
        text_label.attr("fill", "blue");
        // text_layer
        //   .append("text")
        //   .classed("unit-details", true)
        //   .text("(...)")
        //   .attr("text-anchor", `${"middle"}`)
        //   // .text(JSON.stringify(datum.details, null, 2))
        //   .attr("title", JSON.stringify(datum.details, null, 2))
        //   .attr("x", text_label_bbox.x+text_label_bbox.width/2)
        //   .attr("y", text_label_bbox.y+text_label_bbox.height*2)
        //   .attr("fill", "#888")
        // ;
      };
      if (datum?.text?.length) {
        text_label.attr("fill", "green");
      };
      if (!datum?.ref_spans?.length) {
        text_label.attr("fill", "blue");
      };
      if (datum?.is_top||datum?.is_root) {
        text_label.attr("fill", "red");
      };

      const text_layer_bbox = text_layer.node().getBBox();

      const basic_rx = 1.25;
      const basic_ry = 1.25;
      const label_rx = 5;
      const label_ry = 5;
      const link_rx = 0;
      const link_ry = 0;

      const _attrMap = {
        "Anno": {
          "rx": link_rx,
          "ry": link_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "stroke": "#ff8",
          "fill": "#ffd",
        },
        "InstrSeq": {
          "rx": link_rx,
          "ry": link_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "stroke": "#f88",
          "fill": "#fdd",
        },
        "Instr": {
          "rx": link_rx,
          "ry": link_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "stroke": "#f88",
          "fill": "#fdd",
        },
        "Opera": {
          "rx": link_rx,
          "ry": link_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "stroke": "#f88",
          "fill": "#fdd",
        },
        "Link": {
          "rx": link_rx,
          "ry": link_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "stroke": "#22a",
          "fill": "#ccf",
        },
        "FrameCase": {
          "rx": link_rx,
          "ry": link_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "stroke": "#22a",
          "fill": "#ccf",
        },
      };
      const _attrGen = (it)=>{
        const aaa = _attrMap?.[it?.type] ?? {};
        const ooo = {
          "rx": label_rx,
          "ry": label_ry,
          "x": text_layer_bbox.x-1.5*basic_rx,
          "y": text_layer_bbox.y-basic_ry,
          "width": text_layer_bbox.width+2*1.5*basic_rx,
          "height": text_layer_bbox.height+2*basic_ry,
          "stroke": "#aaa",
          "fill": "#eee",
        };
        return Object.assign(ooo, aaa);
      };

      const box_rect = box_layer.append("rect").classed("unit-box", true);
      MyPGVis.configSelection(box_rect, {
        attr: _attrGen(datum),
      });
      // box_layer.append("rect").classed("unit-box", true)
      //   .attr("rx", rx)
      //   .attr("ry", ry)
      //   .attr("x", text_layer_bbox.x-1.5*rx)
      //   .attr("y", text_layer_bbox.y-rx)
      //   .attr("width", text_layer_bbox.width+2*1.5*rx)
      //   .attr("height", text_layer_bbox.height+2*rx)
      //   .attr("stroke", "#aaa")
      //   .attr("fill", "#eee")
      // ;

      const box_layer_bbox = box_layer.node().getBBox();

      // const joint_points = MyPGVis._getJointPoints(box_layer_bbox);

      // bg_layer
      //   .append("circle")
      //   .classed("unit-force-circle", true)
      //   .attr("r", Math.hypot(box_layer_bbox.width, box_layer_bbox.height)/2)
      //   .attr("cx", joint_points.center.x)
      //   .attr("cy", joint_points.center.y)
      //   .attr("stroke", "red")
      //   .attr("fill", "transparent")
      // ;

      // const joint_points_list = Object.entries(joint_points);

      // joint_layer.selectAll("circle.unit-joint-point")
      //   .data(joint_points_list)
      //   .join("circle")
      //   .classed("unit-joint-point", true)
      //   .attr("r", 2)
      //   .attr("data-name", da=>da[0])
      //   .attr("cx", da=>da[1].x)
      //   .attr("cy", da=>da[1].y)
      //   .attr("stroke", "rgba(255,0,0,0.25)")
      //   .attr("fill", "transparent")
      //   .attr("data-idx", datum.idx)
      // ;

    };

    units_g.selectAll("g.unit-wrap")
      .data(units)
      .join(
        entered_selection => {
          return entered_selection
          .append("g")
          .classed("unit-wrap", true)
          .classed("unit-wrap-new", true)
          .each(_eachFn);
        },
        updated_selection => {
          return updated_selection
          .classed("unit-wrap-new", false)
          .each(_eachFn);
        },
        exited_selection => {
          return exited_selection.remove();
        },
      )
      .attr("data-od", da=>da.od)
      .attr("data-idx", da=>da.idx)
      .attr("data-depth", da=>da.depth)
      .attr("data-rank", da=>da.rank)
      .on("mouseenter", event=>{
        const me = d3.select(event.target);
        me.classed("mouse-over", true);
        me.attr("filter", `url(#svg-filter-shadow)`);
        // me.attr("filter", `url(${new URL(`#svg-filter-shadow`, location)})`);
      })
      .on("mouseleave", event=>{
        const me = d3.select(event.target);
        me.classed("mouse-over", false);
        me.attr("filter", null)
      })
      .on("click", event=>{
        const me = d3.select(event.target);
        me.dispatch("click-unit", {
          bubbles: true,
          cancelable: true,
          detail: {
            type: "click-unit",
            event: event,
            datum: me.datum(),
            vis: this,
          },
        });
      })
    ;

    // const unit_circles = xx;

    return units_g;
  }

  _drawArcs() {
    const d3 = MyPGVis.D3;
    const arcs_g = this.arcs_g;
    const arcs = this.things.units;
    const {
      span_unit_links,
      unit_unit_links,
    } = this.forced_nodes_and_links;

    const _makeSpanUnitArcFn = (lk) => {
      const start_point = {
        x: lk.source.x + (lk.source?.box?.width??0)/2,
        y: lk.source.y - (lk.source?.box?.height??0)/2,
      };
      const end_point = {
        x: lk.target.x,// + (lk.target?.box?.width??0)/2,
        y: lk.target.y+4,// + (lk.target?.box?.height??0)/2,
      };

      const mid_point = {
        x: (start_point.x + (end_point.x-start_point.x)/5),
        y: (start_point.y + (end_point.y-start_point.y)/5*3),
      };
      const drawer = d3.line(da=>da.x, da=>da.y).curve(d3.curveCatmullRom.alpha(0.1));
      return drawer([start_point, mid_point, {x: end_point.x, y: end_point.y}]);
    };

    const _make_points = (lk) => {
      const offsetted = (nd) => {
        const iBox = nd?._layers?.box?.box;
        return ({
          x: (iBox?.x+nd?.x)+iBox?.width/2,
          y: (iBox?.y+nd?.y)+iBox?.height/2,
        });
      };

      const source_box =  lk.source?._layers?.box?.box;
      const target_box =  lk.target?._layers?.box?.box;

      const source = {
        idx: lk.source?.idx,
        x: (isNaN(offsetted(lk.source)?.x) ? 0 : offsetted(lk.source)?.x ?? 0),
        y: (isNaN(offsetted(lk.source)?.y) ? 0 : offsetted(lk.source)?.y ?? 0),
        width: source_box?.width??0,
        height: source_box?.height??0,
      };
      const target = {
        idx: lk.target?.idx,
        x: (isNaN(offsetted(lk.target)?.x) ? 0 : offsetted(lk.target)?.x ?? 0),
        y: (isNaN(offsetted(lk.target)?.y) ? 0 : offsetted(lk.target)?.y ?? 0),
        width: target_box?.width??0,
        height: target_box?.height??0,
      };



      // console.log(lk);
      const delta_idx = Math.abs(target.idx-source.idx);
      const delta_x = Math.abs(target.x-source.x);

      const min_y = Math.min(source.y, target.y);
      const max_y = Math.max(source.y, target.y);
      // const delta_y = Math.abs(target.y-source.y);

      // const hhyy = (min_y - (delta_x/(delta_idx+1)) - 0);
      const hhyy = (min_y - (delta_x*0.25) - 0);

      const wwxx_1 = (Math.min(source.x, target.x) + delta_x/(delta_idx*6+2));
      const wwxx_2 = (Math.max(source.x, target.x) - delta_x/(delta_idx*6+2));
      const point_s = {
        x: source.x,// + source.width/2,
        y: source.y + source.height/2,
      };
      const point_t = {
        x: target.x,// - target.width/2,
        y: target.y - target.height/2,
      };
      const point_mid = {
        x: (point_s.x + point_t.x)/2,
        y: (point_s.y + point_t.y)/2,
      };
      const point_1 = {
        x: Math?.[source.x<target.x?"min":"max"]?.(wwxx_1, wwxx_2),
        y: (point_s.y + point_mid.y)/2,
      };
      const point_2 = {
        x: Math?.[source.x<target.x?"max":"min"]?.(wwxx_1, wwxx_2),
        y: (point_t.y + point_mid.y)/2,
      };
      return {
        start: point_s,
        m1: point_1,
        mid: point_mid,
        m2: point_2,
        end: point_t,
      };
    };

    const _makeUnitUnitArcFn = (lk) => {
      const drawer = d3.line(da=>da.x, da=>da.y)
        // .curve(d3.curveMonotoneX)
        // .curve(d3.curveCatmullRom.alpha(0.95))
      ;
      const pp = _make_points(lk);
      // return drawer([pp.start, pp.m1, pp.mid, pp.m2, pp.end]);
      return drawer([pp.start, pp.end]);
    };

    const _linkTypeToColor = (lk) => {
      if ((lk?.source?.label)==("ROOT")) {
        return "red";
      }
      if ((lk?.source?.idx?.[1]=="-")) {
        return "blue";
      }
      const map = {
        "span-[ref]-unit": (lk_)=>"#888",
        "span-[clue]-unit": (lk_)=>"#a64",
        // "unit-[CoreWord]-unit": (lk_)=>"red",
      };
      return map?.[lk?.link_type]?.(lk) ?? "#888";
    };

    const _eachSpanUnitArcFn = (datum, iii, group) => {
      const parent_selection = d3.select(group[iii]);
      datum.selection(parent_selection);
      parent_selection.append("path")
        .attr("fill", "none")
        .attr("stroke", lk=>_linkTypeToColor(lk))
        // .attr("marker-end", `url(${new URL(`#svg-mark-arrow`, location)})`)
        .attr("d", lk=>_makeSpanUnitArcFn(lk))
      ;
    };
    const _eachUnitUnitArcFn = (datum, iii, group) => {
      const points = _make_points(datum);
      // const label_text =
      // datum?.label?.length ? (
      //   points.start.x > points.end.x
      //     ? `< ${datum.label}`  // <◁◀
      //     : `${datum.label} >`  // ▶▷>
      // ) : ""
      // ;
      const label_text =
      datum?.label?.length ? (
        points.start.x > points.end.x
          ? `${datum.label} >`  // <◁◀
          : `< ${datum.label}`  // ▶▷>
      ) : ""
      ;
      const parent_selection = d3.select(group[iii]);
      datum.selection(parent_selection);
      parent_selection.append("path")
        .attr("fill", "none")
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .attr("stroke", lk=>_linkTypeToColor(lk))
        .attr("marker-start", `url(#svg-mark-triangle-start)`)
        // .attr("marker-end", `url(#svg-mark-triangle)`)
        // .attr("marker-end", `url(${new URL(`#svg-mark-triangle`, location)})`)
        .attr("d", lk=>_makeUnitUnitArcFn(lk))
      ;
      const angle = Math.atan((points?.end?.y-points?.start?.y)/(points?.end?.x-points?.start?.x))*180/Math.PI;
      // console.log(angle);
      const label_x = isNaN(points?.mid?.x) ? 0 : (points?.mid?.x??0);
      const label_y = (isNaN(points?.mid?.y) ? 0 : (points?.mid?.y??0)) - 2;
      parent_selection.append("text")
        .text(label_text)
        .attr("text-anchor", `${"middle"}`)
        .attr("font-size", 8)
        .attr("x", label_x)
        .attr("y", label_y)
        .attr("transform", `rotate(${isNaN(angle)?0:angle}, ${label_x}, ${label_y})`)
      ;
    };

    arcs_g.selectAll("g.arc-span-unit-wrap").selectAll("*").remove();
    arcs_g.selectAll("g.arc-span-unit-wrap").data(span_unit_links).join(
      entered_selection => {
        return entered_selection
        .append("g")
        .classed("arc-span-unit-wrap", true)
        .classed("arc-span-unit-wrap-new", true)
        ;
      },
      updated_selection => {
        return updated_selection
        .classed("arc-span-unit-wrap-new", false)
        ;
      },
      exited_selection => {
        return exited_selection.remove();
      },
    )
    .each(_eachSpanUnitArcFn)
    .attr("data-label", da=>da?.label);

    arcs_g.selectAll("g.arc-unit-unit-wrap").selectAll("*").remove();
    arcs_g.selectAll("g.arc-unit-unit-wrap").data(unit_unit_links).join(
      entered_selection => {
        return entered_selection
        .append("g")
        .classed("arc-unit-unit-wrap", true)
        .classed("arc-unit-unit-wrap-new", true)
        ;
      },
      updated_selection => {
        return updated_selection
        .classed("arc-unit-unit-wrap-new", false)
        ;
      },
      exited_selection => {
        return exited_selection.remove();
      },
    )
    .each(_eachUnitUnitArcFn)
    .attr("data-label", da=>da?.label)
    ;



  }



  static _getJointPoints(box) {
    return {
      center: {
        x: box?.x + box?.width/2,
        y: box?.y + box?.height/2,
      },
      top: {
        x: box?.x + box?.width/2,
        y: box?.y,
      },
      right: {
        x: box?.x + box?.width,
        y: box?.y + box?.height/2,
      },
      bottom: {
        x: box?.x + box?.width/2,
        y: box?.y + box?.height,
      },
      left: {
        x: box?.x,
        y: box?.y + box?.height/2,
      },
      top_left: {
        x: box?.x,
        y: box?.y,
      },
      top_right: {
        x: box?.x + box?.width,
        y: box?.y,
      },
      bottom_rigth: {
        x: box?.x + box?.width,
        y: box?.y + box?.height,
      },
      bottom_left: {
        x: box?.x,
        y: box?.y + box?.height,
      },
    };
  }

  static _getJointPoint(box, key=null) {
    const fn_map = {
      center: () => ({
        x: box?.x + box?.width/2,
        y: box?.y + box?.height/2,
      }),
      top: () => ({
        x: box?.x + box?.width/2,
        y: box?.y,
      }),
      right: () => ({
        x: box?.x + box?.width,
        y: box?.y + box?.height/2,
      }),
      bottom: () => ({
        x: box?.x + box?.width/2,
        y: box?.y + box?.height,
      }),
      left: () => ({
        x: box?.x,
        y: box?.y + box?.height/2,
      }),
      top_left: () => ({
        x: box?.x,
        y: box?.y,
      }),
      top_right: () => ({
        x: box?.x + box?.width,
        y: box?.y,
      }),
      bottom_rigth: () => ({
        x: box?.x + box?.width,
        y: box?.y + box?.height,
      }),
      bottom_left: () => ({
        x: box?.x,
        y: box?.y + box?.height,
      }),
    };
    return fn_map?.[key]?.();
  }


  static forceOrderingOld(nodes) {
    let key = "od";
    let axis = "x";
    let drift = -5;
    const dim = {
      "x": "width",
      "y": "height",
    };

    const keyTypeFnMap = {
      "string": (nd, key)=>nd?.[key],
      "function": (nd, key)=>key(nd),
    };

    const force = function() {
      const typeof_key = typeof(key);
      if (typeof_key=="string"||typeof_key=="function") {
        const keyTypeFn = keyTypeFnMap[typeof_key];
        for (const node1 of nodes) {
          for (const node2 of nodes) {
            const node1_to = node1?.[axis]+node1?.box?.[dim[axis]]/2;
            const node2_to = node2?.[axis]-node2?.box?.[dim[axis]]/2;
            if (keyTypeFn(node1, key) < keyTypeFn(node2, key) && node1?.[axis] > (node2?.[axis]+drift)) {
              [node1[axis], node2[axis]] = [node2[axis]+drift, node1[axis]-drift];
              // [node1[`v${axis}`], node2[`v${axis}`]] = [node2[`v${axis}`], node1[`v${axis}`]];
              // const mult1 = node1[`v${axis}`]>0? -1.1 : 1.1;
              // const mult2 = node2[`v${axis}`]<0? -1.1 : 1.1;
              // [node1[`v${axis}`], node2[`v${axis}`]] = [mult1*node1?.[`v${axis}`], mult2*node2?.[`v${axis}`]];
            };
          };
        };
      };
    };

    force.initialize = function(nodes_) {
      // nodes = nodes_;
    };
    force.key = function(key_) {
      if (arguments.length) {
        // key = key_;
        return (key = key_, force);
      };
      return key;
    };
    force.axis = function(axis_) {
      if (arguments.length) {
        axis = axis_;
        return force;
      };
      return axis;
    };
    force.drift = function(drift_) {
      if (arguments.length) {
        drift = drift_;
        return force;
      };
      return drift;
    };

    return force;
  }

  static forceOrdering(nodes) {
    let key = "od";
    let axis = "x";
    let drift = -5;
    const dim = {
      "x": "width",
      "y": "height",
    };

    const keyTypeFnMap = {
      "string": (nd, key)=>nd?.[key],
      "function": (nd, key)=>key(nd),
    };

    const force = function() {
      const typeof_key = typeof(key);
      if (typeof_key=="string"||typeof_key=="function") {
        const keyTypeFn = keyTypeFnMap[typeof_key];

        const loop = () => {
          for (const node1 of nodes) {
            for (const node2 of nodes) {
              // 如果 node1 右边缘 在 node2 的左边缘 偏移 drift 位置 的 右边
              // 就让 node1 右边缘 在 node2 的左边缘 偏移 drift 位置 的 左边
              const node1_end = node1?.[axis]+node1?.box?.[dim[axis]]/2;
              const node2_start = node2?.[axis]-node2?.box?.[dim[axis]]/2;
              if ((+keyTypeFn(node1, key)) < (+keyTypeFn(node2, key)) && node1_end > (node2_start+drift)) {
                const aa = node1[axis]+node1?.box?.[dim[axis]]/2;
                const bb = node2[axis]-node2?.box?.[dim[axis]]/2 + drift;
                node1[axis] = bb - node1?.box?.[dim[axis]]/2;
                node2[axis] = aa + node2?.box?.[dim[axis]]/2 - drift;
              };
            };
          };
        };

        loop();

      };
    };

    force.initialize = function(nodes_) {
      // nodes = nodes_;
    };
    force.key = function(key_) {
      if (arguments.length) {
        // key = key_;
        return (key = key_, force);
      };
      return key;
    };
    force.axis = function(axis_) {
      if (arguments.length) {
        axis = axis_;
        return force;
      };
      return axis;
    };
    force.drift = function(drift_) {
      if (arguments.length) {
        drift = drift_;
        return force;
      };
      return drift;
    };

    return force;
  }



  _makeAndDrawForces(realTimeResize=false) {
    const SELF = this;
    const d3 = MyPGVis.D3;
    // this._makeForcedNodesAndLinks();
    const simulation = d3.forceSimulation([
      ...this.forced_nodes_and_links.chunk_nodes,
      ...this.forced_nodes_and_links.span_nodes,
      ...this.forced_nodes_and_links.unit_nodes,
    ]);

    this.config.realTimeResize = realTimeResize;
    this.config.realTimeResizeState = realTimeResize;

    // const alphaTarget = 0;
    simulation.alphaTarget(this.config.alphaTarget);

    // 文本和单元之间的弹簧力
    simulation
    .force("link-from-span-to-unit", d3.forceLink(this.forced_nodes_and_links.span_unit_links)
      .id(nd => {
        return nd.key;
      })
      .distance(lk => {
        return 0;
      })
      // .strength(0.2)
      // .strength(0.75)
      .strength(0)
      // .strength(1)
      // .strength(0.25)
      // .strength(lk => 1 / Math.min(count(lk.source), count(lk.target)))
      // Where count(node) is a function that returns the number of links with the given node as a source or target. This default was chosen because it automatically reduces the strength of links connected to heavily-connected nodes, improving stability.
    );

    // 单元之间的弹簧力
    simulation
    .force("link-from-unit-to-unit", d3.forceLink(this.forced_nodes_and_links.unit_unit_links)
      .id(nd => nd.key)
      .distance(lk => 70)
      .strength(lk => 0.5)
    );

    // 文块排序
    simulation.force("order-force-chunk",
      MyPGVis.forceOrdering(this.forced_nodes_and_links.chunk_nodes)
        .axis("x").key(it=>it.od??0).drift(-4)
    );

    // // 文本排序
    // simulation.force("order-force-span",
    //   MyPGVis.forceOrdering(this.forced_nodes_and_links.span_nodes)
    //     .axis("x").key(it=>it?.indices?.[0]).drift(-2)
    // );

    // 单元排序
    simulation.force("order-force-unit",
      MyPGVis.forceOrdering(this.forced_nodes_and_links.unit_nodes)
        .axis("x").key(it=>it?.rank??0).drift(-2)
    );

    // 任意两个个元素之间的引力或斥力
    simulation.force('charge', d3.forceManyBody()
      .distanceMax(70)
      .distanceMin(0)
      .strength(it=>{
        const fn_map = {
          "chunk": (that)=>0,
          "span": (that)=>-0,//10,
          "unit": (that)=>-120,
        };
        return fn_map?.[it?.node_type]?.(it) ?? 0;
      })
    );

    // 任意两个个元素之间的引力或斥力
    simulation.force('charge-2', d3.forceManyBody()
      .distanceMax(8000)
      .distanceMin(1000)
      .strength(it=>{
        const fn_map = {
          "chunk": (that)=>0,
          "span": (that)=>0,
          "unit": (that)=>500,
        };
        return fn_map?.[it?.node_type]?.(it) ?? 0;
      })
    );

    // 碰撞力 相当于给元素设置半径 防止重叠
    simulation.force('collide',
      d3.forceCollide().radius(it=>{
        const fn_map = {
          "chunk": (that)=>{
            const rr = that?.box?.width / 2;
            // return rr*1.05;
            return rr*0;
          },
          // "span": (that)=>that?.box?.width / 2 *1.5,
          "unit": (that)=>that?.box?.width / 2 *1.25,
        };
        return fn_map?.[it?.node_type]?.(it) ?? 10;
      })
      .iterations(1)
      .strength(0.15)
    );

    // x和y定位力以可配置的强度沿给定维度将节点推向所需位置。径向力类似，只是它将节点推向给定圆上的最近点。力的强度与节点位置和目标位置之间的一维距离成比例。虽然这些力可用于定位单个节点，但它们主要用于应用于所有（或大多数）节点的全局力。
    // simulation.force("x", d3.forceX().strength(0));
    // simulation.force("radial", d3.forceRadial(10).strength(0));
    simulation.force("y",
      d3.forceY(it=>{
        // console.log(it);
        const fn_map = {
          "chunk": () => -10,  // 其实没用 因为后面直接写死了
          "span": () => -2*(it?.level??-1)-12,  // 其实没用 因为后面直接写死了
          "unit": () => -this.config.level_height*(it?.level??-1)-this.config.base_height,
        };
        return fn_map?.[it?.node_type]?.(it) ?? 0;
      })
      .strength(it=>{
        const fn_map = {
          "chunk": () => 1,  // 其实没用 因为后面直接写死了
          "span": () => 1,  // 其实没用 因为后面直接写死了
          // "unit": () => 0.95,
          "unit": () => 0.65,
        };
        return fn_map?.[it?.node_type]?.() ?? 0;
      })
    );

    // 每帧更新
    simulation.on("tick", ()=>{
      // console.log("tick");

      const chunks_box = this.chunks_g.node().getBBox();
      const center_x = MyPGVis._getJointPoint(chunks_box, "center").x;
      // const center_x = (isNaN(chunks_box?.x)?0:chunks_box?.x) + chunks_box.width/2;

      const units_box = this.units_g.node().getBBox();
      const center_y = 0 - units_box.height*0.3;

      // console.log(center_x, center_y);

      // // 中心力 保持图像在视口中央
      // const forceCenter = d3.forceCenter(+center_x, +center_y)
      // // .x(it=>{
      // //   return ({
      // //     "chunk": () => 0,
      // //   })?.[it?.node_type]?.() ?? center_x;
      // // })
      // // .y(it=>{
      // //   return ({
      // //     "chunk": () => 0,
      // //   })?.[it?.node_type]?.() ?? center_y;
      // // })
      // // .strength(it=>{
      // //   return ({
      // //     "chunk": () => 0,
      // //   })?.[it?.node_type]?.() ?? 0.1;
      // // })
      // // .x(it=>(+center_x))
      // // .y(it=>(+center_y))
      // // .strength(it=>1)
      // ;
      // // console.log(forceCenter);
      // simulation.force('center', forceCenter);

      // 更新 chunks 位置
      this.forced_nodes_and_links.chunk_nodes.forEach(chunk_node=>{
        const selected = chunk_node?.selected;//SELF?.chunks_g?.select?.(`g.chunk-wrap[data-idx="${chunk_node?.idx}"]`);
        // console.log(selected);
        chunk_node.y = 0;
        chunk_node.fy = 0;
        chunk_node.x_need = true;
        selected.attr("transform", `translate(${chunk_node.x}, ${chunk_node.y})`);
        // chunk_node.fy = -50*(chunk_node?.linked_num??0+1);
        // console.log([chunk_node.x, chunk_node.y, chunk_node.chars.map(it=>it.text).join("")]);
        // chunk_node.fy = +chunk_node?._trans_y;
      });

      // 更新 spans 位置
      // this._drawSpans();
      this.forced_nodes_and_links.span_nodes.forEach(span_node=>{
        const selected = SELF?.spans_g?.select?.(`g.span-wrap[data-idx="${span_node?.idx}"]`);
        // console.log(span_node);
        const first_char = this.things.charDict[span_node.indices[0]];
        // console.log(first_char);
        span_node.x = first_char?.chunk?.x + first_char?.box?.x;
        // if (first_char?.chunk?.x_need) {
        //   first_char.chunk.x = span_node.x - (first_char?.box?.x??0);
        //   first_char.chunk.x_need = false;
        // };
        span_node.y = -5*(span_node?.level??-1)-12;
        span_node.fy = -5*(span_node?.level??-1)-12;
        selected.attr("transform", `translate(${span_node.x}, ${span_node.y})`);
        // span_node.fx = +span_node?._trans_x;
        // span_node.fy = +span_node?._trans_y;
      });
      // 更新 units 位置
      this.forced_nodes_and_links.unit_nodes.forEach(unit_node=>{
        const selected = SELF?.units_g?.select?.(`g.unit-wrap[data-idx="${unit_node?.idx}"]`);
        // console.log(selected);
        selected.attr("transform", `translate(${unit_node.x}, ${unit_node.y})`);
        // unit_node.fy = -50*(unit_node?.linked_num??0+1);
      });

      this._drawArcs();
      if (this.config.realTimeResizeState) {this.resize(this.config.realTimeResizeState);};
      this.svg_g_root.dispatch("tick", {
        bubbles: true,
        cancelable: true,
        detail: {
          type: "tick",
        },
      });
    });


    // https://github.com/d3/d3-force/blob/v3.0.0/README.md#simulation_alpha
    // simulation.alphaDecay(0.1);  // default 0.0228… = 1 - pow(0.001, 1 / 300) where 0.001 is the default minimum alpha.
    // simulation.velocityDecay(0.3);  // defaults to 0.4 . | The decay factor is akin to atmospheric friction; after the application of any forces during a tick, each node’s velocity is multiplied by 1 - decay. As with lowering the alpha decay rate, less velocity decay may converge on a better solution, but risks numerical instabilities and oscillation.
    simulation.alphaDecay(this.config.alphaDecay);
    simulation.velocityDecay(this.config.velocityDecay);


    simulation.on("end", ()=>{
      this.svg_g_root.dispatch("end", {
        bubbles: true,
        cancelable: true,
        detail: {
          type: "end",
        },
      });
      this.config.realTimeResizeState = this.config.realTimeResize;
      if (this?.config?.resizeAtEnd) {
        this.resize();  // 此时不需要实时resize 而总是需要渐变resize
      };
    });

    const _dragFn = (sim, dragX=true, dragY=true) => {
      const drag_started = (event, dd) => {
        if (!event.active) {sim.alphaTarget(this.config.dragAlphaTarget).restart();};
        if (dragX) {
          dd.ofx = dd?.fx;
          dd._trans_x = dd.x;
          dd.fx = dd.x;
        };
        if (dragY) {
          dd.ofy = dd?.fy;
          dd._trans_y = dd.y;
          dd.fy = dd.y;
        };
        // console.log(dd);
      };
      const dragged = (event, dd) => {
        if (dragX) {
          dd.fx = event.x;
          dd._trans_x = event.x;
        };
        if (dragY) {
          dd.fy = event.y;
          dd._trans_y = event.y;
        };
        // console.log(dd);
      };
      const drag_ended = (event, dd) => {
        if (!event.active) {sim.alphaTarget(this.config.alphaTarget);};
        if (dragX) {dd.fx = dd?.ofx!=null ? dd.fx : null;};
        if (dragY) {dd.fy = dd?.ofy!=null ? dd.fy : null;};
      };
      return MyPGVis.D3.drag()
      .on("start", (event, dd)=>{
        this.config.realTimeResizeState = false;
        drag_started(event, dd);
        this.svg_g_root.dispatch("drag-start", {
          bubbles: true,
          cancelable: true,
          detail: {
            type: "drag-start",
          },
        });
      })
      .on("drag", (event, dd)=>{
        dragged(event, dd);
        this.svg_g_root.dispatch("drag", {
          bubbles: true,
          cancelable: true,
          detail: {
            type: "drag",
          },
        });
        this.svg_g_root.dispatch("drag-move", {
          bubbles: true,
          cancelable: true,
          detail: {
            type: "drag-move",
          },
        });
      })
      .on("end", (event, dd)=>{
        // this.config.realTimeResizeState = this.config.realTimeResize;
        drag_ended(event, dd);
        this.svg_g_root.dispatch("drag-end", {
          bubbles: true,
          cancelable: true,
          detail: {
            type: "drag-end",
          },
        });
      })
      ;
    };

    SELF.units_g.selectAll("g.unit-wrap").call(_dragFn(simulation, true, true));
    // SELF.spans_g.selectAll("g.span-wrap").call(_dragFn(simulation, true, false));
    SELF.chunks_g.selectAll("g.chunk-wrap").call(_dragFn(simulation, true, false));

    this.simulation = simulation;
    return this.simulation;
  }

  fineTuning() {
    this.config.realTimeResizeState = false;
    this.simulation.alphaTarget(this.config.dragAlphaTarget).restart();
    setTimeout(()=>{
      this.simulation.alphaTarget(this.config.alphaTarget);
    }, 50);
  }

  get rootBox() {
    return this.svg_g_root.node().getBBox();
  }

  get rootWidth() {
    const padding = this.config.padding;
    return this.rootBox.width+padding.left+padding.right;
  }

  get rootHeight() {
    const padding = this.config.padding;
    return this.rootBox.height+padding.top+padding.bottom;
  }

  get rootViewBox() {
    const padding = this.config.padding;
    return [
      this.rootBox.x-padding.left,
      this.rootBox.y-padding.top,
      this.rootWidth,
      this.rootHeight,
    ]
  }

  get parentWidth() {
    return this.svg?.node?.()?.parentNode?.getBoundingClientRect?.()?.width;
  }

  resize(realTimeResize=false) {
    const parent_width = this.parentWidth;
    const viewBoxAttr = this.rootViewBox;

    let widthAttr = this.rootWidth;
    let heightAttr = this.rootHeight;

    // let rrrr = 1;

    if (parent_width!=null && widthAttr > parent_width) {
      const rt = heightAttr/widthAttr;
      const new_widthAttr = Math.floor(parent_width);
      // rrrr = new_widthAttr/widthAttr;
      widthAttr = new_widthAttr;
      const new_heightAttr = Math.ceil(new_widthAttr * rt);
      heightAttr = new_heightAttr;
    };

    const this_svg = realTimeResize ? this.svg : this.svg.transition().duration(1500);
    this_svg
      .attr("height", heightAttr)
      .attr("width", widthAttr)
      .attr("viewBox", viewBoxAttr)
      .call(this.zoom.transform, MyPGVis.D3.zoomIdentity)
    ;

    // this.svg.transition().duration(750).call(this.zoom.transform, MyPGVis.D3.zoomIdentity);

    this.svg_g_root.dispatch("resize", {
      bubbles: true,
      cancelable: true,
      detail: {
        type: "resize",
      },
    });
  }
}

export default MyPGVis;

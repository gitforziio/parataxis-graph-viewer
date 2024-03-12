import { createElement as vNode, useState, memo } from "../../../../vendor/react.js";

import DnD from "../../../../vendor/react-beautiful-dnd.mjs.js";
const { DragDropContext, Droppable, Draggable } = DnD;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const QuoteItem = React.forwardRef((props, ref) => {
  const {className, style, children, ...other_props} = props;

  const classNames = ["mb-2 p-2", "border rounded", "bg-info"];
  if (className!=null) {classNames.push(className);};

  return vNode('div', {
    ref: ref,
    className: classNames.join(" "),
    style: {
      width: "200px",
      ...(props?.style??{}),
    },
    ...other_props,
  }, props?.children);
});

const Quote = ({ quote, index })=>{
  return vNode(Draggable, {
    draggableId: quote.id,
    index: index,
  }, provided => vNode(QuoteItem, {
    ref: provided.innerRef,
    ...provided.draggableProps,
  }, [
    vNode('span', {
      ...provided.dragHandleProps,
    }, "Handle"),
    quote.content,
  ]));
};

const QuoteList = memo(function QuoteList({ quotes }) {
  return quotes.map((quote, index) => vNode(Quote, {
    quote: quote, index: index, key: quote.id,
  }));
});

const QuoteApp = (props)=>{
  const [items_wrap, set__items_wrap] = useState({ quotes: Array.from({ length: 10 }, (v, k) => k).map(k => ({ id: `id-${k}`, content: `Quote ${k}` })) });

  function onDragEnd(result) {
    if (!result.destination) {return;};
    if (result.destination.index === result.source.index) {return;};
    const quotes = reorder(
      items_wrap.quotes,
      result.source.index,
      result.destination.index
    );
    console.log(quotes);
    set__items_wrap({ quotes });
  };

  return vNode(DragDropContext, {onDragEnd: onDragEnd}, [
    vNode(Droppable, {droppableId: "list"},
      provided => vNode('div', {
        ref: provided.innerRef,
        ...provided.draggableProps,
      }, [
        vNode(QuoteList, {quotes: items_wrap.quotes}),
        provided.placeholder,
      ]),
    ),
  ]);
};

export default QuoteApp;

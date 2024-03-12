import FileSaver from "../../../vendor/FileSaver.mjs.js";

const saveAs = FileSaver.saveAs;

export function save(obj, fileName) {
  fileName = (!fileName?.length) ? "file.json" : ((fileName?.split?.(".")?.length??0)<2) ? `${fileName}.json` : fileName;
  const text = JSON.stringify(obj, null, 2)
  const file = new File([text], fileName, {type: "text/plain;charset=utf-8"});
  return saveAs(file);
};

export function saveText(text, fileName) {
  fileName = (!fileName?.length) ? "file.txt" : ((fileName?.split?.(".")?.length??0)<2) ? `${fileName}.txt` : fileName;
  const file = new File([text], fileName, {type: "text/plain;charset=utf-8"});
  return saveAs(file);
};

export function saveLines(list, fileName) {
  if (list?.map==null) {list = [list]};
  fileName = (!fileName?.length) ? "file.jsonl" : ((fileName?.split?.(".")?.length??0)<2) ? `${fileName}.jsonl` : fileName;
  const lines = list.map(it=>JSON.stringify(it));
  const text = lines.join("\n");
  const file = new File([text], fileName, {type: "text/plain;charset=utf-8"});
  return saveAs(file);
};

export function saveBlob(blob, fileName) {
  return saveAs(blob, fileName);
};

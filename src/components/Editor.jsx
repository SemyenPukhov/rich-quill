import React, { useRef } from "react";
import Quill from "quill";
import QwilShortcuts from "../ShortcutsModule";
import "../quill.css";

function Editor(props) {
  const editorRef = useRef();

  // for inline code
  const Code = Quill.import("formats/code");
  Code.className = "markdown-code";

  //code-block custom class
  const CodeBlock = Quill.import("formats/code-block");
  CodeBlock.className = "markdown-pre";

  Quill.register("modules/qwilShortcuts", QwilShortcuts);

  React.useEffect(() => {
    Editor.quill = new Quill(editorRef.current, {
      modules: {
        toolbar: {
          container: props.toolbar.current
        },
        keyboard: {
          bindings: {
            shiftEnter: {
              key: 13,
              shiftKey: true,
              handler: range => {
                Editor.quill.insertEmbed(
                  range.index,
                  "smartbreak",
                  true,
                  "user"
                );
                Editor.quill.setSelection(range.index + 1, "silent");
                return true;
              }
            },
            backspace: {
              key: "backspace",
              collapsed: true,
              format: ["custom-pre", "code", "code-block"],
              handler: (range, offset) => {
                if (!offset.prefix) {
                  const currentFormat = Editor.quill.getFormat(range.index);
                  if (currentFormat.code) {
                    Editor.quill.formatText(range.index - 1, 2, {
                      code: false
                    });
                  }

                  if (currentFormat["code-block"]) {
                    const index =
                      range.index > 0 ? range.index - 1 : range.index;
                    Editor.quill.removeFormat(index, range.length, {
                      "code-block": false
                    });
                  }
                }
                return true;
              }
            }
          }
        },
        qwilShortcuts: {}
      },
      placeholder: "Type your message here"
    });

    Editor.quill.on("text-change", () => {
      if (props.maxLength) {
        if (Editor.quill.getText().length > props.maxLength) {
          Editor.quill.deleteText(
            props.maxLength - 1,
            Editor.quill.getText().length
          );
        }
      }
    });
  });

  return <div ref={editorRef}></div>;
}

export default Editor;

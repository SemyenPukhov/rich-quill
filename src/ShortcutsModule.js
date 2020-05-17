class QwilShortcuts {
  constructor(quill) {
    this.quill = quill;
    this.quill.on("text-change", this.onChange(this));
  }

  matches = [
    {
      name: "code",
      pattern: /(?:`){1}([^`]+)(?:`){1}/g,
      action: (text, selection, pattern, lineStart) => {
        let match = pattern.exec(text);
        const annotatedText = match[0];
        const matchedText = match[1];
        const startIndex = lineStart + match.index;
        const range = { index: startIndex + 1, length: matchedText.length };
        const formatInsideMatch = this.quill.getFormat(range);

        this.quill.deleteText(startIndex, annotatedText.length, "silent");
        this.quill.insertText(
          startIndex,
          matchedText,
          { ...formatInsideMatch, code: true },
          "silent"
        );
        this.quill.format("code", false);
      }
    },
    {
      name: "code-block",
      pattern: /`{3}(.*)(`{3})?/g,
      skipPaste: true,
      action: (text, selection, pattern, lineStart) => {
        const matchedTextStart = text.indexOf("```");
        const currentFormat = this.quill.getFormat(matchedTextStart);

        if (matchedTextStart > 0) {
          if ("code-block" in currentFormat) {
            return;
          }
          this.quill.deleteText(matchedTextStart, 3);

          const selection = this.quill.getSelection();
          this.quill.insertText(selection.index, "\n");
          setTimeout(() => {
            this.quill.setSelection({
              index: selection.index + 1,
              length: selection.length
            });
            const s = this.quill.getSelection();
            this.quill.formatLine(
              s.index,
              this.quill.getText(s.index).length,
              "code-block",
              true
            );
          }, 0);
        } else {
          if ("code-block" in currentFormat) {
            return;
          }
          this.quill.formatLine(
            0,
            this.quill.getText().length,
            "code-block",
            true
          );
          this.quill.deleteText(0, 3);
        }
      }
    },
    {
      name: "bold",
      pattern: /(?:\*){2}([^*]+)(?:\*){2}/g,
      action: (text, selection, pattern, lineStart) => {
        let match = pattern.exec(text);
        const annotatedText = match[0];
        const matchedText = match[1];
        const startIndex = lineStart + match.index;

        const range = {
          index: startIndex + 2,
          length: matchedText.length
        };
        const formatInsideMatch = this.quill.getFormat(range);
        if (text.match(/^([*_ \n]+)$/g)) return;
        this.quill.deleteText(startIndex, annotatedText.length);
        this.quill.insertText(startIndex, matchedText, {
          ...formatInsideMatch,
          bold: true
        });
        this.quill.format("bold", false);
      }
    },
    {
      name: "italic",
      pattern: /\b(?:_){1}([^_]+)(?:_){1}/g,
      action: (text, selection, pattern, lineStart) => {
        let match = pattern.exec(text);
        const annotatedText = match[0];
        const matchedText = match[1];
        const startIndex = lineStart + match.index;

        const range = {
          index: startIndex + 1,
          length: matchedText.length
        };
        const formatInsideMatch = this.quill.getFormat(range);

        if (text.match(/^([*_ \n]+)$/g)) return;

        this.quill.deleteText(startIndex, annotatedText.length);
        this.quill.insertText(startIndex, matchedText, {
          ...formatInsideMatch,
          italic: true
        });
        this.quill.format("italic", false);
      }
    },
    {
      name: "strikethrough",
      pattern: /(?:~){2}([^~]+)(?:~){2}/g,
      action: (text, selection, pattern, lineStart) => {
        let match = pattern.exec(text);

        const annotatedText = match[0];
        const matchedText = match[1];
        const startIndex = lineStart + match.index;
        const range = {
          index: startIndex + 2,
          length: matchedText.length
        };
        const formatInsideMatch = this.quill.getFormat(range);
        if (text.match(/^([*_ \n]+)$/g)) return;

        setTimeout(() => {
          this.quill.deleteText(startIndex, annotatedText.length);
          this.quill.insertText(startIndex, matchedText, {
            ...formatInsideMatch,
            strike: true
          });
          this.quill.format("strike", false);
        }, 0);
      }
    }
  ];

  handleChange(isPaste) {
    this.changeHandler.call(this, isPaste);
  }

  changeHandler(isPaste) {
    setTimeout(() => {
      const selection = this.quill.getSelection();
      if (!selection) return;

      const [line, offset] = this.quill.getLine(selection.index);
      const text = line.domNode.textContent + " ";
      const lineStart = selection.index - offset;

      selection.length = selection.index++;

      if (this.isValid(text)) {
        for (let match of this.matches) {
          const matchedText = text.match(match.pattern);
          if (matchedText) {
            if (isPaste) {
              if (!match.skipPaste) {
                match.action(text, selection, match.pattern, lineStart);
              }
            } else {
              match.action(text, selection, match.pattern, lineStart);
            }
            return;
          }
        }
      }
    }, 0);
  }

  handleChange = this.handleChange.bind(this);

  isValid(text, tagName) {
    return typeof text !== "undefined" && text;
  }

  onChange(_this) {
    return function (delta, oldContents, source) {
      if (source === "api") {
        return;
      }
      for (let i = 0; i < delta.ops.length; i++) {
        if (delta.ops[i].hasOwnProperty("insert")) {
          const regex = new RegExp(/\*|~|_|`/g);
          const isPaste = delta.ops[i].insert.length > 1;
          if (isPaste) {
            return;
          }

          if (regex.test(delta.ops[i].insert)) {
            _this.handleChange(isPaste);
          }
        }
      }
    };
  }
}

export default QwilShortcuts;

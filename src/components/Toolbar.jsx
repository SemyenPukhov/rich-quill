import React from "react";

const toolbarBtuttons = [
  {
    label: "BOLD",
    className: "ql-bold toolbar-btn",
    icon: "fas fa-bold"
  },
  {
    label: "ITALIC",
    className: "ql-italic toolbar-btn",
    icon: "fas fa-italic"
  },
  {
    label: "STRIKE",
    className: "ql-strike toolbar-btn",
    icon: "fas fa-strikethrough"
  },
  {
    label: "code",
    className: "ql-code toolbar-btn",
    icon: "fas fa-code"
  },
  {
    label: "CODE-BLOCK",
    className: "ql-code-block toolbar-btn",
    icon: "far fa-file-code"
  }
];

const Toolbar = React.forwardRef(function (props, ref) {
  return (
    <div ref={ref}>
      {toolbarBtuttons.map(({ label, className, icon }, i) => {
        return (
          <button key={i} className={`${className}`}>
            {icon ? <i className={icon}></i> : label}
          </button>
        );
      })}
    </div>
  );
});

export default Toolbar;

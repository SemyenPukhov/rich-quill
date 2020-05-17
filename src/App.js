import React, { useRef } from "react";
import "./App.css";
import Toolbar from "./components/Toolbar";
import Editor from "./components/Editor";

function App() {
  const toolbarRef = useRef();
  return (
    <div className="App">
      <div>
        <Editor toolbar={toolbarRef} />
        <Toolbar ref={toolbarRef} />
      </div>
    </div>
  );
}

export default App;

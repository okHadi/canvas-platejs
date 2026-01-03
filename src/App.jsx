import { useState } from "react";
import "./index.css";
import SlideEditor from "./components/SlideEditor";
import CanvasSlide from "./components/CanvasSlide";

function App() {
  const [mode, setMode] = useState("canvas"); // 'template' or 'canvas'

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Plate.js PPTX Slide Editor</h1>
        <p>A POC demonstrating editable slide creation with Slate.js</p>
      </header>

      {/* Mode Switcher */}
      <div className="mode-switcher">
        <button
          className={`mode-btn ${mode === "template" ? "active" : ""}`}
          onClick={() => setMode("template")}
        >
          📋 Template Mode
        </button>
        <button
          className={`mode-btn ${mode === "canvas" ? "active" : ""}`}
          onClick={() => setMode("canvas")}
        >
          🎨 Canvas Mode
        </button>
      </div>

      {/* Render based on mode */}
      {mode === "template" ? <SlideEditor /> : <CanvasSlide />}
    </div>
  );
}

export default App;

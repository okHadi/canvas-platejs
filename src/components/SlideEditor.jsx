import { useState, useMemo, useCallback } from "react";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
  Node,
} from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import escapeHtml from "escape-html";
import { allTemplates } from "../templates";

// ========================================
// HTML Serialization
// ========================================

const serializeToHtml = (nodes) => {
  return nodes.map((n) => serializeNode(n)).join("");
};

const serializeNode = (node) => {
  if ("text" in node) {
    let text = escapeHtml(node.text);
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    return text;
  }

  const children = node.children.map((n) => serializeNode(n)).join("");

  switch (node.type) {
    case "heading-one":
      return `<h1>${children}</h1>`;
    case "heading-two":
      return `<h2>${children}</h2>`;
    case "bulleted-list":
      return `<ul>${children}</ul>`;
    case "numbered-list":
      return `<ol>${children}</ol>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "image":
      return `<img src="${escapeHtml(node.url)}" alt="${escapeHtml(
        node.alt || ""
      )}" />`;
    case "paragraph":
    default:
      return `<p>${children}</p>`;
  }
};

// ========================================
// Custom Elements
// ========================================

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  return <span {...attributes}>{children}</span>;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "image":
      return (
        <div {...attributes} contentEditable={false} className="image-element">
          <img src={element.url} alt={element.alt || ""} />
          {children}
        </div>
      );
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// ========================================
// Editor Helpers
// ========================================

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  try {
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });
    return !!match;
  } catch {
    return false;
  }
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });

  const newProperties = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const insertImage = (editor, url) => {
  const image = { type: "image", url, children: [{ text: "" }] };
  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  });
};

// Custom withImages plugin
const withImages = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };
  return editor;
};

// ========================================
// Toolbar Components
// ========================================

const MarkButton = ({ format, icon, title }) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <button
      className={`toolbar-btn ${format} ${isActive ? "active" : ""}`}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

const BlockButton = ({ format, icon, title }) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  return (
    <button
      className={`toolbar-btn ${isActive ? "active" : ""}`}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

const ImageButton = () => {
  const editor = useSlate();

  const handleInsertImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      insertImage(editor, url);
    }
  };

  return (
    <button
      className="toolbar-btn"
      title="Insert Image"
      onMouseDown={(e) => {
        e.preventDefault();
        handleInsertImage();
      }}
    >
      🖼️
    </button>
  );
};

// Full Toolbar Component
const Toolbar = () => {
  return (
    <div className="full-toolbar">
      <div className="toolbar-group">
        <MarkButton format="bold" icon="B" title="Bold (⌘+B)" />
        <MarkButton format="italic" icon="I" title="Italic (⌘+I)" />
        <MarkButton format="underline" icon="U" title="Underline (⌘+U)" />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <BlockButton format="heading-one" icon="H1" title="Heading 1" />
        <BlockButton format="heading-two" icon="H2" title="Heading 2" />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <BlockButton format="bulleted-list" icon="•" title="Bullet List" />
        <BlockButton format="numbered-list" icon="1." title="Numbered List" />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ImageButton />
      </div>
    </div>
  );
};

// ========================================
// Code Panel Component
// ========================================

const CodePanel = ({
  htmlSource,
  slateContent,
  liveHtml,
  isVisible,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState("html");

  const slateJson = JSON.stringify(slateContent, null, 2);

  const getContent = () => {
    switch (activeTab) {
      case "html":
        return htmlSource;
      case "slate":
        return slateJson;
      case "live":
        return liveHtml;
      default:
        return htmlSource;
    }
  };

  return (
    <div className="html-code-section">
      <button className="code-toggle-btn" onClick={onToggle}>
        <span className="code-icon">{"</>"}</span>
        <span>{isVisible ? "Hide Code" : "View Code"}</span>
        <span className={`arrow ${isVisible ? "up" : "down"}`}>▼</span>
      </button>
      {isVisible && (
        <div className="html-code-panel">
          <div className="code-tabs">
            <button
              className={`code-tab ${activeTab === "html" ? "active" : ""}`}
              onClick={() => setActiveTab("html")}
            >
              Original HTML
            </button>
            <button
              className={`code-tab ${activeTab === "slate" ? "active" : ""}`}
              onClick={() => setActiveTab("slate")}
            >
              Slate JSON
            </button>
            <button
              className={`code-tab ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              Live HTML ✨
            </button>
            <button
              className="copy-btn"
              onClick={() => navigator.clipboard.writeText(getContent())}
            >
              Copy
            </button>
          </div>
          <pre className="html-code">
            <code>{getContent()}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

// ========================================
// Template Card Component
// ========================================

const TemplateCard = ({ template, isSelected, onClick }) => (
  <button
    className={`template-card ${isSelected ? "selected" : ""}`}
    onClick={onClick}
    style={{ "--template-bg": template.style.background }}
  >
    <div className="template-thumbnail">{template.thumbnail}</div>
    <div className="template-info">
      <span className="template-name">{template.name}</span>
      <span className="template-desc">{template.description}</span>
    </div>
  </button>
);

// ========================================
// Single Slide Canvas
// ========================================

const SlideCanvas = ({ template, slideIndex }) => {
  // Create editors with plugins
  const titleEditor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );
  const subtitleEditor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );
  const contentEditor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );

  const [titleValue, setTitleValue] = useState(
    template.areas.title?.defaultContent || [
      { type: "paragraph", children: [{ text: "" }] },
    ]
  );
  const [subtitleValue, setSubtitleValue] = useState(
    template.areas.subtitle?.defaultContent || [
      { type: "paragraph", children: [{ text: "" }] },
    ]
  );
  const [contentValue, setContentValue] = useState(
    template.areas.content?.defaultContent || [
      { type: "paragraph", children: [{ text: "" }] },
    ]
  );

  const [activeArea, setActiveArea] = useState(null);
  const [showCode, setShowCode] = useState(false);

  // Generate live HTML from current content
  const generateLiveHtml = () => {
    const parts = [];
    parts.push(
      `<div class="slide ${template.id}" style="background: ${template.style.background};">`
    );

    if (template.areas.title && titleValue) {
      parts.push(`  <div class="slide-title">`);
      parts.push(`    ${serializeToHtml(titleValue)}`);
      parts.push(`  </div>`);
    }
    if (template.areas.subtitle && subtitleValue) {
      parts.push(`  <div class="slide-subtitle">`);
      parts.push(`    ${serializeToHtml(subtitleValue)}`);
      parts.push(`  </div>`);
    }
    if (template.areas.content && contentValue) {
      parts.push(`  <div class="slide-content">`);
      parts.push(`    ${serializeToHtml(contentValue)}`);
      parts.push(`  </div>`);
    }

    parts.push(`</div>`);
    return parts.join("\n");
  };

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const renderElement = useCallback((props) => <Element {...props} />, []);

  const handleKeyDown = (editor) => (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    switch (event.key) {
      case "b":
        event.preventDefault();
        toggleMark(editor, "bold");
        break;
      case "i":
        event.preventDefault();
        toggleMark(editor, "italic");
        break;
      case "u":
        event.preventDefault();
        toggleMark(editor, "underline");
        break;
    }
  };

  const isImageSlide = template.layout === "two-column";
  const isQuoteSlide = template.layout === "centered";

  // Get current active editor for toolbar context
  const getActiveEditor = () => {
    switch (activeArea) {
      case "title":
        return titleEditor;
      case "subtitle":
        return subtitleEditor;
      case "content":
        return contentEditor;
      default:
        return contentEditor;
    }
  };

  return (
    <div className="slide-card">
      <div className="slide-header">
        <span className="slide-number">Slide {slideIndex + 1}</span>
        <span className="slide-template-name">{template.name}</span>
      </div>

      {/* Code Panel */}
      <CodePanel
        htmlSource={template.htmlSource}
        slateContent={{
          title: titleValue,
          subtitle: subtitleValue,
          content: contentValue,
        }}
        liveHtml={generateLiveHtml()}
        isVisible={showCode}
        onToggle={() => setShowCode(!showCode)}
      />

      {/* Toolbar with active editor context */}
      <Slate
        editor={getActiveEditor()}
        initialValue={[{ type: "paragraph", children: [{ text: "" }] }]}
      >
        <div className="editor-toolbar-container">
          <Toolbar />
          <span className="edit-indicator">
            {activeArea ? `Editing: ${activeArea}` : "Click an area to edit"}
          </span>
        </div>
      </Slate>

      {/* Slide Canvas */}
      <div
        className={`slide-canvas ${isImageSlide ? "two-column" : ""} ${
          isQuoteSlide ? "centered" : ""
        }`}
        style={{ background: template.style.background }}
      >
        {/* Title Area */}
        {template.areas.title && (
          <div
            className="slide-title-area"
            onClick={() => setActiveArea("title")}
          >
            <Slate
              editor={titleEditor}
              initialValue={titleValue}
              onChange={setTitleValue}
            >
              <Editable
                className={`plate-editor ${template.areas.title.className} ${
                  activeArea === "title" ? "active-area" : ""
                }`}
                renderLeaf={renderLeaf}
                renderElement={renderElement}
                placeholder={template.areas.title.placeholder}
                onKeyDown={handleKeyDown(titleEditor)}
                onFocus={() => setActiveArea("title")}
              />
            </Slate>
          </div>
        )}

        {/* Subtitle Area */}
        {template.areas.subtitle && (
          <div
            className={`slide-subtitle-area ${
              isQuoteSlide ? "quote-area" : ""
            }`}
            onClick={() => setActiveArea("subtitle")}
          >
            <Slate
              editor={subtitleEditor}
              initialValue={subtitleValue}
              onChange={setSubtitleValue}
            >
              <Editable
                className={`plate-editor ${template.areas.subtitle.className} ${
                  activeArea === "subtitle" ? "active-area" : ""
                }`}
                renderLeaf={renderLeaf}
                renderElement={renderElement}
                placeholder={template.areas.subtitle.placeholder}
                onKeyDown={handleKeyDown(subtitleEditor)}
                onFocus={() => setActiveArea("subtitle")}
              />
            </Slate>
          </div>
        )}

        {/* Content Area */}
        {isImageSlide ? (
          <div className="two-column-wrapper">
            {template.areas.content && (
              <div
                className="slide-content-area"
                onClick={() => setActiveArea("content")}
              >
                <Slate
                  editor={contentEditor}
                  initialValue={contentValue}
                  onChange={setContentValue}
                >
                  <Editable
                    className={`plate-editor ${
                      template.areas.content.className
                    } ${activeArea === "content" ? "active-area" : ""}`}
                    renderLeaf={renderLeaf}
                    renderElement={renderElement}
                    placeholder={template.areas.content.placeholder}
                    onKeyDown={handleKeyDown(contentEditor)}
                    onFocus={() => setActiveArea("content")}
                  />
                </Slate>
              </div>
            )}
            {template.areas.image && (
              <div className="image-placeholder-area">
                <div className="image-placeholder">
                  <span>🖼️</span>
                  <span>Image Area</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          template.areas.content && (
            <div
              className={`slide-content-area ${
                isQuoteSlide ? "attribution-area" : ""
              }`}
              onClick={() => setActiveArea("content")}
            >
              <Slate
                editor={contentEditor}
                initialValue={contentValue}
                onChange={setContentValue}
              >
                <Editable
                  className={`plate-editor ${
                    template.areas.content.className
                  } ${activeArea === "content" ? "active-area" : ""}`}
                  renderLeaf={renderLeaf}
                  renderElement={renderElement}
                  placeholder={template.areas.content.placeholder}
                  onKeyDown={handleKeyDown(contentEditor)}
                  onFocus={() => setActiveArea("content")}
                />
              </Slate>
            </div>
          )
        )}

        {/* Footer */}
        <div className="slide-footer">
          <span>Plate.js POC</span>
          <span>Slide {slideIndex + 1}</span>
        </div>
      </div>
    </div>
  );
};

// ========================================
// Main SlideEditor Component
// ========================================

export default function SlideEditor() {
  const [selectedTemplates, setSelectedTemplates] = useState([allTemplates[0]]);

  const toggleTemplate = (template) => {
    setSelectedTemplates((prev) => {
      const isSelected = prev.some((t) => t.id === template.id);
      if (isSelected) {
        if (prev.length === 1) return prev;
        return prev.filter((t) => t.id !== template.id);
      } else {
        return [...prev, template];
      }
    });
  };

  return (
    <div className="slide-editor-container">
      {/* Template Selector */}
      <div className="template-selector">
        <div className="selector-header">
          <h3>Select Templates</h3>
          <div className="selector-actions">
            <button
              className="action-btn"
              onClick={() => setSelectedTemplates([...allTemplates])}
            >
              Add All
            </button>
            <button
              className="action-btn"
              onClick={() => setSelectedTemplates([allTemplates[0]])}
            >
              Clear
            </button>
          </div>
        </div>
        <div className="template-grid">
          {allTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplates.some((t) => t.id === template.id)}
              onClick={() => toggleTemplate(template)}
            />
          ))}
        </div>
        <div className="selected-count">
          {selectedTemplates.length} slide
          {selectedTemplates.length !== 1 ? "s" : ""} selected
        </div>
      </div>

      {/* Slides */}
      <div className="slides-container">
        {selectedTemplates.map((template, index) => (
          <SlideCanvas
            key={`${template.id}-${index}`}
            template={template}
            slideIndex={index}
          />
        ))}
      </div>
    </div>
  );
}

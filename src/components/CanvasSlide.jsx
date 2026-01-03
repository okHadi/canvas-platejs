import { useState, useMemo, useCallback } from "react";
import { Rnd } from "react-rnd";
import {
  createEditor,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import { Slate, Editable, withReact, useSlate } from "slate-react";
import { withHistory } from "slate-history";
import escapeHtml from "escape-html";

// ========================================
// HTML Serialization
// ========================================

const serializeToHtml = (nodes) => nodes.map((n) => serializeNode(n)).join("");

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
    case "list-item":
      return `<li>${children}</li>`;
    default:
      return `<p>${children}</p>`;
  }
};

// ========================================
// Slate Rendering
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
    case "list-item":
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// ========================================
// Editor Helpers
// ========================================

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
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
  const isList = format === "bulleted-list";

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === "bulleted-list",
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    Transforms.wrapNodes(editor, { type: format, children: [] });
  }
};

// ========================================
// Toolbar Component
// ========================================

const BlockToolbar = ({ editor }) => {
  const MarkBtn = ({ format, icon }) => (
    <button
      className={`block-toolbar-btn ${
        isMarkActive(editor, format) ? "active" : ""
      }`}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </button>
  );

  const BlockBtn = ({ format, icon }) => (
    <button
      className={`block-toolbar-btn ${
        isBlockActive(editor, format) ? "active" : ""
      }`}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </button>
  );

  return (
    <div className="block-toolbar">
      <MarkBtn format="bold" icon="B" />
      <MarkBtn format="italic" icon="I" />
      <MarkBtn format="underline" icon="U" />
      <div className="toolbar-sep" />
      <BlockBtn format="heading-one" icon="H1" />
      <BlockBtn format="heading-two" icon="H2" />
      <BlockBtn format="bulleted-list" icon="•" />
    </div>
  );
};

// ========================================
// Editable Block Component
// ========================================

const EditableBlock = ({ block, isSelected, onSelect, onUpdate, onDelete }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [showToolbar, setShowToolbar] = useState(false);

  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const renderElement = useCallback((props) => <Element {...props} />, []);

  const handleKeyDown = (event) => {
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

  return (
    <Rnd
      className={`canvas-block ${isSelected ? "selected" : ""}`}
      default={{
        x: block.x,
        y: block.y,
        width: block.width,
        height: block.height,
      }}
      bounds="parent"
      onDragStop={(e, d) => {
        onUpdate({ ...block, x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdate({
          ...block,
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
          x: position.x,
          y: position.y,
        });
      }}
      onClick={() => onSelect(block.id)}
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {/* Delete Button */}
      <button
        className="block-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(block.id);
        }}
      >
        ×
      </button>

      {/* Inline Toolbar */}
      {showToolbar && <BlockToolbar editor={editor} />}

      {/* Slate Editor */}
      <div className="block-content">
        <Slate
          editor={editor}
          initialValue={block.content}
          onChange={(value) => onUpdate({ ...block, content: value })}
        >
          <Editable
            className="block-editor"
            renderLeaf={renderLeaf}
            renderElement={renderElement}
            placeholder="Type here..."
            onKeyDown={handleKeyDown}
          />
        </Slate>
      </div>
    </Rnd>
  );
};

// ========================================
// Add Block Menu
// ========================================

const AddBlockMenu = ({ onAdd, position, onClose }) => {
  const blockTypes = [
    { type: "text", label: "Text Block", icon: "📝" },
    { type: "heading", label: "Heading", icon: "📌" },
    { type: "list", label: "Bullet List", icon: "📋" },
    { type: "quote", label: "Quote", icon: "💬" },
  ];

  const getDefaultContent = (type) => {
    switch (type) {
      case "heading":
        return [{ type: "heading-one", children: [{ text: "Heading" }] }];
      case "list":
        return [
          {
            type: "bulleted-list",
            children: [
              { type: "list-item", children: [{ text: "Item 1" }] },
              { type: "list-item", children: [{ text: "Item 2" }] },
            ],
          },
        ];
      case "quote":
        return [
          {
            type: "paragraph",
            children: [{ text: '"Add your quote here..."', italic: true }],
          },
        ];
      default:
        return [{ type: "paragraph", children: [{ text: "New text block" }] }];
    }
  };

  return (
    <div
      className="add-block-menu"
      style={{ left: position.x, top: position.y }}
    >
      <div className="menu-header">
        <span>Add Block</span>
        <button className="menu-close" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="menu-items">
        {blockTypes.map(({ type, label, icon }) => (
          <button
            key={type}
            className="menu-item"
            onClick={() => {
              onAdd(type, getDefaultContent(type), position);
              onClose();
            }}
          >
            <span className="menu-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ========================================
// Main Canvas Slide Component
// ========================================

export default function CanvasSlide() {
  const [blocks, setBlocks] = useState([
    {
      id: "title-1",
      x: 40,
      y: 40,
      width: 720,
      height: 80,
      content: [
        { type: "heading-one", children: [{ text: "Presentation Title" }] },
      ],
    },
    {
      id: "subtitle-1",
      x: 40,
      y: 140,
      width: 720,
      height: 50,
      content: [
        {
          type: "paragraph",
          children: [
            { text: "Click anywhere to add blocks. Drag to reposition." },
          ],
        },
      ],
    },
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showCode, setShowCode] = useState(false);

  const addBlock = (type, content, position) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      x: position.x,
      y: position.y,
      width: 400,
      height: type === "heading" ? 60 : 100,
      content,
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (updatedBlock) => {
    setBlocks(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only show menu if clicking on empty space
    if (e.target.classList.contains("slide-canvas-area")) {
      setMenuPosition({ x, y });
      setShowAddMenu(true);
    }
  };

  // Generate HTML from all blocks
  const generateHtml = () => {
    const html = blocks
      .map((block) => {
        const content = serializeToHtml(block.content);
        return `<div style="position: absolute; left: ${block.x}px; top: ${block.y}px; width: ${block.width}px;">\n  ${content}\n</div>`;
      })
      .join("\n\n");

    return `<div class="slide" style="position: relative; width: 800px; height: 600px; background: linear-gradient(135deg, #1a1a2e, #16213e);">\n${html}\n</div>`;
  };

  return (
    <div className="canvas-container">
      {/* Header */}
      <div className="canvas-header">
        <h2>Canvas Slide Editor</h2>
        <div className="canvas-actions">
          <button
            className="action-btn primary"
            onClick={() => {
              setMenuPosition({ x: 100, y: 300 });
              setShowAddMenu(true);
            }}
          >
            + Add Block
          </button>
          <button className="action-btn" onClick={() => setShowCode(!showCode)}>
            {showCode ? "Hide Code" : "View HTML"}
          </button>
        </div>
      </div>

      {/* Code Panel */}
      {showCode && (
        <div className="code-output-panel">
          <div className="code-output-header">
            <span>Generated HTML</span>
            <button
              onClick={() => navigator.clipboard.writeText(generateHtml())}
            >
              Copy
            </button>
          </div>
          <pre>
            <code>{generateHtml()}</code>
          </pre>
        </div>
      )}

      {/* Canvas */}
      <div
        className="slide-canvas-area"
        onClick={handleCanvasClick}
        style={{
          background:
            "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        {blocks.map((block) => (
          <EditableBlock
            key={block.id}
            block={block}
            isSelected={selectedBlockId === block.id}
            onSelect={setSelectedBlockId}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
          />
        ))}

        {/* Add Block Menu */}
        {showAddMenu && (
          <AddBlockMenu
            position={menuPosition}
            onAdd={addBlock}
            onClose={() => setShowAddMenu(false)}
          />
        )}

        {/* Click hint */}
        {blocks.length === 0 && (
          <div className="empty-canvas-hint">Click anywhere to add a block</div>
        )}
      </div>

      {/* Block count */}
      <div className="canvas-footer">
        {blocks.length} block{blocks.length !== 1 ? "s" : ""} • Click canvas to
        add • Drag to move • Corners to resize
      </div>
    </div>
  );
}

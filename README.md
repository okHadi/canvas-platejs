# Canvas Plate.js Editor

A PowerPoint-like slide editor with draggable, resizable blocks and rich-text editing.

## Demo

🔗 **Live:** [https://okHadi.github.io/canvas-platejs/](https://okHadi.github.io/canvas-platejs/)

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BLOCK STATE                              │
│  blocks = [{ id, x, y, width, height, content: SlateNodes[] }]  │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐    ┌────────────┐    ┌─────────────┐
    │  react-rnd  │    │  Slate.js  │    │ Serializer  │
    │  (position) │    │   (text)   │    │   (HTML)    │
    └─────────────┘    └────────────┘    └─────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
     x, y, width         Rich text         HTML output
     height              content           with absolute
                                           positioning
```

## Libraries

### react-rnd

Wraps each block for drag + resize.

```jsx
<Rnd
  default={{ x: 40, y: 40, width: 300, height: 100 }}
  bounds="parent"
  onDragStop={(e, d) => updatePosition(d.x, d.y)}
  onResizeStop={(e, dir, ref, delta, pos) => updateSize(ref.style.width)}
>
  {children}
</Rnd>
```

### Slate.js

Each block contains an independent Slate editor for rich-text.

```jsx
// Slate stores content as a tree of nodes
content: [
  { type: 'paragraph', children: [{ text: 'Hello', bold: true }] }
]

// Rendering
<Slate editor={editor} initialValue={content} onChange={setContent}>
  <Editable renderLeaf={...} renderElement={...} />
</Slate>
```

### HTML Serialization

Converts Slate nodes → HTML with positions.

```javascript
// Input: Block state
{ x: 40, y: 40, width: 300, content: [{ type: 'paragraph', children: [...] }] }

// Output: Absolute-positioned HTML
<div style="position: absolute; left: 40px; top: 40px; width: 300px;">
  <p>Hello</p>
</div>
```

## Quick Start

```bash
npm install
npm run dev
```

## Stack

| Library                                                  | Purpose           |
| -------------------------------------------------------- | ----------------- |
| [react-rnd](https://github.com/bokuweb/react-rnd)        | Drag & resize     |
| [Slate.js](https://www.slatejs.org/)                     | Rich-text editing |
| [escape-html](https://www.npmjs.com/package/escape-html) | Safe HTML output  |
| Vite + React                                             | Build & UI        |

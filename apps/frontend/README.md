# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


 📋 Architecture Assessment Summary:

  Your architecture is well-designed and properly implemented for storing React UI as JSON using
  UIComponentSchema. Here's the complete flow:

  JSON Storage → React Conversion Flow:

  1. Database stores UIComponent JSON directly in DSL column
  2. Editor-SSE manages UIComponent state and passes to renderer
  3. UI-Renderer-2 converts JSON structure to React elements:
    - UIComponent.render → JSX structure
    - UIComponent.data → data binding context
    - Recursive rendering of nested UIElements/UIComponents
  4. UseNodeSelection enables editing of the JSON structure through UI interaction

  Key Strengths:

  - ✅ Proper separation: UIComponent (component) vs UIElement (JSX element)
  - ✅ Flexible children: Can handle strings, UIElements, nested UIComponents
  - ✅ Data binding: {{expressions}} work with component data
  - ✅ Selection system: Can navigate and edit any part of the JSON structure
  - ✅ Type safety: Full TypeScript support for the schema

  The architecture correctly represents:

  - React Components → UIComponent with render, data, props, etc.
  - JSX Elements → UIElement with type, props, children
  - Nested structures → Recursive children arrays
  - Data binding → {{expression}} syntax with component data

  in figma editor when we designed something in the canvas. we see the json structure on left side 
  . and users can move things or frames through arrow keys . so can you list me all the 
  interactions users do to move things in figma editor. give me with what keyboard key events they 
  are doing things

● Here are the key keyboard interactions users can perform in Figma to move objects and frames:

  Movement Controls

  - Arrow Keys - Move selected object 1px in direction
  - Shift + Arrow Keys - Move selected object 10px in direction
  - Alt/Option + Arrow Keys - Duplicate and move object 1px
  - Shift + Alt/Option + Arrow Keys - Duplicate and move object 10px

  Selection & Navigation

  - Tab - Select next object in layer order
  - Shift + Tab - Select previous object in layer order
  - Enter - Enter selected frame/group
  - Shift + Enter - Exit current frame/group
  - Cmd/Ctrl + Click - Add/remove from selection
  - Shift + Click - Select range of objects

  Positioning

  - Cmd/Ctrl + D - Duplicate selection in place
  - Cmd/Ctrl + Shift + H - Show/hide selection
  - Cmd/Ctrl + G - Group selection
  - Cmd/Ctrl + Shift + G - Ungroup selection

  Alignment (via keyboard shortcuts)

  - Alt/Option + A - Align left
  - Alt/Option + D - Align right
  - Alt/Option + W - Align top
  - Alt/Option + S - Align bottom
  - Alt/Option + H - Align horizontal centers
  - Alt/Option + V - Align vertical centers

  Layer Manipulation

  - Cmd/Ctrl + ] - Bring forward
  - Cmd/Ctrl + [ - Send backward
  - Cmd/Ctrl + Shift + ] - Bring to front
  - Cmd/Ctrl + Shift + [ - Send to back

  Canvas Navigation

  - Space + Drag - Pan canvas
  - Cmd/Ctrl + 0 - Zoom to fit
  - Cmd/Ctrl + 1 - Zoom to 100%
  - Cmd/Ctrl + +/- - Zoom in/out

  These keyboard events allow precise control over object positioning and layer management in the
   Figma editor interface.
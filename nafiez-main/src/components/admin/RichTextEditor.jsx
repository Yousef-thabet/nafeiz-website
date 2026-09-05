import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions: () => ({ types: ['textStyle'] }),
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize || null,
          renderHTML: (attributes) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {},
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
    };
  },
});

export default function RichTextEditor({ value, onChange, dir = 'ltr', onImageUpload }) {
  const fileInput = useRef(null);
  const fontSizeSelection = useRef(null);
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false, underline: false }), Underline, TextStyle, FontSize, TextAlign.configure({ types: ['heading', 'paragraph'] }), Link.configure({ protocols: ['http', 'https'], openOnClick: false }), Image.configure({ allowBase64: false })],
    content: value || '',
    onUpdate: ({ editor: nextEditor }) => onChange(nextEditor.getHTML()),
    editorProps: { attributes: { class: 'article-editor-content', dir } },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '', false);
  }, [editor, value]);

  if (!editor) return null;
  const keepSelection = (event) => event.preventDefault();
  const rememberFontSizeSelection = () => {
    const { from, to } = editor.state.selection;
    fontSizeSelection.current = { from, to };
  };
  const changeFontSize = (event) => {
    const fontSize = event.target.value;
    const selection = fontSizeSelection.current;
    const chain = editor.chain().focus();
    if (selection) chain.setTextSelection(selection);
    if (fontSize) chain.setMark('textStyle', { fontSize }).run();
    else chain.unsetMark('textStyle').run();
    fontSizeSelection.current = null;
  };
  const toolbarButton = (label, action, active = false) => <button type="button" onMouseDown={keepSelection} onClick={action} className={`rounded px-2 py-1 text-sm font-medium transition ${active ? 'bg-gold-400 text-slate-900' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{label}</button>;
  const addLink = () => {
    const url = window.prompt('Link URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };
  const addImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onImageUpload) return;
    const url = await onImageUpload(file);
    editor.chain().focus().setImage({ src: url }).run();
  };

  return <div className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
    <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2 dark:border-slate-700">
      {toolbarButton('B', () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
      {toolbarButton('I', () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
      {toolbarButton('U', () => editor.chain().focus().toggleUnderline().run(), editor.isActive('underline'))}
      {[1, 2, 3].map((level) => toolbarButton(`H${level}`, () => editor.chain().focus().toggleHeading({ level }).run(), editor.isActive('heading', { level })))}
      <select aria-label="Font size" defaultValue="" onMouseDown={rememberFontSizeSelection} onChange={changeFontSize} className="rounded border px-1 py-1 text-sm"><option value="">Size</option><option value="0.875rem">Small</option><option value="1rem">Normal</option><option value="1.25rem">Large</option><option value="1.5rem">XL</option></select>
      {toolbarButton('• List', () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
      {toolbarButton('1. List', () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
      {toolbarButton('Quote', () => editor.chain().focus().toggleBlockquote().run(), editor.isActive('blockquote'))}
      {['left', 'center', 'right'].map((align) => toolbarButton(align[0].toUpperCase(), () => editor.chain().focus().setTextAlign(align).run(), editor.isActive({ textAlign: align })))}
      {toolbarButton('Link', addLink, editor.isActive('link'))}
      {toolbarButton('Image', () => fileInput.current?.click())}
      {toolbarButton('Undo', () => editor.chain().focus().undo().run())}
      {toolbarButton('Redo', () => editor.chain().focus().redo().run())}
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={addImage} className="hidden" />
    </div>
    <EditorContent editor={editor} />
  </div>;
}
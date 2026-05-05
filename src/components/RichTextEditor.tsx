import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Node, mergeAttributes } from '@tiptap/core';
import { useState, useCallback } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, Code, Minus,
  Highlighter, Type, Palette, Info,
  Subscript as SubIcon, Superscript as SupIcon,
  ChevronDown,
} from 'lucide-react';

// Custom Callout/Info Box extension
const CalloutBox = Node.create({
  name: 'calloutBox',
  group: 'block',
  content: 'block+',
  defining: true,
  
  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-callout-type') || 'info',
        renderHTML: attributes => ({ 'data-callout-type': attributes.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-callout-type'] || 'info';
    const colorMap: Record<string, string> = {
      info: 'border-blue-400 bg-blue-50',
      success: 'border-green-400 bg-green-50',
      warning: 'border-amber-400 bg-amber-50',
      danger: 'border-red-400 bg-red-50',
    };
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-callout': '',
        class: `callout-box callout-${type} ${colorMap[type] || colorMap.info}`,
        style: `border-left: 4px solid; padding: 1rem 1.25rem; margin: 1rem 0; border-radius: 0.5rem;`,
      }),
      0,
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Toolbar button
function ToolbarBtn({ onClick, active, disabled, title, children }: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
          : 'text-industrial-600 hover:bg-industrial-200 hover:text-industrial-900'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

// Divider
function Divider() {
  return <div className="w-px h-5 bg-industrial-300 mx-0.5 flex-shrink-0"></div>;
}

// Dropdown wrapper
function Dropdown({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-0.5 p-1.5 rounded text-industrial-600 hover:bg-industrial-200 hover:text-industrial-900 transition-colors"
        title={label}
        type="button"
      >
        {icon}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-industrial-200 py-1 z-50 min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Pass close handler through children by wrapping */}
            <div onClick={() => setOpen(false)}>
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
        active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-industrial-700 hover:bg-industrial-50'
      }`}
      type="button"
    >
      {children}
    </button>
  );
}

// Link dialog
function LinkDialog({ onSubmit, onCancel, initialUrl }: { onSubmit: (url: string) => void; onCancel: () => void; initialUrl: string }) {
  const [url, setUrl] = useState(initialUrl);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-industrial-200 p-5 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-sm font-semibold text-industrial-900 mb-3">Insert Link</h3>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-industrial-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(url); if (e.key === 'Escape') onCancel(); }}
        />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-3 py-1.5 text-sm text-industrial-600 hover:text-industrial-900 rounded-md" type="button">Cancel</button>
          <button onClick={() => onSubmit(url)} className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-500 font-medium" type="button">Apply</button>
        </div>
      </div>
    </div>
  );
}

const HIGHLIGHT_COLORS = [
  { label: 'Yellow', color: '#fef08a' },
  { label: 'Green', color: '#bbf7d0' },
  { label: 'Blue', color: '#bfdbfe' },
  { label: 'Pink', color: '#fbcfe8' },
  { label: 'Orange', color: '#fed7aa' },
];

const TEXT_COLORS = [
  { label: 'Default', color: '' },
  { label: 'Red', color: '#dc2626' },
  { label: 'Blue', color: '#2563eb' },
  { label: 'Green', color: '#16a34a' },
  { label: 'Orange', color: '#ea580c' },
  { label: 'Purple', color: '#9333ea' },
  { label: 'Gray', color: '#6b7280' },
];

const MenuBar = ({ editor }: { editor: any }) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const setLink = useCallback((url: string) => {
    if (!url || !url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    }
    setShowLinkDialog(false);
  }, [editor]);

  const openLinkDialog = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || '';
    setShowLinkDialog(true);
    // Store for the dialog
    editor._linkUrl = previousUrl;
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 p-2 border border-b-0 border-industrial-300 rounded-t-md bg-gradient-to-b from-industrial-50 to-white">
        {/* Text Style Group */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} disabled={!editor.can().chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} disabled={!editor.can().chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code">
          <Code className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
          <SubIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
          <SupIcon className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Headings Dropdown */}
        <Dropdown label="Headings" icon={<Type className="w-4 h-4" />}>
          <DropdownItem onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')}>
            Normal Text
          </DropdownItem>
          <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
            <span className="text-lg font-bold">Heading 1</span>
          </DropdownItem>
          <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
            <span className="text-base font-bold">Heading 2</span>
          </DropdownItem>
          <DropdownItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
            <span className="text-sm font-semibold">Heading 3</span>
          </DropdownItem>
        </Dropdown>

        <Divider />

        {/* Text Color Dropdown */}
        <Dropdown label="Text Color" icon={<Palette className="w-4 h-4" />}>
          {TEXT_COLORS.map((tc) => (
            <DropdownItem key={tc.label} onClick={() => tc.color ? editor.chain().focus().setColor(tc.color).run() : editor.chain().focus().unsetColor().run()} active={tc.color ? editor.isActive('textStyle', { color: tc.color }) : false}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border border-industrial-300" style={{ backgroundColor: tc.color || '#1f2937' }}></div>
                {tc.label}
              </div>
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Highlight Dropdown */}
        <Dropdown label="Highlight" icon={<Highlighter className="w-4 h-4" />}>
          <DropdownItem onClick={() => editor.chain().focus().unsetHighlight().run()}>
            No Highlight
          </DropdownItem>
          {HIGHLIGHT_COLORS.map((hc) => (
            <DropdownItem key={hc.label} onClick={() => editor.chain().focus().toggleHighlight({ color: hc.color }).run()} active={editor.isActive('highlight', { color: hc.color })}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: hc.color }}></div>
                {hc.label}
              </div>
            </DropdownItem>
          ))}
        </Dropdown>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Lists & Blocks */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">
          <Code className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Divider">
          <Minus className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn onClick={openLinkDialog} active={editor.isActive('link')} title="Insert Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        {editor.isActive('link') && (
          <ToolbarBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
            <Unlink className="w-4 h-4" />
          </ToolbarBtn>
        )}

        {/* Callout Box */}
        <Dropdown label="Info Box" icon={<Info className="w-4 h-4" />}>
          <DropdownItem onClick={() => editor.chain().focus().insertContent({ type: 'calloutBox', attrs: { type: 'info' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Info: Enter your text here...' }] }] }).run()}>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-400"></div> Info Box</div>
          </DropdownItem>
          <DropdownItem onClick={() => editor.chain().focus().insertContent({ type: 'calloutBox', attrs: { type: 'success' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Success: Enter your text here...' }] }] }).run()}>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-green-400"></div> Success Box</div>
          </DropdownItem>
          <DropdownItem onClick={() => editor.chain().focus().insertContent({ type: 'calloutBox', attrs: { type: 'warning' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Warning: Enter your text here...' }] }] }).run()}>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-400"></div> Warning Box</div>
          </DropdownItem>
          <DropdownItem onClick={() => editor.chain().focus().insertContent({ type: 'calloutBox', attrs: { type: 'danger' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Important: Enter your text here...' }] }] }).run()}>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-400"></div> Danger Box</div>
          </DropdownItem>
        </Dropdown>

        <Divider />

        {/* Undo/Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          <Undo className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} title="Redo (Ctrl+Shift+Z)">
          <Redo className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <LinkDialog
          initialUrl={editor._linkUrl || ''}
          onSubmit={setLink}
          onCancel={() => setShowLinkDialog(false)}
        />
      )}


    </>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline hover:text-primary-700 cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
      Subscript,
      Superscript,
      CalloutBox,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] p-5 bg-white border border-industrial-300 rounded-b-md',
      },
    },
  });

  return (
    <div className="w-full relative">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {/* CSS for callout boxes inside the editor */}
      <style>{`
        .ProseMirror .callout-box {
          border-left: 4px solid;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          border-radius: 0.5rem;
        }
        .ProseMirror .callout-info {
          border-color: #60a5fa;
          background-color: #eff6ff;
        }
        .ProseMirror .callout-success {
          border-color: #4ade80;
          background-color: #f0fdf4;
        }
        .ProseMirror .callout-warning {
          border-color: #fbbf24;
          background-color: #fffbeb;
        }
        .ProseMirror .callout-danger {
          border-color: #f87171;
          background-color: #fef2f2;
        }
        .ProseMirror mark {
          border-radius: 0.15em;
          padding: 0.1em 0.15em;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ProseMirror code {
          background-color: #f1f5f9;
          border-radius: 0.25rem;
          padding: 0.15rem 0.35rem;
          font-size: 0.875em;
          color: #be185d;
        }
        .ProseMirror pre {
          background-color: #1e293b;
          color: #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem 1.25rem;
          font-family: 'JetBrains Mono', monospace;
          overflow-x: auto;
        }
        .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: 0.875rem;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1rem;
          color: #4b5563;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

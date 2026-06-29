'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

interface Props {
  content: string
  onChange: (html: string) => void
}

export default function TipTapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm rounded font-bold ${editor.isActive('bold') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm rounded italic ${editor.isActive('italic') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-sm rounded font-semibold ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-sm rounded font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-sm rounded font-semibold ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive('bulletList') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-sm rounded ${editor.isActive('blockquote') ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 hover:bg-gray-100'}`}
        >
          ❝
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 text-sm rounded bg-white border border-gray-300 hover:bg-gray-100"
        >
          —
        </button>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:outline-none"
      />
    </div>
  )
}

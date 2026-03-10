
"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  editable: boolean
}

export function Editor({ content, onChange, editable }: EditorProps) {
  const isFirstRender = useRef(true)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'The world is waiting for your words...',
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[70vh] font-body leading-[1.8] text-xl',
      },
    },
  })

  // Sync content from outside (other users)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Small optimization: only update if it's significantly different to avoid cursor flickering
      // In a real CRDT environment, we'd use Yjs. For this prototype, we update if not focused.
      if (!editor.isFocused) {
        editor.commands.setContent(content, false)
      }
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  if (!editor) {
    return (
      <div className="w-full h-[70vh] bg-muted/5 animate-pulse rounded-2xl border-2 border-dashed border-muted/20 flex items-center justify-center">
        <span className="text-muted-foreground font-medium">Initializing editor...</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full pb-32">
      <EditorContent editor={editor} />
    </div>
  )
}

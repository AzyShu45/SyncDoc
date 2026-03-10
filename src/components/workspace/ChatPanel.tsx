
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, FileIcon, ImageIcon, X } from "lucide-react"
import { Message, Role } from "@/lib/types"
import { format } from "date-fns"

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (text: string, file?: File) => void
  userRole: Role
}

export function ChatPanel({ messages, onSendMessage, userRole }: ChatPanelProps) {
  const [input, setInput] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canInteract = userRole !== 'VIEWER'

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || !canInteract) return
    onSendMessage(input, selectedFile || undefined)
    setInput("")
    setSelectedFile(null)
  }

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-l">
      <div className="p-4 border-b">
        <h3 className="font-headline font-bold text-lg">Document Chat</h3>
        <p className="text-xs text-muted-foreground">Collaborate in real-time</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{msg.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">{msg.userName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.timestamp), 'HH:mm')}
                  </span>
                </div>
                {msg.text && (
                  <div className="bg-secondary p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                    {msg.text}
                  </div>
                )}
                {msg.fileUrl && (
                  <div className="mt-2 border rounded-lg p-2 bg-background flex items-center gap-2 max-w-full">
                    {msg.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <ImageIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <FileIcon className="h-4 w-4 text-primary" />
                    )}
                    <a href={msg.fileUrl} target="_blank" className="text-xs truncate hover:underline text-primary">
                      {msg.fileName}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-3 bg-background/50">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-accent/10 p-2 rounded-lg text-xs">
            <Paperclip className="h-3 w-3" />
            <span className="truncate flex-1 font-medium">{selectedFile.name}</span>
            <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setSelectedFile(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={onFileSelect}
            accept="image/*,.pdf"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canInteract}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder={canInteract ? "Type a message..." : "Viewing only"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-background border-muted"
            disabled={!canInteract}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canInteract || (!input.trim() && !selectedFile)}
            className="shrink-0 rounded-full bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

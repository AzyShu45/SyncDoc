
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Paperclip, FileIcon, ImageIcon, X, Smile, MoreHorizontal } from "lucide-react"
import { Message, Role } from "@/lib/types"
import { format } from "date-fns"
import { useUser } from "@/firebase"

interface ChatPanelProps {
  messages: Message[]
  onSendMessage: (text: string, file?: File) => void
  userRole: Role
}

export function ChatPanel({ messages, onSendMessage, userRole }: ChatPanelProps) {
  const { user } = useUser()
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
    <div className="flex flex-col h-full bg-card border-l selection:bg-primary/20">
      <div className="p-6 border-b bg-muted/10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-headline font-bold text-xl tracking-tight">Collaboration</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Real-time discussion</p>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-30">
              <div className="p-4 bg-muted rounded-full inline-block">
                <Smile className="h-10 w-10" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">No messages yet</p>
            </div>
          )}
          {messages.map((msg, idx) => {
            const isMe = msg.userId === user?.uid;
            const showAvatar = idx === 0 || messages[idx-1].userId !== msg.userId;

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group animate-in slide-in-from-bottom-2`}>
                <div className="shrink-0">
                  {showAvatar ? (
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                      <AvatarImage src={`https://picsum.photos/seed/${msg.userId}/100/100`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                        {msg.userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : <div className="w-9" />}
                </div>
                <div className={`flex flex-col space-y-1 max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{msg.userName}</span>
                      <span className="text-[9px] text-muted-foreground/40 font-bold">
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </span>
                    </div>
                  )}
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted/50 rounded-tl-none border'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.fileUrl && (
                    <div className="mt-2 border rounded-xl p-3 bg-background/50 backdrop-blur-sm flex items-center gap-3 w-full shadow-inner border-dashed">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {msg.fileName?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <ImageIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <FileIcon className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <a href={msg.fileUrl} target="_blank" className="text-xs font-bold truncate hover:underline text-primary">
                        {msg.fileName}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-6 border-t space-y-4 bg-background/50 backdrop-blur-md">
        {selectedFile && (
          <div className="flex items-center gap-3 bg-primary/5 p-3 rounded-xl text-xs border border-primary/10 animate-in slide-in-from-bottom-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Paperclip className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="truncate flex-1 font-bold">{selectedFile.name}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedFile(null)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
        <div className="flex items-end gap-3">
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
            className="shrink-0 h-12 w-12 rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canInteract}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              placeholder={canInteract ? "Share your thoughts..." : "Read-only workspace"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="min-h-[48px] h-12 py-3 bg-muted/40 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium custom-scrollbar resize-none"
              disabled={!canInteract}
            />
          </div>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!canInteract || (!input.trim() && !selectedFile)}
            className="shrink-0 h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ChevronLeft, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  Users, 
  Eye, 
  Edit3, 
  Download,
  Info,
  MoreHorizontal
} from "lucide-react"
import { ChatPanel } from "@/components/workspace/ChatPanel"
import { AIPanel } from "@/components/workspace/AIPanel"
import { Role, Message, PresenceUser } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DocumentWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  
  // Real-time states
  const [title, setTitle] = useState("Untitled Document")
  const [content, setContent] = useState("")
  const [role, setRole] = useState<Role>("OWNER")
  const [messages, setMessages] = useState<Message[]>([])
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([
    { id: "1", name: "John Doe", email: "j@j.com", color: "#451B98" },
    { id: "2", name: "Sarah Smith", email: "s@s.com", color: "#5CC2D6" }
  ])
  const [rightPanel, setRightPanel] = useState<'chat' | 'ai' | 'none'>('chat')

  // UI state
  const [isSaving, setIsSaving] = useState(false)

  const handleSendMessage = (text: string, file?: File) => {
    const newMessage: Message = {
      id: Math.random().toString(36),
      documentId: id as string,
      userId: "1",
      userName: "John Doe",
      text,
      timestamp: new Date(),
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      fileName: file ? file.name : undefined
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleContentChange = (newContent: string) => {
    if (role === 'VIEWER') return
    setContent(newContent)
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 2000)
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex flex-col">
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-headline font-bold text-lg bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 w-full max-w-xs transition-all"
              disabled={role === 'VIEWER'}
            />
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                 {role === 'OWNER' && <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1 bg-primary text-white border-none">Owner</Badge>}
                 {role === 'EDITOR' && <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1">Editor</Badge>}
                 {role === 'VIEWER' && <Badge variant="outline" className="text-[9px] h-4 py-0 px-1">Viewer</Badge>}
                 <span className="opacity-50">Saved automatically</span>
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Presence */}
          <div className="flex items-center -space-x-2 mr-4">
             {activeUsers.map(user => (
               <TooltipProvider key={user.id}>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <div 
                       className="h-8 w-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-bold text-white shadow-sm"
                       style={{ backgroundColor: user.color }}
                     >
                       {user.name.substring(0, 1)}
                     </div>
                   </TooltipTrigger>
                   <TooltipContent>
                     <p className="text-xs">{user.name} ({user.role || 'Active now'})</p>
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             ))}
             <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-dashed bg-muted/20">
                <Users className="h-4 w-4" />
             </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-2" />

          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 font-bold" onClick={() => {}}>
            <Share2 className="h-4 w-4" /> Share
          </Button>

          <div className="flex border rounded-lg overflow-hidden bg-muted/30 p-1">
             <Button 
               variant={rightPanel === 'chat' ? 'secondary' : 'ghost'} 
               size="sm" 
               className="h-7 px-3 gap-2"
               onClick={() => setRightPanel(rightPanel === 'chat' ? 'none' : 'chat')}
             >
               <MessageSquare className="h-3.5 w-3.5" />
               <span className="text-xs font-bold">Chat</span>
             </Button>
             <Button 
               variant={rightPanel === 'ai' ? 'secondary' : 'ghost'} 
               size="sm" 
               className="h-7 px-3 gap-2"
               onClick={() => setRightPanel(rightPanel === 'ai' ? 'none' : 'ai')}
             >
               <Sparkles className="h-3.5 w-3.5" />
               <span className="text-xs font-bold">AI</span>
             </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
             <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Pane */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
          {isSaving && (
            <div className="absolute top-4 right-8 z-10 animate-in fade-in slide-in-from-right-2">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-accent/20 text-accent gap-1 py-1">
                <span className="h-1 w-1 rounded-full bg-accent animate-ping" />
                Syncing changes...
              </Badge>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto pt-12 pb-20 px-8 lg:px-24">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* This represents the TipTap editor UI placeholder */}
              <div className="editor-container">
                <div className="min-h-[70vh] focus:outline-none prose prose-slate max-w-none">
                  <h1 contentEditable={role !== 'VIEWER'} suppressContentEditableWarning className="outline-none empty:before:content-['Document_Title'] empty:before:text-muted-foreground/30">{title}</h1>
                  <div 
                    contentEditable={role !== 'VIEWER'} 
                    suppressContentEditableWarning
                    className="outline-none empty:before:content-['Start_writing_something_brilliant...'] empty:before:text-muted-foreground/30 min-h-[500px]"
                    onInput={(e) => handleContentChange(e.currentTarget.innerText)}
                  >
                    {content || (
                      <div className="space-y-4">
                        <p>Welcome to your new collaborative document. Here are a few things you can do:</p>
                        <ul className="list-disc pl-5 space-y-2">
                          <li>Edit this text in real-time with your team.</li>
                          <li>Use the chat on the right to discuss ideas.</li>
                          <li>Ask the AI to summarize or fix grammar.</li>
                          <li>Share the link with others to start collaborating.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Menu for Editor (Mocked) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-card border shadow-2xl rounded-full p-2 flex items-center gap-1">
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><Edit3 className="h-4 w-4" /></Button>
                 </TooltipTrigger>
                 <TooltipContent><p>Text Format</p></TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><Download className="h-4 w-4" /></Button>
                 </TooltipTrigger>
                 <TooltipContent><p>Export PDF</p></TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full"><Info className="h-4 w-4" /></Button>
                 </TooltipTrigger>
                 <TooltipContent><p>Doc Info</p></TooltipContent>
               </Tooltip>
             </TooltipProvider>
          </div>
        </div>

        {/* Right Sidebar */}
        <div 
          className={`transition-all duration-300 border-l bg-card overflow-hidden shrink-0 ${
            rightPanel !== 'none' ? 'w-80 lg:w-96' : 'w-0'
          }`}
        >
          {rightPanel === 'chat' && (
            <ChatPanel 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              userRole={role}
            />
          )}
          {rightPanel === 'ai' && (
            <AIPanel documentContent={content} />
          )}
        </div>
      </div>
    </div>
  )
}

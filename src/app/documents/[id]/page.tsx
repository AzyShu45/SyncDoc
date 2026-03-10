
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  Users, 
  MoreHorizontal
} from "lucide-react"
import { ChatPanel } from "@/components/workspace/ChatPanel"
import { AIPanel } from "@/components/workspace/AIPanel"
import { Role, Message as MessageType, PresenceUser } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, serverTimestamp, collection, query, orderBy, limit } from "firebase/firestore"
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates"

export default function DocumentWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  const { firestore } = useFirestore() || {}
  const { user, isUserLoading } = useUser()
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  // Fetch real document
  const docRef = useMemoFirebase(() => {
    if (!firestore || !id) return null
    return doc(firestore, "documents", id as string)
  }, [firestore, id])
  const { data: document, isLoading: docLoading } = useDoc(docRef)

  // Fetch real messages
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null
    return query(
      collection(firestore, "documents", id as string, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    )
  }, [firestore, id])
  const { data: messagesData } = useCollection(messagesQuery)

  const [rightPanel, setRightPanel] = useState<'chat' | 'ai' | 'none'>('chat')
  const [isSaving, setIsSaving] = useState(false)

  // Sync state with Firestore document
  const role = (document?.members?.[user?.uid || ""] as Role) || 'VIEWER'
  const title = document?.title || "Untitled Document"
  const content = document?.content || ""

  const handleSendMessage = (text: string) => {
    if (!firestore || !user || !id) return
    const messagesRef = collection(firestore, "documents", id as string, "messages")
    
    // Denormalize documentMembers for auth independence as per rules
    const newMessage = {
      documentId: id,
      senderId: user.uid,
      userName: user.displayName || user.email || "Anonymous",
      content: text,
      documentMembers: document?.members || {},
      createdAt: serverTimestamp(),
    }
    
    addDocumentNonBlocking(messagesRef, newMessage)
  }

  const handleContentChange = useCallback((newContent: string) => {
    if (role === 'VIEWER' || !docRef) return
    setIsSaving(true)
    updateDocumentNonBlocking(docRef, {
      content: newContent,
      updatedAt: serverTimestamp()
    })
    // Simulate end of sync visual for UX
    setTimeout(() => setIsSaving(false), 1000)
  }, [role, docRef])

  const handleTitleChange = (newTitle: string) => {
    if (role === 'VIEWER' || !docRef) return
    updateDocumentNonBlocking(docRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    })
  }

  if (isUserLoading || docLoading) {
    return <div className="h-screen flex items-center justify-center">Loading document...</div>
  }

  if (!user) {
    return null
  }

  if (!document && !docLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">Document not found</h2>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
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
              onChange={(e) => handleTitleChange(e.target.value)}
              className="font-headline font-bold text-lg bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary/20 rounded px-1 -ml-1 w-full max-w-xs transition-all"
              disabled={role === 'VIEWER'}
            />
            <div className="flex items-center gap-2">
               <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                 {role === 'OWNER' && <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1 bg-primary text-white border-none">Owner</Badge>}
                 {role === 'EDITOR' && <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1">Editor</Badge>}
                 {role === 'VIEWER' && <Badge variant="outline" className="text-[9px] h-4 py-0 px-1">Viewer</Badge>}
                 <span className="opacity-50">Syncing live</span>
               </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                Saving...
              </Badge>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto pt-12 pb-20 px-8 lg:px-24">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="editor-container">
                <div className="min-h-[70vh] focus:outline-none prose prose-slate max-w-none">
                  <div 
                    contentEditable={role !== 'VIEWER'} 
                    suppressContentEditableWarning
                    className="outline-none empty:before:content-['Start_writing_something_brilliant...'] empty:before:text-muted-foreground/30 min-h-[500px] whitespace-pre-wrap"
                    onInput={(e) => handleContentChange(e.currentTarget.innerText)}
                  >
                    {content}
                  </div>
                </div>
              </div>
            </div>
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
              messages={(messagesData || []).map(m => ({
                id: m.id,
                userName: m.userName || "Unknown",
                text: m.content || "",
                timestamp: m.createdAt?.toDate() || new Date(),
                userId: m.senderId
              })) as any} 
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

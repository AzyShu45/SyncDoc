
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  ChevronLeft, 
  Share2, 
  MessageSquare, 
  Sparkles, 
  MoreHorizontal,
  Loader2,
  Cloud,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Monitor,
  Eye
} from "lucide-react"
import { ChatPanel } from "@/components/workspace/ChatPanel"
import { AIPanel } from "@/components/workspace/AIPanel"
import { ShareDialog } from "@/components/workspace/ShareDialog"
import { Role } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useFirestore, useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, serverTimestamp, collection, query, orderBy, limit } from "firebase/firestore"
import { updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DocumentWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  const firestore = useFirestore()
  const { user, isUserLoading } = useUser()
  
  const [localTitle, setLocalTitle] = useState("")
  const [localContent, setLocalContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [rightPanel, setRightPanel] = useState<'chat' | 'ai' | 'none'>('chat')
  const [isShareOpen, setIsShareOpen] = useState(false)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const docRef = useMemoFirebase(() => {
    if (!firestore || !id) return null
    return doc(firestore, "documents", id as string)
  }, [firestore, id])
  const { data: document, isLoading: docLoading } = useDoc(docRef)

  useEffect(() => {
    if (document) {
      setLocalTitle(document.title || "")
      setLocalContent(document.content || "")
    }
  }, [document?.id])

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !id || !user) return null
    return query(
      collection(firestore, "documents", id as string, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    )
  }, [firestore, id, user?.uid])
  const { data: messagesData } = useCollection(messagesQuery)

  const role = (document?.members?.[user?.uid || ""] as Role) || 'VIEWER'

  const handleSendMessage = (text: string) => {
    if (!firestore || !user || !id || !document) return
    const messagesRef = collection(firestore, "documents", id as string, "messages")
    
    const newMessage = {
      documentId: id,
      senderId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || "User",
      content: text,
      documentMembers: document.members || {},
      createdAt: serverTimestamp(),
    }
    
    addDocumentNonBlocking(messagesRef, newMessage)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setLocalContent(newContent)
    if (role === 'VIEWER' || !docRef) return
    
    setIsSaving(true)
    updateDocumentNonBlocking(docRef, {
      content: newContent,
      updatedAt: serverTimestamp()
    })
    
    const timeoutId = setTimeout(() => setIsSaving(false), 800)
    return () => clearTimeout(timeoutId)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setLocalTitle(newTitle)
    if (role === 'VIEWER' || !docRef) return
    
    updateDocumentNonBlocking(docRef, {
      title: newTitle,
      updatedAt: serverTimestamp()
    })
  }

  if (isUserLoading || docLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="h-14 w-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-bold tracking-tight">Opening document...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (!document && !docLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 text-center">
        <div className="p-10 bg-muted/30 rounded-full">
          <Monitor className="h-16 w-16 text-muted-foreground/30" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-headline font-bold">Document not found</h2>
          <p className="text-muted-foreground font-medium">It may have been deleted or you don't have access.</p>
        </div>
        <Button onClick={() => router.push("/dashboard")} className="h-12 px-8 rounded-xl font-bold">Return to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden selection:bg-primary/20">
      <header className="h-16 glass-header border-b flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-6 flex-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted" onClick={() => router.push("/dashboard")}>
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to Dashboard</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-8 opacity-20" />
          
          <div className="flex flex-col flex-1 max-w-xl">
            <input 
              value={localTitle}
              onChange={handleTitleChange}
              placeholder="Give your document a title..."
              className="font-headline font-bold text-xl bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/10 rounded-lg px-2 -ml-2 w-full transition-all tracking-tight"
              disabled={role === 'VIEWER'}
            />
            <div className="flex items-center gap-3">
               <Badge variant="secondary" className={`text-[10px] h-5 py-0 px-2 font-bold uppercase tracking-wider ${role === 'OWNER' ? 'bg-primary text-white' : ''}`}>
                 {role}
               </Badge>
               <div className="flex items-center gap-1.5 text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest">
                 {isSaving ? (
                   <span className="flex items-center gap-1 animate-pulse text-primary"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</span>
                 ) : (
                   <span className="flex items-center gap-1"><Cloud className="h-3 w-3 text-green-500" /><Check className="h-3 w-3 text-green-500" /> All changes synced</span>
                 )}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex gap-2 font-bold h-10 px-5 rounded-xl border-2 transition-all hover:bg-muted/50" 
            onClick={() => setIsShareOpen(true)}
          >
            <Share2 className="h-4 w-4" /> Share Workspace
          </Button>

          <div className="flex bg-muted/40 p-1 rounded-xl border shadow-inner">
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                    <Button 
                      variant={rightPanel === 'chat' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className={`h-8 px-4 gap-2 rounded-lg transition-all ${rightPanel === 'chat' ? 'shadow-sm' : ''}`}
                      onClick={() => setRightPanel(rightPanel === 'chat' ? 'none' : 'chat')}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs font-bold">Chat</span>
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent>Collaboration Chat</TooltipContent>
               </Tooltip>
             </TooltipProvider>

             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                    <Button 
                      variant={rightPanel === 'ai' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className={`h-8 px-4 gap-2 rounded-lg transition-all ${rightPanel === 'ai' ? 'shadow-sm' : ''}`}
                      onClick={() => setRightPanel(rightPanel === 'ai' ? 'none' : 'ai')}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs font-bold">AI Insights</span>
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent>AI Assistant</TooltipContent>
               </Tooltip>
             </TooltipProvider>
          </div>
          
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
             <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col bg-background overflow-hidden">
          <div className="flex-1 overflow-y-auto pt-16 pb-32 px-10 lg:px-32 custom-scrollbar">
            <div className="max-w-4xl mx-auto h-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {role === 'VIEWER' && (
                <div className="bg-muted/40 p-4 rounded-2xl flex items-center justify-between border-2 border-dashed">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">You are in read-only mode. Ask the owner for edit access.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold h-9">Request Access</Button>
                </div>
              )}
              
              <Textarea
                value={localContent}
                onChange={handleContentChange}
                disabled={role === 'VIEWER'}
                placeholder="The world is waiting for your words..."
                className="w-full h-full min-h-[70vh] text-xl leading-[1.8] border-none focus-visible:ring-0 resize-none p-0 bg-transparent placeholder:text-muted-foreground/20 shadow-none font-body selection:bg-primary/30"
              />
            </div>
          </div>
        </div>

        <aside 
          className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border-l bg-card shadow-2xl relative shrink-0 ${
            rightPanel !== 'none' ? 'w-[380px] lg:w-[420px]' : 'w-0 opacity-0 invisible'
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
            <AIPanel documentContent={localContent} />
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-1/2 -left-4 h-8 w-8 rounded-full bg-background border shadow-md hover:scale-110 transition-all z-50"
            onClick={() => setRightPanel('none')}
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </aside>

        {rightPanel === 'none' && (
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute right-6 bottom-6 h-12 w-12 rounded-2xl shadow-2xl hover:scale-110 transition-all z-40 animate-in zoom-in"
            onClick={() => setRightPanel('chat')}
          >
            <PanelRightOpen className="h-6 w-6" />
          </Button>
        )}
      </div>

      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        documentId={id as string}
        currentMembers={document?.members || {}}
        ownerId={document?.ownerId || ""}
      />
    </div>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, LayoutGrid, List, LogOut, Settings, Bell, Sparkles, FileText, Loader2, ChevronRight, Filter } from "lucide-react"
import { DocumentCard } from "@/components/dashboard/DocumentCard"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFirestore, useUser, useCollection, useMemoFirebase, useAuth } from "@/firebase"
import { collection, query, where, serverTimestamp, doc, orderBy } from "firebase/firestore"
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { signOut } from "firebase/auth"

export default function Dashboard() {
  const router = useRouter()
  const firestore = useFirestore()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const [search, setSearch] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const documentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "documents"),
      where(`members.${user.uid}`, "!=", null),
      orderBy("updatedAt", "desc")
    )
  }, [firestore, user?.uid])

  const { data: documents, isLoading: docsLoading, error: docsError } = useCollection(documentsQuery)

  const createNewDoc = () => {
    if (!firestore || !user || isCreating) return
    
    setIsCreating(true)
    const newDocRef = doc(collection(firestore, "documents"))
    const docId = newDocRef.id
    
    const initialData = {
      id: docId,
      title: "Untitled Document",
      content: "",
      ownerId: user.uid,
      members: {
        [user.uid]: "OWNER"
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    setDocumentNonBlocking(newDocRef, initialData, { merge: true })
    router.push(`/documents/${docId}`)
  }

  const handleDelete = (id: string) => {
    if (!firestore) return
    const docRef = doc(firestore, "documents", id)
    deleteDocumentNonBlocking(docRef)
  }

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
      router.push("/")
    }
  }

  const filteredDocs = (documents || []).filter(d => 
    (d.title || "").toLowerCase().includes(search.toLowerCase())
  )

  if (isUserLoading || (docsLoading && !documents && !docsError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6">
          <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-muted-foreground font-bold tracking-tight animate-pulse">Building workspace...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/dashboard")}>
            <div className="p-2 bg-primary rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-headline font-bold text-foreground tracking-tighter">SyncDoc</span>
          </div>

          <div className="flex-1 max-w-xl mx-12 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Find a document..." 
                className="pl-11 bg-muted/40 border-none rounded-2xl h-11 w-full focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="relative hover:bg-muted rounded-full">
               <Bell className="h-5 w-5" />
               <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-accent rounded-full border-2 border-background" />
             </Button>
             
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all">
                   <Avatar className="h-full w-full">
                     <AvatarImage src={user.photoURL || undefined} />
                     <AvatarFallback className="bg-primary/10 text-primary font-bold">
                       {user?.displayName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}
                     </AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-none">
                 <div className="p-3 mb-2 bg-muted/30 rounded-xl">
                   <p className="text-sm font-bold truncate">{user?.displayName || "My Profile"}</p>
                   <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                 </div>
                 <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer">
                   <Settings className="h-4 w-4" /> Account Settings
                 </DropdownMenuItem>
                 <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer">
                   <LayoutGrid className="h-4 w-4" /> Display Options
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem className="gap-3 p-3 rounded-xl text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                   <LogOut className="h-4 w-4" /> Sign out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Writer'}
            </div>
            <h1 className="text-5xl font-headline font-bold tracking-tighter">Workspace</h1>
            <p className="text-muted-foreground font-medium text-lg">You have {filteredDocs.length} documents ready for action.</p>
          </div>
          <Button 
            onClick={createNewDoc} 
            disabled={isCreating}
            className="font-bold gap-3 h-14 px-8 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all text-lg"
          >
            {isCreating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
            Create New Doc
          </Button>
        </div>

        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-2xl border">
             <Button 
               variant={view === 'grid' ? 'secondary' : 'ghost'} 
               size="sm" 
               className={`gap-2 font-bold rounded-xl h-9 ${view === 'grid' ? 'shadow-sm' : ''}`}
               onClick={() => setView('grid')}
             >
               <LayoutGrid className="h-4 w-4" /> Grid
             </Button>
             <Button 
               variant={view === 'list' ? 'secondary' : 'ghost'} 
               size="sm" 
               className={`gap-2 font-bold rounded-xl h-9 ${view === 'list' ? 'shadow-sm' : ''}`}
               onClick={() => setView('list')}
             >
               <List className="h-4 w-4" /> List
             </Button>
           </div>

           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold h-10 border-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
           </div>
        </div>

        {docsError ? (
          <div className="p-12 text-center bg-destructive/5 rounded-3xl border border-destructive/20 max-w-2xl mx-auto">
            <h3 className="text-xl font-headline font-bold text-destructive mb-2">Workspace connection lost</h3>
            <p className="text-muted-foreground font-medium mb-6">We're having trouble reaching your documents. Let's try to reconnect.</p>
            <Button variant="outline" className="rounded-xl border-2" onClick={() => window.location.reload()}>Retry Connection</Button>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className={view === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-4"}>
            {filteredDocs.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc as any} 
                onDelete={handleDelete}
                onShare={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="p-10 bg-muted/30 rounded-full mb-8 relative">
              <FileText className="h-20 w-20 text-muted-foreground/20" />
              <Sparkles className="absolute top-6 right-6 h-8 w-8 text-primary/30 animate-pulse" />
            </div>
            <div className="space-y-4 max-w-sm">
              <h3 className="text-3xl font-headline font-bold tracking-tight">Your canvas is empty</h3>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                Every great project starts with a single line. Create your first document and let's build something amazing.
              </p>
            </div>
            <Button onClick={createNewDoc} variant="default" className="mt-10 h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
              Start Writing Now
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

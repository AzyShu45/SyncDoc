
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, LayoutGrid, List, LogOut, Settings, Bell, Sparkles, FileText, Loader2 } from "lucide-react"
import { DocumentCard } from "@/components/dashboard/DocumentCard"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useFirestore, useUser, useCollection, useMemoFirebase, useAuth } from "@/firebase"
import { collection, query, where, serverTimestamp, doc } from "firebase/firestore"
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { signOut } from "firebase/auth"

export default function Dashboard() {
  const router = useRouter()
  const firestore = useFirestore()
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const [search, setSearch] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Proper redirect handling to avoid "Cannot update a component while rendering"
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const documentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "documents"),
      where(`members.${user.uid}`, "!=", null)
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

    // This is non-blocking, so we can navigate immediately
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading workspace...</p>
        </div>
      </div>
    )
  }

  // Defensively return null while redirecting
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="p-1.5 bg-primary rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-headline font-bold text-primary">SyncDoc</span>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search documents..." 
                className="pl-10 bg-muted/50 border-transparent rounded-full h-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" className="relative">
               <Bell className="h-5 w-5" />
               <span className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-background" />
             </Button>
             
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-8 w-8 border-2 border-primary/20">
                     <AvatarImage src={user.photoURL || undefined} />
                     <AvatarFallback>{user?.displayName?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                 <div className="p-2 px-3 border-b mb-1">
                   <p className="text-sm font-bold truncate">{user?.displayName || user?.email?.split('@')[0] || "User"}</p>
                   <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                 </div>
                 <DropdownMenuItem className="gap-2">
                   <Settings className="h-4 w-4" /> Settings
                 </DropdownMenuItem>
                 <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleLogout}>
                   <LogOut className="h-4 w-4" /> Log out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold">My Workspace</h1>
            <p className="text-muted-foreground">Manage and collaborate on your documents</p>
          </div>
          <Button 
            onClick={createNewDoc} 
            disabled={isCreating}
            className="font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20"
          >
            {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Create Document
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6 pb-6 border-b">
           <div className="flex items-center gap-2">
             <Button variant="secondary" size="sm" className="gap-2 font-medium">
               <LayoutGrid className="h-4 w-4" /> Grid
             </Button>
             <Button variant="ghost" size="sm" className="gap-2 font-medium">
               <List className="h-4 w-4" /> List
             </Button>
           </div>
        </div>

        {docsError ? (
          <div className="p-8 text-center bg-destructive/10 rounded-xl border border-destructive/20">
            <p className="text-destructive font-bold">Error loading workspace</p>
            <p className="text-sm text-muted-foreground">Please try refreshing the page or checking your internet connection.</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-6 bg-muted rounded-full">
              <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
            <div>
              <h3 className="text-xl font-headline font-bold">No documents found</h3>
              <p className="text-muted-foreground">Start by creating your first collaborative doc.</p>
            </div>
            <Button onClick={createNewDoc} variant="outline" className="mt-4">
              Create Document
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

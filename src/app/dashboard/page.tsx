
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, LayoutGrid, List, Filter, LogOut, Settings, Bell, Sparkles } from "lucide-react"
import { DocumentCard } from "@/components/dashboard/DocumentCard"
import { Document } from "@/lib/types"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const MOCK_DOCS: Document[] = [
  {
    id: "1",
    title: "Project Roadmap 2024",
    content: "Our goals for the upcoming year...",
    ownerId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: "2",
    title: "Marketing Strategy",
    content: "Targeting new demographics through...",
    ownerId: "user1",
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    title: "API Documentation",
    content: "Endpoints for the new backend service...",
    ownerId: "user2",
    createdAt: new Date(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
]

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCS)
  const [search, setSearch] = useState("")
  const router = useRouter()

  const createNewDoc = () => {
    const id = Math.random().toString(36).substring(7)
    router.push(`/documents/${id}`)
  }

  const handleDelete = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
                     <AvatarFallback>JD</AvatarFallback>
                   </Avatar>
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                 <div className="p-2 px-3 border-b mb-1">
                   <p className="text-sm font-bold">John Doe</p>
                   <p className="text-xs text-muted-foreground truncate">john@syncdoc.com</p>
                 </div>
                 <DropdownMenuItem className="gap-2">
                   <Settings className="h-4 w-4" /> Settings
                 </DropdownMenuItem>
                 <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => router.push("/")}>
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
          <Button onClick={createNewDoc} className="font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-5 w-5" /> Create Document
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
           
           <Button variant="ghost" size="sm" className="gap-2 font-medium text-muted-foreground">
             <Filter className="h-4 w-4" /> All Documents
           </Button>
        </div>

        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
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

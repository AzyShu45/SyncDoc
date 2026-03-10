
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreHorizontal, Share2, Trash2, Clock, Users, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface DocumentCardProps {
  doc: any 
  onDelete: (id: string) => void
  onShare: (id: string) => void
}

export function DocumentCard({ doc, onDelete, onShare }: DocumentCardProps) {
  const getSafeDate = (dateField: any) => {
    if (!dateField) return new Date();
    if (typeof dateField.toDate === 'function') return dateField.toDate();
    const d = new Date(dateField);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const updatedAt = getSafeDate(doc.updatedAt);
  const memberCount = Object.keys(doc.members || {}).length;

  return (
    <Card className="modern-card group border-none bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-[280px]">
      <Link href={`/documents/${doc.id}`} className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <FileText className="h-7 w-7 transition-colors" />
          </div>
          <div onClick={(e) => e.preventDefault()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-2xl border-none">
                <DropdownMenuItem onClick={() => onShare(doc.id)} className="gap-3 p-3 rounded-lg cursor-pointer">
                  <Share2 className="h-4 w-4" /> Collaboration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(doc.id)} className="gap-3 p-3 rounded-lg text-destructive focus:text-destructive cursor-pointer">
                  <Trash2 className="h-4 w-4" /> Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <CardTitle className="truncate text-xl font-headline font-bold tracking-tight">
            {doc.title || "Untitled Document"}
          </CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
             <Clock className="h-3.5 w-3.5" />
             <span>Edited {formatDistanceToNow(updatedAt)} ago</span>
          </div>
        </div>
      </Link>

      <CardFooter className="p-6 pt-0 border-t bg-muted/10 flex justify-between items-center mt-auto">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
             {Object.keys(doc.members || {}).slice(0, 3).map((uid, i) => (
                <div key={uid} className="h-8 w-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm">
                  <img src={`https://picsum.photos/seed/${uid}/100/100`} alt="avatar" className="h-full w-full object-cover" />
                </div>
             ))}
             {memberCount > 3 && (
                <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold shadow-sm">
                  +{memberCount - 3}
                </div>
             )}
          </div>
          {memberCount > 1 && <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{memberCount} Contributors</span>}
        </div>

        <Link href={`/documents/${doc.id}`}>
          <Button variant="ghost" size="sm" className="h-9 gap-2 font-bold group/btn text-primary rounded-xl hover:bg-primary/10">
            Open <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

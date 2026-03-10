
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, Share2, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Document } from "@/lib/types"

interface DocumentCardProps {
  doc: any // Using any to safely handle Firestore Timestamp objects
  onDelete: (id: string) => void
  onShare: (id: string) => void
}

export function DocumentCard({ doc, onDelete, onShare }: DocumentCardProps) {
  // Utility to safely convert Firestore Timestamp or string to a JS Date
  const getSafeDate = (dateField: any) => {
    if (!dateField) return new Date();
    // Check if it's a Firestore Timestamp
    if (typeof dateField.toDate === 'function') {
      return dateField.toDate();
    }
    // Try standard date constructor
    const d = new Date(dateField);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const updatedAt = getSafeDate(doc.updatedAt);

  return (
    <Card className="hover:shadow-md transition-shadow group relative bg-card">
      <Link href={`/documents/${doc.id}`} className="block">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="mt-4 truncate text-lg font-headline">{doc.title || "Untitled Document"}</CardTitle>
          <CardDescription className="text-xs">
            Modified {formatDistanceToNow(updatedAt)} ago
          </CardDescription>
        </CardHeader>
      </Link>
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onShare(doc.id)} className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(doc.id)} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardFooter className="pt-0 pb-4 px-6 flex justify-between items-center">
        <div className="flex -space-x-2">
           <div className="h-6 w-6 rounded-full border-2 border-background bg-accent flex items-center justify-center text-[10px] font-bold">JD</div>
           <div className="h-6 w-6 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold text-white">MK</div>
        </div>
        <Button variant="link" size="sm" className="p-0 h-auto font-medium text-primary" asChild>
          <Link href={`/documents/${doc.id}`}>Open Editor</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

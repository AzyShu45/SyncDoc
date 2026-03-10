
"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, X, Shield, User, Loader2, Check } from "lucide-react"
import { useFirestore, useUser } from "@/firebase"
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore"
import { Role } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  currentMembers: Record<string, string>
  ownerId: string
}

export function ShareDialog({ 
  isOpen, 
  onClose, 
  documentId, 
  currentMembers,
  ownerId 
}: ShareDialogProps) {
  const { user: currentUser } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("EDITOR")
  const [isInviting, setIsInviting] = useState(false)

  const isOwner = currentUser?.uid === ownerId

  const handleInvite = async () => {
    if (!email || !firestore || !documentId) return
    
    setIsInviting(true)
    try {
      // Find user by email
      const usersRef = collection(firestore, "users")
      const q = query(usersRef, where("email", "==", email.toLowerCase()))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "There is no user registered with this email address."
        })
        return
      }

      const targetUser = querySnapshot.docs[0].data()
      const targetUserId = targetUser.id

      if (currentMembers[targetUserId]) {
        toast({
          title: "Already a member",
          description: `${email} is already part of this document.`
        })
        return
      }

      // Update document members
      const docRef = doc(firestore, "documents", documentId)
      await updateDoc(docRef, {
        [`members.${targetUserId}`]: role,
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Member added",
        description: `${targetUser.name || email} has been added as an ${role.toLowerCase()}.`
      })
      setEmail("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Invite failed",
        description: error.message || "Could not add member."
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    if (!firestore || !documentId || !isOwner) return
    
    try {
      const docRef = doc(firestore, "documents", documentId)
      await updateDoc(docRef, {
        [`members.${userId}`]: newRole,
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update member role."
      })
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!firestore || !documentId || !isOwner || userId === ownerId) return
    
    try {
      const docRef = doc(firestore, "documents", documentId)
      await updateDoc(docRef, {
        [`members.${userId}`]: null, // Use null to delete from map in Firestore
        updatedAt: serverTimestamp()
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Removal failed",
        description: "Failed to remove member."
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Share Document
          </DialogTitle>
          <DialogDescription>
            Invite others to collaborate on this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isOwner && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="email" className="sr-only">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="Enter email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  />
                </div>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleInvite} disabled={isInviting || !email}>
                  {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Members</h4>
            <div className="space-y-3">
              {Object.entries(currentMembers).map(([uid, mRole]) => (
                <div key={uid} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {uid === ownerId ? "OW" : "MB"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {uid === currentUser?.uid ? "You" : (uid === ownerId ? "Owner" : "Member")}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {mRole}
                      </span>
                    </div>
                  </div>

                  {isOwner && uid !== ownerId && (
                    <div className="flex items-center gap-2">
                      <Select 
                        value={mRole} 
                        onValueChange={(v) => handleUpdateRole(uid, v as Role)}
                      >
                        <SelectTrigger className="h-8 w-[100px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EDITOR">Editor</SelectItem>
                          <SelectItem value="VIEWER">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMember(uid)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {(!isOwner || uid === ownerId) && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
                      {mRole === 'OWNER' ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                      <span className="text-[10px] font-bold uppercase">{mRole}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

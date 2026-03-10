
"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PresenceUser {
  id: string
  name: string
  photoURL?: string
}

interface PresenceBarProps {
  activeUsers: PresenceUser[]
}

export function PresenceBar({ activeUsers }: PresenceBarProps) {
  return (
    <div className="flex items-center -space-x-2">
      <TooltipProvider>
        {activeUsers.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-primary/20 shadow-sm hover:scale-110 transition-transform cursor-help">
                  <AvatarImage src={user.photoURL} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-background rounded-full" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs font-bold">{user.name}</p>
              <p className="text-[10px] opacity-60">Currently viewing</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
      
      {activeUsers.length === 0 && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-4">
          Alone in workspace
        </span>
      )}
    </div>
  )
}

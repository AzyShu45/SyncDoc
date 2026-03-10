
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push("/dashboard")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <span className="text-3xl font-headline font-bold text-primary">SyncDoc</span>
        </div>

        <Card className="border-none shadow-2xl bg-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-headline font-bold">Create an account</CardTitle>
            <CardDescription>Get started with your collaborative workspace today</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" required className="bg-muted/50 border-transparent" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" required className="bg-muted/50 border-transparent" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required className="bg-muted/50 border-transparent" />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full font-bold h-11" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Register Account"}
              </Button>
              <div className="relative w-full text-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
                <Link href="/" className="ml-1 text-primary hover:underline font-bold">Sign in</Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

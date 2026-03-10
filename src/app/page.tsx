
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, FileText, Users, Share2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate auth
    setTimeout(() => {
      router.push("/dashboard")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full -ml-48 -mb-48 blur-3xl" />

        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <span className="text-3xl font-headline font-bold">SyncDoc</span>
          </div>

          <h1 className="text-5xl font-headline font-bold leading-tight">
            Collaborate with <span className="text-accent">Intelligence.</span>
          </h1>

          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            Experience the future of document collaboration. Real-time editing, integrated AI assistance, and seamless team communication in one secure workspace.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 pt-4">
            <div className="space-y-2">
              <FileText className="h-6 w-6 text-accent" />
              <p className="text-sm font-medium">Rich Editor</p>
            </div>
            <div className="space-y-2">
              <Users className="h-6 w-6 text-accent" />
              <p className="text-sm font-medium">Live Presence</p>
            </div>
            <div className="space-y-2">
              <Share2 className="h-6 w-6 text-accent" />
              <p className="text-sm font-medium">Role Access</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-3xl font-headline font-bold text-primary">SyncDoc</span>
          </div>

          <Card className="border-none shadow-xl bg-card">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-headline font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your workspace</CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-muted/50 border-transparent focus:bg-background transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-muted/50 border-transparent focus:bg-background transition-colors"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button className="w-full font-bold h-11" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <div className="relative w-full text-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">Don't have an account?</span>
                  <Link href="/register" className="ml-1 text-primary hover:underline font-bold">Sign up now</Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

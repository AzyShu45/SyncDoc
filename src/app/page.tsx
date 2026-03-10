
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, FileText, Users, Share2, Loader2, Chrome } from "lucide-react"
import Link from "next/link"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, getDoc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { auth } = useAuth() || {}
  const { firestore } = useFirestore() || {}
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isUserLoading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      })
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) return
    setSocialLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      // Force account selection so users don't get stuck with a previously used account
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userRef = doc(firestore, "users", user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        setDocumentNonBlocking(userRef, {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || "User",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google login failed",
        description: error.message || "Could not sign in with Google.",
      })
      setSocialLoading(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
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
          <Card className="border-none shadow-xl bg-card">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-headline font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your workspace</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button 
                variant="outline" 
                className="w-full h-11 gap-2 font-bold" 
                onClick={handleGoogleLogin}
                disabled={socialLoading || loading}
              >
                {socialLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Chrome className="h-4 w-4" />}
                Continue with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || socialLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || socialLoading}
                  />
                </div>
                <Button className="w-full font-bold h-11 mt-2" type="submit" disabled={loading || socialLoading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="relative w-full text-center text-xs">
                <span className="text-muted-foreground">Don't have an account?</span>
                <Link href="/register" className="ml-1 text-primary hover:underline font-bold">Sign up now</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

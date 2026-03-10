
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Sparkles, FileText, Users, Share2, Loader2, Chrome, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, getDoc, serverTimestamp } from "firebase/firestore"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()
  const firestore = useFirestore()
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
      provider.setCustomParameters({ prompt: 'select_account' })
      
      const result = await signInWithPopup(auth, provider)
      const loggedInUser = result.user

      const userRef = doc(firestore, "users", loggedInUser.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        setDocumentNonBlocking(userRef, {
          id: loggedInUser.uid,
          email: loggedInUser.email,
          name: loggedInUser.displayName || loggedInUser.email?.split('@')[0] || "User",
          photoURL: loggedInUser.photoURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true })
      }
    } catch (error: any) {
      console.error("Google Login Error:", error)
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
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium tracking-tight">Syncing your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background selection:bg-primary/20">
      <div className="hidden lg:flex flex-col justify-between p-16 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-2xl shadow-2xl shadow-black/20">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <span className="text-3xl font-headline font-bold tracking-tighter">SyncDoc</span>
        </div>

        <div className="relative z-10 space-y-10">
          <div className="space-y-6">
            <h1 className="text-7xl font-headline font-bold leading-[0.9] tracking-tighter">
              The Workspace <br /> for <span className="text-accent">Innovators.</span>
            </h1>
            <p className="text-xl text-primary-foreground/70 leading-relaxed max-w-md">
              Collaborate in real-time with AI-powered insights, secure sharing, and a writing experience that flows as fast as you do.
            </p>
          </div>

          <div className="flex gap-4">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-muted-foreground/20 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" className="h-full w-full object-cover" />
                  </div>
                ))}
             </div>
             <div className="text-sm font-medium flex flex-col justify-center">
                <span className="text-white">Joined by 10,000+ teams</span>
                <span className="text-primary-foreground/50 text-xs">Build better, together.</span>
             </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
          {[
            { icon: FileText, label: "Rich Context" },
            { icon: Users, label: "Live Sync" },
            { icon: Share2, label: "Granular Access" }
          ].map((item, idx) => (
            <div key={idx} className="space-y-2 group cursor-default">
              <item.icon className="h-6 w-6 text-accent group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-0 left-0 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-4xl font-headline font-bold tracking-tight">Ready to start?</h2>
            <p className="text-muted-foreground font-medium">Log in to your collaborative workspace</p>
          </div>

          <div className="grid gap-6">
            <Button 
              variant="outline" 
              className="w-full h-14 gap-3 font-bold text-lg rounded-2xl hover:bg-muted/50 transition-all border-2" 
              onClick={handleGoogleLogin}
              disabled={socialLoading || loading}
            >
              {socialLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Chrome className="h-5 w-5" />}
              Continue with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">Or via email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider opacity-60 ml-1">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="h-12 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary px-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading || socialLoading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider opacity-60">Password</Label>
                    <Link href="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary px-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || socialLoading}
                  />
                </div>
              </div>
              <Button className="w-full font-bold h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group" type="submit" disabled={loading || socialLoading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Sign in to workspace"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </div>

          <p className="text-center text-sm font-medium">
            <span className="text-muted-foreground">New to SyncDoc?</span>
            <Link href="/register" className="ml-2 text-primary hover:underline font-bold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

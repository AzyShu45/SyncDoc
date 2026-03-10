
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Wand2, FileSearch, CheckCircle2, Loader2, Zap, BrainCircuit, History, ArrowRight } from "lucide-react"
import { summarizeDocumentContent } from "@/ai/flows/summarize-document-content"
import { fixGrammarAndTone } from "@/ai/flows/fix-grammar-and-tone"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AIPanelProps {
  documentContent: string
}

export function AIPanel({ documentContent }: AIPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'summary' | 'grammar', content: string, suggestions?: string } | null>(null)

  const handleSummarize = async () => {
    if (!documentContent) return
    setLoading(true)
    try {
      const { summary } = await summarizeDocumentContent({ documentContent })
      setResult({ type: 'summary', content: summary })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFixGrammar = async () => {
    if (!documentContent) return
    setLoading(true)
    try {
      const { correctedDocument, toneSuggestions } = await fixGrammarAndTone({ documentContent })
      setResult({ type: 'grammar', content: correctedDocument, suggestions: toneSuggestions })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-l ai-glow selection:bg-accent/20">
      <div className="p-8 border-b bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
            Gemini 2.5 Flash
          </Badge>
          <div className="h-8 w-8 bg-background rounded-lg border shadow-sm flex items-center justify-center">
            <BrainCircuit className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-headline font-bold text-2xl tracking-tight">AI Assistant</h3>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-60">Deep analysis & refinement</p>
        </div>
      </div>

      <div className="p-8 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            className="h-24 justify-start p-6 rounded-2xl border-2 hover:bg-primary/5 hover:border-primary/30 transition-all group"
            onClick={handleSummarize}
            disabled={loading}
          >
            <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform mr-4">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-bold text-lg leading-none mb-1">Summarize</span>
              <span className="text-xs text-muted-foreground">Extract key points instantly</span>
            </div>
            {loading ? <Loader2 className="ml-auto h-5 w-5 animate-spin" /> : <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transition-all" />}
          </Button>

          <Button
            variant="outline"
            className="h-24 justify-start p-6 rounded-2xl border-2 hover:bg-accent/5 hover:border-accent/30 transition-all group"
            onClick={handleFixGrammar}
            disabled={loading}
          >
            <div className="p-3 bg-accent/10 rounded-xl group-hover:scale-110 transition-transform mr-4">
              <Wand2 className="h-6 w-6 text-accent" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-bold text-lg leading-none mb-1">Refine Text</span>
              <span className="text-xs text-muted-foreground">Perfect grammar & tone</span>
            </div>
            {loading ? <Loader2 className="ml-auto h-5 w-5 animate-spin" /> : <ArrowRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transition-all" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-8 pt-0">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-20">
            <Zap className="h-20 w-20 stroke-[1]" />
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-[0.2em]">Ready for analysis</p>
              <p className="text-xs max-w-[200px] font-medium leading-relaxed">Choose an intelligence task to begin transforming your document content.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-6 py-4 animate-in fade-in duration-500">
             <div className="space-y-3">
               <div className="h-4 w-1/2 bg-muted/60 animate-pulse rounded-lg" />
               <div className="h-32 w-full bg-muted/40 animate-pulse rounded-2xl" />
             </div>
             <div className="space-y-3">
               <div className="h-4 w-1/3 bg-muted/60 animate-pulse rounded-lg" />
               <div className="h-24 w-full bg-muted/40 animate-pulse rounded-2xl" />
             </div>
             <div className="flex items-center justify-center gap-3 py-10">
               <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
               <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
               <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
             </div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {result.type === 'summary' ? 'Insights Generated' : 'Optimized Content'}
                  </h4>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                  <History className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <div className="p-6 bg-muted/20 rounded-3xl border-2 border-dashed border-muted relative group">
                <div className="text-base leading-relaxed whitespace-pre-wrap text-foreground italic">
                  "{result.content}"
                </div>
                <Button variant="secondary" size="sm" className="absolute -bottom-4 right-4 h-9 rounded-xl font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                  Copy result
                </Button>
              </div>
            </div>

            {result.suggestions && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Tone Recommendations</h4>
                </div>
                <Card className="p-6 bg-accent/5 border-none rounded-3xl shadow-inner">
                  <div className="text-sm leading-relaxed text-foreground/80 font-medium">
                    {result.suggestions}
                  </div>
                </Card>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-2 mt-8" 
              onClick={() => setResult(null)}
            >
              Reset Session
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

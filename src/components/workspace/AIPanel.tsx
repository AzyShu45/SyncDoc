
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Wand2, FileSearch, CheckCircle2, Loader2 } from "lucide-react"
import { summarizeDocumentContent } from "@/ai/flows/summarize-document-content"
import { fixGrammarAndTone } from "@/ai/flows/fix-grammar-and-tone"
import { Card } from "@/components/ui/card"

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
    <div className="flex flex-col h-full bg-card border-l">
      <div className="p-4 border-b bg-primary/5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-headline font-bold text-lg">AI Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Powered by Google Gemini 1.5 Pro</p>
      </div>

      <div className="p-4 space-y-3 border-b">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-20 flex-col gap-2 border-primary/20 hover:bg-primary/5"
            onClick={handleSummarize}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileSearch className="h-5 w-5 text-primary" />}
            <span className="text-xs">Summarize</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-20 flex-col gap-2 border-accent/20 hover:bg-accent/5"
            onClick={handleFixGrammar}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5 text-accent" />}
            <span className="text-xs">Refine Text</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-40">
            <Sparkles className="h-12 w-12" />
            <p className="text-sm max-w-[200px]">Select an AI action above to analyze your document</p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 py-4">
             <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
             <div className="h-4 w-full bg-muted animate-pulse rounded" />
             <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
             <p className="text-xs text-center text-muted-foreground animate-pulse">SyncDoc AI is thinking...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="p-4 bg-background border-none shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {result.type === 'summary' ? 'Document Summary' : 'Refined Content'}
                </h4>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 italic">
                "{result.content}"
              </div>
            </Card>

            {result.suggestions && (
              <Card className="p-4 bg-accent/5 border-none shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent mb-2">Tone Suggestions</h4>
                <div className="text-sm leading-relaxed text-foreground/80">
                  {result.suggestions}
                </div>
              </Card>
            )}

            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setResult(null)}>
              Clear Results
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

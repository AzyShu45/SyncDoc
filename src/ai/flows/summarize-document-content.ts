'use server';
/**
 * @fileOverview A Genkit flow for summarizing document content using AI.
 *
 * - summarizeDocumentContent - A function that triggers the document summarization process.
 * - SummarizeDocumentContentInput - The input type for the summarizeDocumentContent function.
 * - SummarizeDocumentContentOutput - The return type for the summarizeDocumentContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeDocumentContentInputSchema = z.object({
  documentContent: z.string().describe('The full text content of the document to be summarized.'),
});
export type SummarizeDocumentContentInput = z.infer<typeof SummarizeDocumentContentInputSchema>;

const SummarizeDocumentContentOutputSchema = z.object({
  summary: z.string().describe("The concise summary of the document's content."),
});
export type SummarizeDocumentContentOutput = z.infer<typeof SummarizeDocumentContentOutputSchema>;

export async function summarizeDocumentContent(input: SummarizeDocumentContentInput): Promise<SummarizeDocumentContentOutput> {
  return summarizeDocumentContentFlow(input);
}

const summarizeDocumentContentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentContentFlow',
    inputSchema: SummarizeDocumentContentInputSchema,
    outputSchema: SummarizeDocumentContentOutputSchema,
  },
  async (input) => {
    let fullSummary = '';
    const { stream, response } = ai.generateStream({
      model: 'googleai/gemini-1.5-flash', // Using gemini-1.5-flash for better availability and performance
      prompt: [
        { text: 'Please provide a concise and accurate summary of the following document content. Extract the main points and present them clearly.' },
        { text: 'Document Content:' },
        { text: input.documentContent },
      ],
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        fullSummary += chunk.text;
      }
    }
    await response; // Ensure the full response is received, though we've already processed chunks

    return { summary: fullSummary };
  }
);

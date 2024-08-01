'use client'

import Markdown from '@/components/markdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { useChat } from 'ai/react'
import { CornerDownLeft, SquareTerminal, UploadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const computingToasts: any[] = []

export default function Page() {
  const { toast } = useToast()
  const { messages, handleSubmit, input, handleInputChange } = useChat()
  useEffect(() => {
    if (messages[messages.length - 1]?.role === 'user') {
      computingToasts.push(
        toast({
          duration: 100000,
          description: 'Thinking...',
        }),
      )
    } else {
      computingToasts.forEach((i) => {
        i.dismiss()
      })
    }
  }, [messages, toast])
  const [findPDF, setFindPDF] = useState('')
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r">
        <div className="border-b p-2">
          <Button variant="outline" size="icon" aria-label="Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Logo" loading="lazy" className="size-5 fill-foreground" src="https://neon.tech/favicon/favicon.png" />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg bg-muted" aria-label="Chat with PDF Playground">
                  <SquareTerminal className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Chat with PDF Playground
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4 justify-between">
          <h1 className="text-xl font-semibold">Chat with PDF Playground</h1>
        </header>
        <main className="gap-4 w-full flex flex-col p-4">
          <div className="flex flex-row flex-wrap items-center justify-between">
            <input
              type="file"
              id="fileInput"
              className="sr-only"
              accept="application/pdf"
              onChange={async (e) => {
                // create a new form data object that contains the uploaded file
                const fileInput = document.getElementById('fileInput') as HTMLInputElement
                if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                  toast({
                    duration: 2000,
                    variant: 'destructive',
                    description: 'No file attached.',
                  })
                  return
                }
                const fileData = fileInput.files[0]
                const formData = new FormData()
                formData.append('file', fileData)
                const fileArrayBuffer = await fileData.arrayBuffer()
                const buffer = Buffer.from(fileArrayBuffer)
                setFindPDF(`data:${fileData.type};base64,${buffer.toString('base64')}`)
                const loadingToast = toast({
                  duration: 10000,
                  description: "Adding your PDF to AI's knowledge...",
                })
                fetch('/api/upsert', {
                  method: 'POST',
                  body: formData,
                }).then((res) => {
                  loadingToast.dismiss()
                  if (res.ok) {
                    toast({
                      duration: 2000,
                      description: "Added the PDF to AI's knowledge succesfully.",
                    })
                  } else {
                    toast({
                      duration: 2000,
                      variant: 'destructive',
                      description: "Failed to add the PDF to AI's knowledge.",
                    })
                  }
                })
              }}
            />
          </div>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col">
              <div className="min-h-[90vh] py-8 flex items-center justify-center rounded-lg border border-dashed shadow-sm">
                <div className="flex flex-col items-center text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {findPDF && <embed className="min-h-[50vh]" src={findPDF} id="pdf" />}
                  <Button
                    variant="outline"
                    className={['gap-3', findPDF && 'mt-8'].join(' ')}
                    onClick={() => {
                      const fileInput = document.getElementById('fileInput') as HTMLInputElement
                      if (fileInput) fileInput.click()
                    }}
                  >
                    <UploadIcon className="size-3.5" />
                    <span>Upload a new document</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4">
              <Badge variant="outline" className="absolute right-3 top-3">
                Output
              </Badge>
              <div className="flex-1 max-h-[calc(100vh-210px)] overflow-y-scroll">
                {messages.map((message, i) => (
                  <div className={[i !== 0 && 'mt-4 pt-4 border-t border-gray-100', i === messages.length - 1 && 'pb-4'].join(' ')} key={i}>
                    <Markdown message={message.content} />
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring">
                <Label htmlFor="message" className="sr-only">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="prompt"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center p-3 pt-0">
                  <Button type="submit" size="sm" className="ml-auto gap-1.5">
                    Send Message
                    <CornerDownLeft className="size-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

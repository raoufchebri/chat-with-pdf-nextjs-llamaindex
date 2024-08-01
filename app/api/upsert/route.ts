export const dynamic = 'force-dynamic'

export const fetchCache = 'force-no-store'

import { storageContextFromDefaults, VectorStoreIndex } from 'llamaindex'
import { PDFReader } from 'llamaindex/readers/PDFReader'
import vectorStore from '@/lib/vectorStore'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  // Check if the user is authenticated
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse the form data from the request to get the file
  const data = await request.formData()
  const file = data.get('file') as File
  // If no file is provided, return a 400 Bad Request response
  if (!file) return new Response(null, { status: 400 })
  // Read the file contents into a buffer
  const fileBuffer = await file.arrayBuffer()
  const documents = await new PDFReader().loadDataAsContent(new Uint8Array(fileBuffer))
  const storageContext = await storageContextFromDefaults({ vectorStore })
  await VectorStoreIndex.fromDocuments(documents, { storageContext })
  return new Response()
}

#!/usr/bin/env node

/**
 * Ask an LLM to generate a summary for a blog post.
 */

import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL
const defaultModel = 'llava'

// TODO: This script is very much a proof of concept.
//  It works, but needs work to make it robust.

// TODO: Clean up the arguments implementation here
const path = process.argv[2]

// Read blog post from disk if it exists
if (!fs.existsSync(path)) {
  console.log(`Cannot find ${path} :(`)
  process.exit(1)
}

const content = fs.readFileSync(path, { encoding: 'utf8' })

// Get summary
const body = {
  model: defaultModel,
  stream: false,
  prompt: `Summarize the following blog post into maximum three lines:\n${content}`,
}
const url = `${ollamaBaseUrl}/api/generate`
const request = fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})

console.log(`Generating summary for ${path}`)

const response = await request
const result = await response.json()

console.log(result.response.trim())

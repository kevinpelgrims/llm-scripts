#!/usr/bin/env node

/**
 * Ask a multimodal model to generate the alt text for an image.
 */

import fs from 'fs/promises'
import dotenv from 'dotenv'

dotenv.config()

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL
const defaultModel = 'llava'

// TODO: This script is very much a proof of concept.
//  It works, but needs work to make it robust.

// const path = './tmp/2015-screenshot.png'
const path = './tmp/background.jpg'
const imageAsText = Buffer.from(await fs.readFile(path)).toString('base64')
const body = {
  model: defaultModel,
  stream: false,
  // This is the prompt with the most success so far.
  // The model tends to use way too many words to fit in an alt text.
  // It is especially bad with screenshots, apparently.
  prompt:
    'Describe what is in the image succinctly in one sentence with maximum six words.',
  images: [imageAsText],
}
const url = `${ollamaBaseUrl}/api/generate`
const request = fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
})
const response = await request
const result = await response.json()

console.log(result.response.trim())

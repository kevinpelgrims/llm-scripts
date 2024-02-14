#!/usr/bin/env node

import { execSync } from 'child_process'

import dotenv from 'dotenv'

dotenv.config()

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL

function generateRequest(diff) {
  const url = getUrl()
  const body = generateBody(diff)

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

function getUrl() {
  // Ollama
  return `${ollamaBaseUrl}/api/generate`
}

function generateBody(diff) {
  const instructions =
    'You take in Git diffs and summarize them into a commit title and message. ' +
    'The title should be maximum 50 characters long, and the message van span multiple lines with a maximum length of 75 characters per line. ' +
    'Use imperative present tense. Respond using JSON and include a title and a message.'
  const prompt = `${instructions} This is the diff: ${diff}`

  return {
    model: 'llava',
    stream: false,
    format: 'json',
    prompt: prompt,
  }
}

const stagedFiles = execSync('git diff --staged --name-only')
const stagedDiff = execSync('git diff --staged')

if (stagedFiles.toString().trim().length === 0) {
  console.log('No files staged. Cannot generate a commit message.')
  process.exit(0)
}

console.log(
  `Generating commit message for staged files:\n${stagedFiles.toString()}`,
)

const request = generateRequest(stagedDiff)
const response = await request
const result = await response.json()

console.log(result.response)

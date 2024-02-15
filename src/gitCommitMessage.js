#!/usr/bin/env node

/**
 * When preparing a commit message, run the diff through an LLM to
 * generate the commit title and message automatically.
 */

import { execSync } from 'child_process'

import dotenv from 'dotenv'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import fs from 'fs'

dotenv.config()

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL
const defaultModel = 'llama2'

function generateRequest(diff, model) {
  const url = getUrl()
  const body = generateBody(diff, model)

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

function generateBody(diff, model) {
  const instructions =
    'You take in Git diffs and summarize them into a commit title and message. ' +
    'The title should be maximum 50 characters long, and the message van span multiple lines with a maximum length of 75 characters per line. ' +
    'Use imperative present tense. Respond using JSON and include a title and a message.'
  const prompt = `${instructions} This is the diff: ${diff}`

  return {
    model: model,
    stream: false,
    format: 'json',
    prompt: prompt,
  }
}

function writeCommitMessageToFile(file, title, message) {
  const existingContent = fs.readFileSync(file)
  const finalContent = `${title}\n\n${message}\n\n${existingContent}`
  fs.writeFileSync(file, finalContent)
}

export async function main(argv) {
  const options = await yargs(hideBin(argv))
    .usage('$0 [file] [source] [hash] [args]')
    .command(
      '$0 [file] [source] [hash]',
      'Generate commit message',
      (yargs) => {
        yargs
          .positional('file', {
            type: 'string',
            describe: 'The file that contains the commit log message',
          })
          .positional('source', {
            type: 'string',
            describe:
              'The source of the commit message\nPossibilities are message, template, merge, squash or commit',
          })
          .positional('hash', {
            type: 'string',
            describe: 'The id of the commit',
          })
      },
    )
    .option('model', {
      type: 'string',
      alias: 'm',
      describe: 'The model to use for summarizing the diff',
      default: defaultModel,
    })
    .version('1.0.0')
    .help()
    .alias('help', 'h')
    .parse()

  if (options.source && options.source.length > 0) {
    console.log('Not generating commit message due to source of commit')
    // We shouldn't generate a commit message here because of the source of the
    // commit (e.g. we don't want to override the existing message for a squash)
    return 0
  }

  const stagedFiles = execSync('git diff --staged --name-only')
  const stagedDiff = execSync('git diff --staged')

  if (stagedFiles.toString().trim().length === 0) {
    console.log('No files staged. Cannot generate a commit message.')
    return 0
  }

  console.log(
    `Generating commit message for staged files:\n${stagedFiles.toString()}`,
  )

  const request = generateRequest(stagedDiff, options.model)
  const response = await request
  const result = await response.json()

  if (!result.response) {
    console.log('No valid response received from the model', '\n', response)
    return 0
  }

  const commit = JSON.parse(result.response)

  writeCommitMessageToFile(options.file, commit.title, commit.message)

  return 0
}

// TODO: Check if this code makes sense. Source: https://stackoverflow.com/questions/45136831/node-js-require-main-module
if (import.meta.url.endsWith(process.argv[1])) {
  const exitCode = await main(process.argv)
  process.exit(exitCode)
}

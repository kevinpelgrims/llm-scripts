# LLM Scripts

This is a playground for scripts that use LLMs to generate content for software engineering or publishing to the web. 

## Requirements

Node is a requirement to run any of the JavaScript scripts.
Everything was tested with Node v20 and NPM v10.

## Setup

Run `npm install` in the root of the project.

Make sure to create a `.env` file before running the scripts.
The [`.env.example`](./.env.example) file contains the basic structure for the environment variables.

## Scripts

### Git commit message generator

The [Git commit message generation script](./src/gitCommitMessage.js) uses an LLM to convert a Git diff into a commit title and message.

If you run this script as the `prepare-commit-msg` Git hook, this will also add the entire message to the file that opens in the editor when committing.
To do that, you will need to add the environment variables to the path (or override the API base URL in the script itself).
If you run the script manually, the output will be printed to the console.

The script can currently use models served locally by [Ollama](https://github.com/ollama/ollama) and
it is possible to handpick a model by passing in the `--model` (`-m`) parameter when running the script.
Make sure that the model is pulled down before trying to use it.

## Image alt text generator

The [image alt text generation script](./src/imageAltText.js) uses a multimodal model to describe an image in few words.

The script can currently use models served locally by [Ollama](https://github.com/ollama/ollama) and defaults to `llava`.
This will only work with a multimodal model and not just any LLM.

## Blog post summary generator

The [blog post summary generation script](./src/blogPostSummary.js) uses an LLM to summarize a blog post into a short paragraph.

The script can currently use models served locally by [Ollama](https://github.com/ollama/ollama) and defaults to `llava`.

Lots of work is needed (e.g. filtering out Front Matter before passing the text to the model) to make this production-ready.

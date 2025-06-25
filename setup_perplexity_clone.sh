#!/bin/bash

# Create Next.js app with TypeScript
npx create-next-app@latest perplexity-clone --typescript --eslint --tailwind --app --src-dir --import-alias "@/*"

cd perplexity-clone

# Install dependencies
npm install axios openai dotenv

# Create basic directory structure
mkdir -p src/components src/lib src/types

echo "Next.js project scaffolded with Tailwind, TypeScript, Axios, OpenAI, and dotenv."

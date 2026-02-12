#!/bin/bash
cd /vercel/share/v0-project
npx vitest run --reporter=verbose 2>&1

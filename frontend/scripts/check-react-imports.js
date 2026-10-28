/**
 * check-react-imports.js
 * Scans all .js/.jsx files in frontend/src to ensure any React hook or API used
 * is explicitly imported from 'react', preventing missing-import runtime bugs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

const REACT_HOOKS_AND_APIS = [
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useLayoutEffect',
  'useId',
  'useTransition',
  'useDeferredValue',
  'createContext',
  'forwardRef',
  'memo',
  'lazy',
  'Suspense',
  'Children',
  'Fragment',
  'startTransition'
];

function getAllFiles(dir, extensions = ['.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.includes(path.extname(dirent.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  // Extract all imports from 'react'
  // Match single or multi-line imports: import ... from 'react' or "react"
  const reactImportMatches = content.match(/import\s+([\s\S]*?)\s+from\s+['"]react['"]/g) || [];
  
  const importedNamedSymbols = new Set();
  let hasReactDefaultOrNamespace = false;

  for (const importStmt of reactImportMatches) {
    // Check default or namespace: import React, ... or import * as React
    if (/\bimport\s+React\b/.test(importStmt) || /\bimport\s+\*\s+as\s+React\b/.test(importStmt)) {
      hasReactDefaultOrNamespace = true;
    }
    // Check named imports: { useState, useEffect as ... }
    const namedMatch = importStmt.match(/\{([\s\S]*?)\}/);
    if (namedMatch) {
      const symbols = namedMatch[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
      for (const sym of symbols) {
        importedNamedSymbols.add(sym);
      }
    }
  }

  // Check each line for usage of hooks / APIs
  lines.forEach((line, index) => {
    // Strip single line comments and strings briefly to avoid false positives
    const stripped = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '');
    
    for (const api of REACT_HOOKS_AND_APIS) {
      // Regex checking for standalone identifier usage: \buseState\b
      // Ensure it's not part of an import statement
      if (line.includes("from 'react'") || line.includes('from "react"')) continue;
      
      const usageRegex = new RegExp(`\\b${api}\\b`);
      if (usageRegex.test(stripped)) {
        // If it's React.api, check if React was imported
        const memberRegex = new RegExp(`\\bReact\\.${api}\\b`);
        if (memberRegex.test(stripped)) {
          if (!hasReactDefaultOrNamespace) {
            errors.push({
              file: path.relative(SRC_DIR, filePath),
              line: index + 1,
              symbol: `React.${api}`,
              message: `'React' is used as a namespace but not imported from 'react'`
            });
          }
        } else {
          // Direct call/reference like useState(...)
          // Check if it's imported
          if (!importedNamedSymbols.has(api)) {
            // Also ensure it's not a function definition or property declaration named like api
            const isLocalDef = new RegExp(`(function\\s+${api}|const\\s+${api}\\s*=|let\\s+${api}\\s*=|var\\s+${api}\\s*=|${api}\\s*:)`).test(stripped);
            if (!isLocalDef) {
              errors.push({
                file: path.relative(SRC_DIR, filePath),
                line: index + 1,
                symbol: api,
                message: `'${api}' is used but not imported from 'react'`
              });
            }
          }
        }
      }
    }
  });

  return errors;
}

function run() {
  console.log('[check-react-imports] Scanning frontend/src for missing React imports...');
  const files = getAllFiles(SRC_DIR);
  let totalErrors = 0;

  for (const file of files) {
    const errors = analyzeFile(file);
    if (errors.length > 0) {
      for (const err of errors) {
        console.error(`[ERROR] ${err.file}:${err.line} - ${err.message}`);
      }
      totalErrors += errors.length;
    }
  }

  if (totalErrors > 0) {
    console.error(`\n[FAIL] Found ${totalErrors} missing React import(s).`);
    process.exit(1);
  } else {
    console.log(`\n[PASS] Verified ${files.length} files: All React hooks and APIs are correctly imported!`);
    process.exit(0);
  }
}

run();

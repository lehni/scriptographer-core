import { inject } from './define.js'
import { LocalFile } from './local-file.js'

// The global `script` a running script gets: its file and folder as
// `LocalFile`s (`null` without one, as on the web, or for the console),
// `keepAlive`, which it sets to keep running when another script runs, and
// `preferences`, as it last left them. They're kept as Paper.js serializes
// them, so they come back as Colors, Points…

export function setScript(file, directory, preferences) {
  inject(globalThis, {
    script: {
      file: file ? new LocalFile(file) : null,
      directory: directory ? new LocalFile(directory) : null,
      keepAlive: false,
      preferences: preferences ? paper.Base.importJSON(preferences) : {}
    }
  })
}

// What the runtime keeps of `script.preferences`, as JSON, once the script's
// work is done, or `null` without any.
export function getPreferences() {
  const preferences = globalThis.script?.preferences
  return preferences ? paper.Base.exportJSON(preferences) : null
}

// Whether the script keeps running when another one runs.
export function keepsAlive() {
  return globalThis.script?.keepAlive === true
}

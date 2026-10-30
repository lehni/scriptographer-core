import { inject } from './define.js'
import { LocalFile } from './local-file.js'
import { getOptions } from './modules.js'

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

// The handlers scripts export, which the runtime calls: as the app starts
// and quits, as the script stops, as the app comes to the front or leaves
// it, and as the user asks for the tool's options.
const handlerNames = [
  'onStartup',
  'onShutdown',
  'onStop',
  'onAppActivate',
  'onAppDeactivate',
  'onEditOptions'
]
const handlers = {}

// Runs the script's PaperScript, at `url`, in its scope, and keeps the
// handlers it exports. One with top-level await exports them once it's done:
// then it returns a promise of that, and the app decides what its failure
// means.
export function executeScript(scope, source, url) {
  const exported = scope.PaperScript.execute(
    source,
    scope,
    getOptions(scope, url, true, handlerNames)
  )
  if (typeof exported?.then === 'function') {
    return exported.then(exported => {
      Object.assign(handlers, exported)
    })
  }
  Object.assign(handlers, exported)
}

// Calls the handler the script exported: whether it has it.
export function callHandler(name) {
  const handler = handlers[name]
  if (typeof handler === 'function') {
    handler()
    return true
  }
  return false
}

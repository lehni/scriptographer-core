import { natives } from './natives.js'

// `import` in scripts: PaperScript compiles `import … from 'specifier'` into
// calls to `load()`, which resolves the specifier against the URL of the
// importing code (the script's for its own imports), runs the module in the
// script's scope and gives back its exports. A `.pjs` module is PaperScript,
// with operator overloading, any other plain JavaScript, unless the import
// says which with `with { type: 'paperscript' }` or `with { type: 'javascript'
// }`. Each module runs once per script, per kind; a cycle throws. The app reads
// the modules, from files or the web, with `readModule(url)`.

// The modules, by URL and kind: their exports, or `null` while they run.
const modules = new Map()

// What `PaperScript.execute()` takes for code at `url`, in `scope`:
export function getOptions(scope, url, isPaperScript, handlers) {
  return {
    url,
    load: (specifier, importer, attributes) =>
      load(scope, specifier, importer, attributes),
    evaluate: natives.evaluate,
    handlers,
    paperFeatures: isPaperScript ? undefined : { operatorOverloading: false }
  }
}

function load(scope, specifier, importer, attributes) {
  const fail = message => {
    throw new Error(`import '${specifier}': ${message}`)
  }
  let url
  try {
    url = new URL(specifier, importer || undefined)
  } catch {
    fail('it names no file the script can find')
  }
  const type = attributes?.type
  if (type != null && type !== 'paperscript' && type !== 'javascript') {
    throw new TypeError(
      `import '${specifier}': '${type}' isn't a type of module`
    )
  }
  const isPaperScript = type
    ? type === 'paperscript'
    : /\.pjs$/i.test(url.pathname)
  const key = `${isPaperScript ? 'paperscript' : 'javascript'} ${url.href}`
  if (modules.has(key)) {
    return modules.get(key) ?? fail('it imports itself, through its imports')
  }
  if (/^https?:$/.test(url.protocol)) natives.print(`import ${url.href}`)
  let source
  try {
    source = natives.readModule(url.href)
  } catch (err) {
    fail(err.message)
  }
  modules.set(key, null)
  try {
    const exports = scope.PaperScript.execute(
      source,
      scope,
      getOptions(scope, url.href, isPaperScript)
    )
    modules.set(key, exports)
    return exports
  } catch (err) {
    // A module that failed loads again the next time it's imported.
    modules.delete(key)
    throw err
  }
}

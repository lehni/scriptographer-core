// The error with the frames of its stack in the scripts, as V8 and
// JavaScriptCore write them. The runtime's own frames are left out: those in
// the folder of this bundle, which the runtimes keep Paper.js and their own
// code in, and those without a file, of native code and code the runtimes
// evaluate.
export function formatError(err) {
  const text = String(err)
  const stack = err?.stack
  if (typeof stack !== 'string') return text
  // V8's stack starts with the error, JavaScriptCore's with its first frame:
  const frames = (stack.startsWith(text) ? stack.slice(text.length) : stack)
    .split('\n')
    .filter(line => {
      const file = getFile(line)
      return !!file && getFolder(file) !== runtimeFolder
    })
  return [text, ...frames].join('\n')
}

// The file of a frame, `at name (file:line:column)` or `name@file:line:column`,
// as a URL:
function getFile(frame) {
  return frame.match(/([a-z][\w+.-]*:[^\s()@]+):\d+:\d+\)?$/i)?.[1]
}

function getFolder(file) {
  return file.slice(0, file.lastIndexOf('/') + 1)
}

const runtimeFile = new Error().stack?.split('\n').map(getFile).find(Boolean)
const runtimeFolder = runtimeFile ? getFolder(runtimeFile) : null

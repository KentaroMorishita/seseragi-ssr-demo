const internalOrigin = "http://127.0.0.1:3001"
const port = Number(process.env.PORT ?? "8080")

const app = Bun.spawn(["bun", "generated/entry.ts"], {
  cwd: process.cwd(),
  env: process.env,
  stdout: "pipe",
  stderr: "pipe",
})

let childStdout = ""
let childStderr = ""

void capture(app.stdout, (text) => {
  childStdout = tail(childStdout + text)
})

void capture(app.stderr, (text) => {
  childStderr = tail(childStderr + text)
})

const client = Bun.file("client-dist/assets/app.js")

async function capture(
  stream: ReadableStream<Uint8Array>,
  append: (text: string) => void
): Promise<void> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    append(decoder.decode(value, { stream: true }))
  }

  append(decoder.decode())
}

function tail(text: string): string {
  return text.length <= 2000 ? text : text.slice(-2000)
}

async function proxy(request: Request): Promise<Response> {
  const incoming = new URL(request.url)
  const target = `${internalOrigin}${incoming.pathname}${incoming.search}`

  let lastError: unknown
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      return await fetch(new Request(target, request))
    } catch (error) {
      lastError = error
      await Bun.sleep(50)
    }
  }

  const exited = app.exitCode !== null
  const detail = [
    `child=${exited ? `exited:${app.exitCode}` : "running"}`,
    `proxy=${lastError instanceof Error ? lastError.message : String(lastError)}`,
    childStderr ? `stderr=${childStderr}` : "",
    childStdout ? `stdout=${childStdout}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  console.error("Seseragi server did not become ready", detail)
  return new Response(`Seseragi server unavailable\n${detail}`, {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" },
  })
}

Bun.serve({
  hostname: "0.0.0.0",
  port,
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === "/client.js") {
      return new Response(client, {
        headers: {
          "content-type": "text/javascript; charset=utf-8",
          "cache-control": "public, max-age=60",
        },
      })
    }

    return proxy(request)
  },
})

process.on("SIGTERM", () => app.kill())
process.on("SIGINT", () => app.kill())

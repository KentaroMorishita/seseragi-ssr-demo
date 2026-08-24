const internalOrigin = "http://127.0.0.1:3001"
const port = Number(process.env.PORT ?? "8080")

const app = Bun.spawn(["bun", "generated/entry.ts"], {
  cwd: process.cwd(),
  env: process.env,
  stdout: "inherit",
  stderr: "inherit",
})

const client = Bun.file("client-dist/assets/app.js")

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

  console.error("Seseragi server did not become ready", lastError)
  return new Response("Seseragi server unavailable", { status: 503 })
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

import { render } from "__SESERAGI_VIEW_MODULE__"

Bun.serve({
  fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === "/health") {
      return new Response("ok", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    }

    if (request.method !== "GET") {
      return new Response("method not allowed", {
        status: 405,
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    }

    return new Response(render(url.pathname), {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  },
})

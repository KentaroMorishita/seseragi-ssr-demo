import { render } from "__SESERAGI_VIEW_MODULE__"
import clientSource from "__SESERAGI_CLIENT_MODULE__" with { type: "text" }

const clientTag = '<script type="module" src="/client.js"></script>'

Bun.serve({
  fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === "/health") {
      return new Response("ok", {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    }

    if (url.pathname === "/client.js") {
      return new Response(clientSource, {
        status: 200,
        headers: {
          "content-type": "text/javascript; charset=utf-8",
          "cache-control": "public, max-age=0, must-revalidate",
        },
      })
    }

    if (request.method !== "GET") {
      return new Response("method not allowed", {
        status: 405,
        headers: { "content-type": "text/plain; charset=utf-8" },
      })
    }

    const document = render(url.pathname).replace("</body>", `${clientTag}</body>`)

    return new Response(document, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  },
})

# seseragi-ssr-demo

A minimal server-side rendering demo written in Seseragi.

The request is handled by `std/http/server`, the UI is built as a pure `html.Html` tree, and `html.renderToString` produces the response body on the server.

```text
HTTP request
    ↓
std/http/server
    ↓
view : String -> Html<Action>
    ↓
html.renderToString
    ↓
HTML response
```

## Run

Install the current Seseragi CLI from the language repository:

```sh
cargo install \
  --git https://github.com/KentaroMorishita/seseragi \
  --locked \
  seseragi-cli
```

Then run the demo:

```sh
seseragi run .
```

In another terminal:

```sh
curl http://127.0.0.1:3000/
```

The current HTTP server surface exposes `serveOnce`, so this demo intentionally handles one request and exits. It is a small proof of the SSR path rather than a production server.

## Structure

```text
src/
├── main.ssrg  # HTTP boundary
└── view.ssrg  # pure Html tree + SSR rendering
```

No JSX or external template engine is involved.

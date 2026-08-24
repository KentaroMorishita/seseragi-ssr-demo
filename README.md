# seseragi-ssr-demo

A server-side rendering + hydration demo written in Seseragi and deployed as a Vercel Bun Function.

The server and browser builds share the same pure counter view through a local Seseragi package. The first HTTP response already contains the complete counter markup with value `0`. The browser then hydrates that existing subtree with `HydrateStrict` and attaches a fine-grained `bindText` subscription to `#counter-value`.

After hydration, clicking `+1` updates only the bound counter text. The surrounding counter layout and buttons are not replaced on each Signal publication.

```text
HTTP request
    ↓
Seseragi server render
    ↓
complete SSR HTML (counter = 0)
    ↓
browser loads /client.js
    ↓
HydrateStrict reuses the existing DOM
    ↓
DomContent + bindText attaches Signal<Int> to #counter-value
    ↓
click → Action → Signal update → textContent update
```

The page is responsive and the document includes a mobile viewport. Touch controls use 16px text, a minimum 44px hit area, and `touch-action: manipulation` so the demo behaves naturally on mobile browsers.

## Run locally

Install the current Seseragi CLI from the language repository:

```sh
cargo install \
  --git https://github.com/KentaroMorishita/seseragi \
  --locked \
  seseragi-cli
```

Then run the SSR process demo:

```sh
seseragi lock update
seseragi run .
```

In another terminal:

```sh
curl http://127.0.0.1:3000/hello-ssr
```

The local process uses `std/http/server`. The Vercel deployment uses a tiny Bun hosting adapter that calls the same compiled Seseragi `render` function and serves the compiled browser bundle.

## Production artifact

CI tracks the current Seseragi `main` branch. It refreshes the package lock graph, builds both targets, proves the generated process artifact runs directly on Bun, then bundles the server render modules, runtime, and browser client into one Bun Function.

```text
root process package                  client browser package
        │                                      │
        └─────── both depend on ui/ ───────────┘
                         │
                  shared pure counter

src/*.ssrg                         client/src/*.ssrg
    ↓ seseragi build                   ↓ seseragi build
process TypeScript + runtime       browser app.js
           \                         /
            └────── bun build ──────┘
                       ↓
              self-contained Bun Function
                       ↓
                Vercel Fluid Compute
```

Rust is required while compiling Seseragi source. The deployed application executes on Bun.

`VERCEL_TOKEN` is stored as a GitHub Actions secret and pushes to `main` deploy to production automatically.

## Structure

```text
src/
├── main.ssrg          # process entrypoint only
├── server.ssrg        # std/http/server request boundary
├── document.ssrg      # HTML document shell + mobile viewport
├── page.ssrg          # pure page composition
└── styles.ssrg        # responsive page styles

ui/
├── seseragi.toml      # shared local package
└── src/
    ├── counter.ssrg   # pure counter Html shared by SSR and browser
    └── styles.ssrg    # shared counter styles

client/
├── seseragi.toml      # browser-target package + ui path dependency
└── src/
    ├── main.ssrg      # browser entrypoint only
    └── counter.ssrg   # state, Action, HydrateStrict, DomContent, bindText

vercel/
└── entry.ts           # thin Bun hosting adapter template
```

No JSX, external template engine, component hook system, or whole-tree rerender is required for the counter update path.

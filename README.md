# seseragi-ssr-demo

A minimal server-side rendering + hydration demo written in Seseragi and deployed as a Vercel Bun Function.

The initial UI is a pure `html.Html` tree and `html.renderToString` produces the HTML on the server. A small counter is already present in that first response with value `0`. In the browser, a second Seseragi web build attaches to the existing `#counter-app` subtree using `std/web/dom` with `HydrateStrict`, then typed `Action` values update a `MutableSignal<Int>`.

```text
HTTP request
    ↓
Vercel Bun Function
    ↓
compiled Seseragi render
    ↓
complete SSR HTML (counter = 0)
    ↓
browser loads /client.js
    ↓
Seseragi std/web/dom HydrateStrict
    ↓
existing DOM becomes interactive
```

Locally, the server request boundary is Seseragi's `std/http/server`. On Vercel, a tiny Bun hosting adapter calls the same compiled Seseragi `render` function directly and also serves the compiled browser bundle.

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

The Vercel deployment additionally includes the browser hydration client built from `client/`.

## Production artifact

CI tracks the current Seseragi `main` branch. It refreshes both package lockfiles, builds the process SSR artifact and browser hydration artifact, proves the generated process program runs directly on Bun, then bundles the server adapter, generated Seseragi SSR modules, runtime, and browser bundle into one self-contained Bun Function.

```text
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

Rust is only required while compiling Seseragi source. The deployed application executes on Bun.

`VERCEL_TOKEN` is stored as a GitHub Actions secret and pushes to `main` deploy to production automatically.

## Structure

```text
src/
├── main.ssrg          # local Seseragi HTTP boundary
└── view.ssrg          # pure Html tree + SSR rendering

client/
├── seseragi.toml      # browser-target package
└── src/main.ssrg      # HydrateStrict + typed counter actions

vercel/
└── entry.ts           # tiny Bun hosting adapter template
```

No JSX or external template engine is involved.

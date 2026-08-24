# seseragi-ssr-demo

A minimal server-side rendering demo written in Seseragi and deployed as a Vercel Bun Function.

The UI is a pure `html.Html` tree and `html.renderToString` produces the HTML on the server. Locally, the request boundary is Seseragi's `std/http/server`. On Vercel, a tiny Bun hosting adapter calls the same compiled Seseragi `render` function directly.

```text
Local
HTTP request
    ↓
std/http/server
    ↓
Seseragi render
    ↓
HTML response

Vercel
HTTP request
    ↓
Bun Function adapter
    ↓
compiled Seseragi render
    ↓
HTML response
```

## Run locally

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
curl http://127.0.0.1:3000/hello-ssr
```

## Production artifact

CI builds the process target into `generated/` and first proves that the generated Seseragi program itself runs directly on Bun. It then locates the compiled `render` export, injects it into the Vercel Bun adapter, and bundles the adapter + generated Seseragi modules + runtime into one self-contained function.

```text
.ssrg
  ↓  seseragi build (Rust compiler in CI)
generated TypeScript + runtime
  ↓  bun build
self-contained Bun function
  ↓
Vercel Fluid Compute
```

Rust is only required while compiling Seseragi source. The deployed application executes on Bun.

`VERCEL_TOKEN` is stored as a GitHub Actions secret and pushes to `main` deploy to production automatically.

## Structure

```text
src/
├── main.ssrg  # local Seseragi HTTP boundary
└── view.ssrg  # pure Html tree + SSR rendering

vercel/
└── entry.ts   # tiny Bun hosting adapter template
```

No JSX or external template engine is involved.

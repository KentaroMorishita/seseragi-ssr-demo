# seseragi-ssr-demo

A minimal server-side rendering demo written in Seseragi and deployed as a Vercel Bun Function.

The request is handled by `std/http/server`, the UI is built as a pure `html.Html` tree, and `html.renderToString` produces the response body on the server.

```text
HTTP request
    ↓
Vercel Bun Function
    ↓
std/http/server
    ↓
view : String -> Html<Action>
    ↓
html.renderToString
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

CI builds the process target into `generated/`, verifies that the generated artifact runs directly with Bun, then bundles the whole Seseragi application and runtime into one self-contained Vercel Bun Function.

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
├── main.ssrg  # Seseragi HTTP boundary
└── view.ssrg  # pure Html tree + SSR rendering

api/
└── index.ts   # thin Vercel build entry; bundled away in CI
```

No JSX or external template engine is involved.

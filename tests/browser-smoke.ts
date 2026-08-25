import { chromium } from "playwright"

const baseUrl = process.env.TODO_BASE_URL ?? "http://127.0.0.1:8080"
const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage()
  const consoleErrors: string[] = []
  const pageErrors: string[] = []

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text())
  })
  page.on("pageerror", (error) => pageErrors.push(error.stack ?? error.message))

  await page.goto(baseUrl, { waitUntil: "networkidle" })
  await page.waitForFunction(() => document.documentElement.dataset.seseragiStatus === "mounted")

  const root = page.locator("#todo-interactive")
  await root.waitFor()

  const title = `Browser Todo ${Date.now()}`
  const input = root.locator("#todo-input")
  await input.fill(title)
  await root.locator("form button[type=submit]").click()

  let row = root.locator("#todo-list li").filter({ hasText: title })
  await row.waitFor()

  await row.getByRole("button", { name: "Open" }).click()
  row = root.locator("#todo-list li").filter({ hasText: title })
  await row.getByRole("button", { name: "Done" }).waitFor()

  await row.getByRole("button", { name: "Delete" }).click()
  await page.waitForFunction(
    (todoTitle) => ![...document.querySelectorAll("#todo-list li")].some((item) => item.textContent?.includes(todoTitle)),
    title,
  )

  const status = await page.evaluate(() => document.documentElement.dataset.seseragiStatus)
  if (status !== "mounted") throw new Error(`Seseragi browser status changed to ${status}`)
  if (consoleErrors.length > 0) throw new Error(`browser console errors:\n${consoleErrors.join("\n")}`)
  if (pageErrors.length > 0) throw new Error(`browser page errors:\n${pageErrors.join("\n")}`)

  console.log("Todo browser smoke passed: hydrate -> add -> toggle -> delete")
} finally {
  await browser.close()
}

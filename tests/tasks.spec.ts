import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import { STORAGE_KEY } from "../src/features/tasks/model/storage"

test("adds, completes and removes tasks across reloads", async ({ page }) => {
  await page.goto("/")
  const field = page.getByRole("textbox", { name: "Новая задача" })
  const name = "Сверить макет"

  await page.getByRole("button", { name: "Добавить" }).click()
  await expect(page.getByText("Введите название задачи.")).toBeVisible()
  await field.fill(`  ${name}  `)
  await field.press("Enter")
  await expect(field).toBeEmpty()

  const task = page.getByRole("checkbox", { name, exact: true })
  await expect(task).toBeVisible()
  await expect(task).not.toBeChecked()
  // The text label is also a touch target.
  await page.getByText(name, { exact: true }).click()
  await expect(task).toBeChecked()
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Выполнено 3 из 6")

  await page.reload()
  await expect(task).toBeChecked()
  await page.getByRole("button", { name: `Удалить: ${name}`, exact: true }).click()
  await expect(task).toHaveCount(0)
  await page.reload()
  await expect(task).toHaveCount(0)
})

test("filters tasks by keyboard and restores the last deletion", async ({ page }) => {
  await page.goto("/")
  const all = page.getByRole("radio", { name: /^Все/ })
  const active = page.getByRole("radio", { name: /^В работе/ })
  const done = page.getByRole("radio", { name: /^Готово/ })

  await all.focus()
  await all.press("ArrowRight")
  await expect(active).toBeChecked()
  const first = page.getByRole("checkbox", { name: "Наметить три главных дела на день" })
  await first.focus()
  await first.press("Space")
  await expect(first).toHaveCount(0)
  await expect(page.getByRole("checkbox", { name: "Ответить на важные письма" })).toBeFocused()

  await active.focus()
  await active.press("ArrowRight")
  await expect(done).toBeChecked()
  await expect(first).toBeChecked()
  await page.getByRole("button", { name: "Удалить: Наметить три главных дела на день" }).click()
  await expect(first).toHaveCount(0)
  await page.getByRole("button", { name: "Отменить" }).click()
  await expect(first).toBeChecked()

  const field = page.getByRole("textbox", { name: "Новая задача" })
  await field.fill("Подготовить материалы")
  await field.press("Enter")
  await expect(all).toBeChecked()
  await expect(page.getByRole("checkbox", { name: "Подготовить материалы" })).toBeVisible()
})

test("keeps an intentionally empty list empty after reload", async ({ page }) => {
  await page.goto("/")
  const remove = page.getByRole("button", { name: /^Удалить:/ })
  while (await remove.count()) await remove.first().click()
  await expect(page.getByText("Список пока пуст")).toBeVisible()
  await page.reload()
  await expect(page.getByText("Список пока пуст")).toBeVisible()
  await expect(page.getByRole("checkbox")).toHaveCount(0)
})

test("recovers from a damaged stored list and saves the replacement", async ({ page }) => {
  await page.addInitScript((key) => {
    if (sessionStorage.getItem("setup")) return
    localStorage.setItem(key, "{broken")
    sessionStorage.setItem("setup", "true")
  }, STORAGE_KEY)
  await page.goto("/")
  await expect(page.getByText("Не удалось прочитать сохранённый список.", { exact: false })).toBeVisible()
  const field = page.getByRole("textbox", { name: "Новая задача" })
  await field.fill("Начать заново")
  await field.press("Enter")
  await page.reload()
  await expect(page.getByRole("checkbox", { name: "Начать заново" })).toBeVisible()
  await expect(page.getByText("Не удалось прочитать сохранённый список.", { exact: false })).toHaveCount(0)
})

test("keeps the list usable when writes to local storage fail", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage full", "QuotaExceededError")
    }
  })
  await page.goto("/")
  const field = page.getByRole("textbox", { name: "Новая задача" })
  await field.fill("Работа без хранилища")
  await field.press("Enter")
  await expect(page.getByRole("checkbox", { name: "Работа без хранилища" })).toBeVisible()
  await expect(page.getByText("Хранилище браузера недоступно.", { exact: false })).toBeVisible()
})

test("updates open tabs after a storage change", async ({ page, context }) => {
  const second = await context.newPage()
  await Promise.all([page.goto("/"), second.goto("/")])
  const field = page.getByRole("textbox", { name: "Новая задача" })
  await field.fill("Увидеть в другой вкладке")
  await field.press("Enter")
  await expect(second.getByRole("checkbox", { name: "Увидеть в другой вкладке" })).toBeVisible()
})

test("renders at narrow widths, handles long labels and passes an accessibility scan", async ({ page }) => {
  await page.goto("/")
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  expect(axe.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target) }))).toEqual([])

  const field = page.getByRole("textbox", { name: "Новая задача" })
  const longTitle = "С".repeat(160)
  await field.fill(longTitle)
  await field.press("Enter")
  await expect(page.getByRole("checkbox", { name: longTitle })).toBeVisible()
  for (const width of [320, 375, 414, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      `overflow at ${width}px`
    ).toBeLessThanOrEqual(width)
  }
})

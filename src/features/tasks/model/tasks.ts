export type Task = Readonly<{ id: string; title: string; completed: boolean }>
export type TaskFilter = "all" | "active" | "completed"

export const MAX_TITLE_LENGTH = 160

export const exampleTasks: readonly Task[] = [
  { id: "example-1", title: "Наметить три главных дела на день", completed: false },
  { id: "example-2", title: "Ответить на важные письма", completed: false },
  { id: "example-3", title: "Выбраться на короткую прогулку", completed: false },
  { id: "example-4", title: "Разобрать заметки", completed: true },
  { id: "example-5", title: "Проверить календарь", completed: true }
]

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false

  return (
    "id" in value &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    "title" in value &&
    typeof value.title === "string" &&
    value.title.length <= MAX_TITLE_LENGTH &&
    value.title.trim().length > 0 &&
    "completed" in value &&
    typeof value.completed === "boolean"
  )
}

export function matchesFilter(task: Task, filter: TaskFilter) {
  return filter === "all" || task.completed === (filter === "completed")
}

export function taskCountLabel(count: number) {
  const plural = new Intl.PluralRules("ru").select(count)
  const noun = plural === "one" ? "задача" : plural === "few" ? "задачи" : "задач"

  return `${count} ${noun}`
}

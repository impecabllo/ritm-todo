import { exampleTasks, isTask } from "./tasks"
import type { Task } from "./tasks"

export const STORAGE_KEY = "ritm-todo:list:v1"

type StorageState = "ready" | "unavailable" | "invalid"
export type TaskState = { tasks: readonly Task[]; storage: StorageState }

function decodeTasks(raw: string | null): TaskState {
  if (raw === null) return { tasks: exampleTasks, storage: "ready" }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (
      Array.isArray(parsed) &&
      parsed.every(isTask) &&
      new Set(parsed.map(({ id }) => id)).size === parsed.length
    ) {
      return { tasks: parsed, storage: "ready" }
    }
  } catch {
    // A malformed snapshot should not prevent the app from opening.
  }

  return { tasks: [], storage: "invalid" }
}

export function loadTasks(): TaskState {
  try {
    return decodeTasks(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return { tasks: [], storage: "unavailable" }
  }
}

export function saveTasks(tasks: readonly Task[]): StorageState {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    return "ready"
  } catch {
    return "unavailable"
  }
}

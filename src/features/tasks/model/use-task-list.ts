import { useEffect, useState } from "react"
import { loadTasks, saveTasks, STORAGE_KEY } from "./storage"
import { MAX_TITLE_LENGTH } from "./tasks"
import type { Task } from "./tasks"

type RemovedTask = { task: Task; nextId: string | undefined }

export function useTaskList() {
  const [{ tasks, storage }, setState] = useState(loadTasks)
  const [removed, setRemoved] = useState<RemovedTask | null>(null)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return

      try {
        if (event.storageArea !== window.localStorage) return
      } catch {
        return
      }

      // A queued event can carry an older snapshot than storage currently holds.
      setState(loadTasks())
      setRemoved(null)
    }

    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])

  function commit(next: readonly Task[], message: string) {
    setState({ tasks: next, storage: saveTasks(next) })
    setAnnouncement(message)
  }

  function add(title: string) {
    const cleanTitle = title.trim()
    if (!cleanTitle || cleanTitle.length > MAX_TITLE_LENGTH) return false

    const task: Task = { id: crypto.randomUUID(), title: cleanTitle, completed: false }
    commit([task, ...tasks], `Добавлено: ${cleanTitle}`)
    return true
  }

  function setCompleted(id: string, completed: boolean) {
    const task = tasks.find((entry) => entry.id === id)
    if (!task || task.completed === completed) return

    commit(
      tasks.map((entry) => (entry.id === id ? { ...entry, completed } : entry)),
      `${completed ? "Выполнено" : "Возвращено в работу"}: ${task.title}`
    )
  }

  function remove(id: string) {
    const index = tasks.findIndex((task) => task.id === id)
    const task = tasks[index]
    if (!task) return

    setRemoved({ task, nextId: tasks[index + 1]?.id })
    commit(
      tasks.filter((entry) => entry.id !== id),
      `Удалено: ${task.title}. Можно отменить удаление.`
    )
  }

  function undoRemove() {
    if (!removed) return

    const next = [...tasks]
    const index = next.findIndex((task) => task.id === removed.nextId)
    next.splice(index < 0 ? next.length : index, 0, removed.task)
    commit(next, `Восстановлено: ${removed.task.title}`)
    setRemoved(null)
    return removed.task
  }

  return {
    tasks,
    storage,
    removed,
    announcement,
    add,
    setCompleted,
    remove,
    undoRemove,
    dismissUndo: () => setRemoved(null)
  }
}

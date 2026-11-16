import { CheckCheck, ClipboardList, HardDrive, RotateCcw, X } from "lucide-react"
import { useRef, useState } from "react"
import { matchesFilter, taskCountLabel } from "../model/tasks"
import type { Task, TaskFilter } from "../model/tasks"
import { useTaskList } from "../model/use-task-list"
import { ProgressCard } from "./progress-card"
import { TaskComposer } from "./task-composer"
import { TaskFilters } from "./task-filters"
import { TaskRow } from "./task-row"

const emptyCopy = {
  all: ["Список пока пуст", "Добавьте первую задачу в поле выше."],
  active: ["Нет задач в работе", "Можно добавить новую или открыть полный список."],
  completed: ["Пока ничего не выполнено", "Отметьте готовую задачу, и она появится здесь."]
} as const

export function TaskBoard() {
  const list = useTaskList()
  const [filter, setFilter] = useState<TaskFilter>("all")
  const inputRef = useRef<HTMLInputElement>(null)
  const controls = useRef(new Map<string, HTMLButtonElement>())
  const completed = list.tasks.filter((task) => task.completed).length
  const visible = list.tasks.filter((task) => matchesFilter(task, filter))
  const [emptyTitle, emptyDescription] = emptyCopy[filter]

  function registerControl(id: string, control: HTMLButtonElement | null) {
    if (control) controls.current.set(id, control)
    else controls.current.delete(id)
  }

  function moveFocusFrom(task: Task) {
    const index = visible.findIndex(({ id }) => id === task.id)
    const neighbor = visible[index + 1] ?? visible[index - 1]
    const target = (neighbor && controls.current.get(neighbor.id)) ?? inputRef.current
    target?.focus()
  }

  return (
    <div className="board">
      <ProgressCard completed={completed} total={list.tasks.length} />
      <section className="list-panel" aria-labelledby="list-title">
        <div className="list-heading">
          <h2 id="list-title">Список дел</h2>
          <span className="list-count">{taskCountLabel(list.tasks.length)}</span>
        </div>
        <TaskComposer
          inputRef={inputRef}
          onAdd={(title) => {
            if (!list.add(title)) return false
            if (filter === "completed") setFilter("all")
            return true
          }}
        />
        {list.storage !== "ready" && (
          <p className="storage-warning" role="status">
            {list.storage === "invalid"
              ? "Не удалось прочитать сохранённый список. Следующее изменение сохранит новый список."
              : "Хранилище браузера недоступно. Изменения могут потеряться при перезагрузке."}
          </p>
        )}
        <TaskFilters
          filter={filter}
          counts={{ all: list.tasks.length, active: list.tasks.length - completed, completed }}
          onSelect={setFilter}
        />
        {visible.length ? (
          <ul className="task-list" role="list">
            {visible.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                registerControl={registerControl}
                onCompleted={(entry, checked) => {
                  if (!matchesFilter({ ...entry, completed: checked }, filter)) moveFocusFrom(entry)
                  list.setCompleted(entry.id, checked)
                }}
                onRemove={(entry) => {
                  moveFocusFrom(entry)
                  list.remove(entry.id)
                }}
              />
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">
              {filter === "active" ? (
                <CheckCheck size={22} aria-hidden="true" />
              ) : (
                <ClipboardList size={22} aria-hidden="true" />
              )}
            </span>
            <p>{emptyTitle}</p>
            <span>{emptyDescription}</span>
          </div>
        )}
        {list.removed && (
          <div className="undo-bar">
            <span className="undo-message">Задача удалена</span>
            <button
              className="undo-button"
              type="button"
              onClick={() => {
                inputRef.current?.focus()
                const restored = list.undoRemove()
                if (restored && !matchesFilter(restored, filter)) setFilter("all")
              }}
            >
              <RotateCcw size={15} aria-hidden="true" /> Отменить
            </button>
            <button
              className="icon-button"
              type="button"
              aria-label="Скрыть сообщение"
              onClick={() => {
                inputRef.current?.focus()
                list.dismissUndo()
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="list-footer">
          <HardDrive size={14} aria-hidden="true" />
          <span>
            {list.storage === "ready"
              ? "Задачи хранятся в этом браузере"
              : "Не удалось подтвердить сохранение"}
          </span>
        </div>
        <span className="sr-only" role="status">
          {list.announcement}
        </span>
      </section>
    </div>
  )
}

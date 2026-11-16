import { ArrowUpRight, CalendarDays } from "lucide-react"
import { TaskBoard } from "../features/tasks/ui/task-board"

const repository = "https://github.com/impecabllo/ritm-todo"
const dateFormat = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" })

export function App() {
  return (
    <>
      <header className="masthead">
        <div className="shell masthead-inner">
          <div className="brand">
            <img src={`${import.meta.env.BASE_URL}mark.svg`} width="36" height="36" alt="" />
            <span>
              ритм<span className="brand-dot">.</span>
            </span>
          </div>
          <a className="source-link" href={repository}>
            Исходники <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </header>
      <main className="shell workspace">
        <div className="intro">
          <p className="date-label">
            <CalendarDays size={16} aria-hidden="true" /> {dateFormat.format(new Date())}
          </p>
          <h1>
            Мои задачи<span>.</span>
          </h1>
          <p className="intro-copy">Запишите дела и отмечайте то, что уже сделали.</p>
        </div>
        <TaskBoard />
        <footer className="workspace-footer">
          <span>
            Ритм <span className="footer-divider">/</span> Личный планировщик
          </span>
          <span className="keyboard-hint">
            <kbd>Enter</kbd> добавить задачу
          </span>
        </footer>
      </main>
    </>
  )
}

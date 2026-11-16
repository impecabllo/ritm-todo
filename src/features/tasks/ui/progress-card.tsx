import { CircleCheck, ListTodo } from "lucide-react"

export function ProgressCard({ completed, total }: { completed: number; total: number }) {
  const percent = total ? Math.round((completed / total) * 100) : 0

  return (
    <aside className="progress-card" aria-labelledby="progress-heading">
      <svg className="progress-art" viewBox="0 0 360 260" fill="none" aria-hidden="true">
        <defs>
          <pattern id="dot-field" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="art-dot" />
          </pattern>
        </defs>
        <path d="M101 80H360V260H101z" fill="url(#dot-field)" />
        <g className="art-lines">
          <path d="M10 303C114 303 172 268 172 190S215 55 385 55" />
          <path d="M27 303C128 303 186 269 186 192S226 69 385 69" />
          <path d="M44 303C142 303 200 271 200 194S237 83 385 83" />
          <path d="M61 303C156 303 214 272 214 196S248 97 385 97" />
          <path d="M78 303C170 303 228 274 228 198S259 111 385 111" />
          <path d="M95 303C184 303 242 275 242 200S270 125 385 125" />
          <path d="M112 303C198 303 256 277 256 202S281 139 385 139" />
          <path d="M129 303C212 303 270 278 270 204S292 153 385 153" />
        </g>
      </svg>
      <h2 className="progress-heading" id="progress-heading">
        <ListTodo size={17} aria-hidden="true" /> Прогресс списка
      </h2>
      <p className="progress-value" aria-hidden="true">
        {percent}
        <span>%</span>
      </p>
      <p className="progress-caption">
        Выполнено {completed} из {total}
      </p>
      <progress
        className="progress-track"
        value={completed}
        max={total || 1}
        aria-labelledby="progress-heading"
        aria-valuetext={`Выполнено ${completed} из ${total}`}
      />
      <div className="progress-footer">
        <CircleCheck size={16} aria-hidden="true" />
        {total === 0
          ? "Начните с одной задачи"
          : completed === total
            ? "Все задачи выполнены"
            : "Отмечайте сделанное"}
      </div>
    </aside>
  )
}

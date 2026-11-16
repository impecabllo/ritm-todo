import type { TaskFilter } from "../model/tasks"

const choices = [
  { value: "all", label: "Все" },
  { value: "active", label: "В работе" },
  { value: "completed", label: "Готово" }
] as const

type Props = {
  filter: TaskFilter
  counts: Record<TaskFilter, number>
  onSelect: (filter: TaskFilter) => void
}

export function TaskFilters({ filter, counts, onSelect }: Props) {
  return (
    <fieldset className="filters">
      <legend className="sr-only">Показать задачи</legend>
      {choices.map(({ value, label }) => (
        <label className="filter" key={value}>
          <input
            className="sr-only"
            type="radio"
            name="task-filter"
            checked={filter === value}
            onChange={() => onSelect(value)}
          />
          <span className="filter-label">
            {label} <span className="filter-count">{counts[value]}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}

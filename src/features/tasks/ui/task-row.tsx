import { Checkbox, CheckboxIndicator } from "@radix-ui/react-checkbox"
import { Check, Trash2 } from "lucide-react"
import { useId } from "react"
import type { Task } from "../model/tasks"

type Props = {
  task: Task
  onCompleted: (task: Task, completed: boolean) => void
  onRemove: (task: Task) => void
  registerControl: (id: string, element: HTMLButtonElement | null) => void
}

export function TaskRow({ task, onCompleted, onRemove, registerControl }: Props) {
  const id = useId()

  return (
    <li className="task-row" data-completed={task.completed}>
      <div className="task-body">
        <Checkbox
          ref={(element) => {
            registerControl(task.id, element)
          }}
          className="task-check"
          id={id}
          checked={task.completed}
          onCheckedChange={(checked) => onCompleted(task, checked === true)}
        >
          <CheckboxIndicator className="task-indicator">
            <Check size={15} strokeWidth={2.5} aria-hidden="true" />
          </CheckboxIndicator>
        </Checkbox>
        <label className="task-title" htmlFor={id}>
          {task.title}
        </label>
      </div>
      <button
        className="icon-button delete-button"
        type="button"
        aria-label={`Удалить: ${task.title}`}
        onClick={() => onRemove(task)}
      >
        <Trash2 size={17} aria-hidden="true" />
      </button>
    </li>
  )
}

import { Plus } from "lucide-react"
import { useId, useState } from "react"
import type { FormEvent, RefObject } from "react"
import { MAX_TITLE_LENGTH } from "../model/tasks"

type Props = {
  onAdd: (title: string) => boolean
  inputRef: RefObject<HTMLInputElement | null>
}

export function TaskComposer({ onAdd, inputRef }: Props) {
  const [draft, setDraft] = useState("")
  const [attempted, setAttempted] = useState(false)
  const id = useId()
  const invalid = attempted && draft.trim().length === 0

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (onAdd(draft)) {
      setDraft("")
      setAttempted(false)
    } else {
      setAttempted(true)
    }

    inputRef.current?.focus()
  }

  return (
    <form className="composer-form" onSubmit={submit}>
      <label className="sr-only" htmlFor={id}>
        Новая задача
      </label>
      <div className="composer">
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder="Название задачи"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            setAttempted(false)
          }}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          maxLength={MAX_TITLE_LENGTH}
          autoComplete="off"
        />
        <button className="add-button" type="submit">
          <Plus size={17} aria-hidden="true" />
          Добавить
        </button>
      </div>
      {invalid && (
        <p className="composer-error" id={`${id}-error`} role="alert">
          Введите название задачи.
        </p>
      )}
    </form>
  )
}

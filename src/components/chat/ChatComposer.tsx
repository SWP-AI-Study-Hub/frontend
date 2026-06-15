'use client'

import { FormEvent } from 'react'
import { ArrowUp, LoaderCircle } from 'lucide-react'

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  placeholder: string
}) {
  function submit(event: FormEvent) {
    event.preventDefault()
    if (!value.trim() || isLoading) return
    onSubmit()
  }

  return (
    <form className="chat-composer" onSubmit={submit}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={2}
        maxLength={4000}
      />
      <button
        type="submit"
        className="chat-send"
        disabled={!value.trim() || isLoading}
        aria-label="Gửi câu hỏi"
      >
        {isLoading ? <LoaderCircle className="spin" size={19} /> : <ArrowUp size={19} />}
      </button>
    </form>
  )
}

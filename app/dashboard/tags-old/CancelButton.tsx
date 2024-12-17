"use client"

export function CancelButton() {
  return (
    <button
      type="button"
      onClick={() => history.back()}
      className="border px-4 py-2"
    >
      Cancel
    </button>
  )
}

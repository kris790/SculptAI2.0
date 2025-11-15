import React from 'react';

interface ErrorMessageProps {
  error: Error | null
  onDismiss?: () => void
}

export const ErrorMessage = ({ error, onDismiss }: ErrorMessageProps) => {
  if (!error) return null

  return (
    <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error.message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          aria-label="Dismiss error"
        >
          <span className="text-2xl">&times;</span>
        </button>
      )}
    </div>
  )
}

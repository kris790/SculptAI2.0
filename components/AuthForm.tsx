
import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { useAsyncAction } from '../lib/hooks/useAsyncAction'
import { emailSchema, passwordSchema } from '../lib/validations'
import { ErrorMessage } from './ui/ErrorMessage'
import { LoadingSpinner } from './ui/LoadingSpinner'

type FormMode = 'signin' | 'signup' | 'reset'

export default function AuthForm() {
  const [email, setEmail] = useState('demo@sculptai.com')
  const [password, setPassword] = useState('Password123!')
  const [confirmPassword, setConfirmPassword] = useState('Password123!')
  const [mode, setMode] = useState<FormMode>('signin')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  const { signIn, signUp, resetPassword, user } = useAuth()
  const { execute, loading, error, clearError } = useAsyncAction()

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validate email
    const emailResult = emailSchema.safeParse(email)
    if (!emailResult.success) {
      errors.email = emailResult.error.issues[0].message
    }

    // Validate password for signin and signup
    if (mode !== 'reset') {
      const passwordResult = passwordSchema.safeParse(password)
      if (!passwordResult.success) {
        errors.password = passwordResult.error.issues[0].message
      }

      // Check password confirmation for signup
      if (mode === 'signup' && password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    clearError()
    setSuccessMessage('')

    await execute(async () => {
      if (mode === 'signin') {
        await signIn(email, password)
      } else if (mode === 'signup') {
        await signUp(email, password)
        setSuccessMessage('Account created! Please check your email to verify your account.')
      } else if (mode === 'reset') {
        await resetPassword(email)
        setSuccessMessage('Password reset email sent! Please check your inbox.')
      }
    })
  }

  if (user) {
    return (
      <div className="text-center">
        <p className="text-lg">Welcome back, <strong>{user.email}</strong>!</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === 'signin' && 'Sign In'}
        {mode === 'signup' && 'Create Account'}
        {mode === 'reset' && 'Reset Password'}
      </h2>

      {error && <div className="mb-4"><ErrorMessage error={error} onDismiss={clearError} /></div>}
      
      {successMessage && (
        <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            aria-invalid={!!validationErrors.email}
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-600"
          />
          {validationErrors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400">{validationErrors.email}</p>
          )}
        </div>

        {mode !== 'reset' && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                aria-invalid={!!validationErrors.password}
                aria-describedby={validationErrors.password ? 'password-error' : undefined}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-600"
              />
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-400">{validationErrors.password}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  aria-invalid={!!validationErrors.confirmPassword}
                  aria-describedby={validationErrors.confirmPassword ? 'confirm-password-error' : undefined}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-600"
                />
                {validationErrors.confirmPassword && (
                  <p id="confirm-password-error" className="mt-1 text-sm text-red-400">{validationErrors.confirmPassword}</p>
                )}
              </div>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Send Reset Email'}
            </>
          )}
        </button>

        <div className="text-center space-y-2 pt-2">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-indigo-400 hover:underline text-sm"
              >
                Don't have an account? Sign up
              </button>
              <br />
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-indigo-400 hover:underline text-sm"
              >
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-indigo-400 hover:underline text-sm"
            >
              Already have an account? Sign in
            </button>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-indigo-400 hover:underline text-sm"
            >
              Back to sign in
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

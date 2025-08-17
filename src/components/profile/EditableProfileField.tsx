'use client'

import { useState, useEffect } from 'react'
import { Edit2, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditableProfileFieldProps {
  label: string
  value: string | boolean
  type?: 'text' | 'textarea' | 'select' | 'boolean'
  options?: { value: string; label: string }[]
  placeholder?: string
  isEditing: boolean
  onEdit: () => void
  onSave: (value: string | boolean) => void
  onCancel: () => void
  error?: string
  required?: boolean
  className?: string
  displayValue?: string // For custom display formatting
  isLoading?: boolean
  onRetry?: () => void
}

export default function EditableProfileField({
  label,
  value,
  type = 'text',
  options = [],
  placeholder,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  error,
  required = false,
  className,
  displayValue,
  isLoading = false,
  onRetry
}: EditableProfileFieldProps) {
  const [editValue, setEditValue] = useState<string | boolean>(value)
  const [localError, setLocalError] = useState<string>('')

  // Update edit value when value prop changes
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Clear local error when editing starts
  useEffect(() => {
    if (isEditing) {
      setLocalError('')
    }
  }, [isEditing])

  const handleSave = () => {
    // Basic validation
    if (required && type !== 'boolean' && (!editValue || (typeof editValue === 'string' && !editValue.trim()))) {
      setLocalError(`${label} is required`)
      return
    }

    // Clear any local errors
    setLocalError('')
    onSave(editValue)
  }

  const handleCancel = () => {
    setEditValue(value)
    setLocalError('')
    onCancel()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const renderDisplayValue = () => {
    if (displayValue) return displayValue
    
    if (type === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    
    if (type === 'select' && options.length > 0) {
      const option = options.find(opt => opt.value === value)
      return option?.label || value
    }
    
    return value || 'Not specified'
  }

  const renderEditInput = () => {
    const inputClassName = cn(
      'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
      (error || localError) ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
    )

    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(inputClassName, 'min-h-[80px] resize-vertical')}
            autoFocus
          />
        )

      case 'select':
        return (
          <select
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            className={inputClassName}
            autoFocus
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'boolean':
        return (
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={`${label}-radio`}
                checked={editValue === true}
                onChange={() => setEditValue(true)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={`${label}-radio`}
                checked={editValue === false}
                onChange={() => setEditValue(false)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              No
            </label>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={inputClassName}
            autoFocus
          />
        )
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {!isEditing && (
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={`Edit ${label}`}
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          {renderEditInput()}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </button>
          </div>
          
          {(error || localError) && (
            <div className="space-y-2">
              <p className="text-red-600 text-sm">{error || localError}</p>
              {error && onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-900">
          {renderDisplayValue()}
        </div>
      )}
    </div>
  )
}

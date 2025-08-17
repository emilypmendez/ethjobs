'use client'

import { useState, useEffect } from 'react'
import { Edit2, Check, X, Loader2 } from 'lucide-react'
import SkillCollection from '@/components/ui/SkillCollection'
import { cn } from '@/lib/utils'

interface EditableSkillsSectionProps {
  skills: string[]
  isEditing: boolean
  onEdit: () => void
  onSave: (skills: string[]) => void
  onCancel: () => void
  error?: string
  className?: string
  isLoading?: boolean
  onRetry?: () => void
}

export default function EditableSkillsSection({
  skills,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  error,
  className,
  isLoading = false,
  onRetry
}: EditableSkillsSectionProps) {
  const [editSkills, setEditSkills] = useState<string[]>(skills)
  const [localError, setLocalError] = useState<string>('')

  // Update edit skills when skills prop changes
  useEffect(() => {
    setEditSkills(skills)
  }, [skills])

  // Clear local error when editing starts
  useEffect(() => {
    if (isEditing) {
      setLocalError('')
    }
  }, [isEditing])

  const handleSkillsChange = (newSkills: string[]) => {
    setEditSkills(newSkills)
    // Clear error when user starts making changes
    if (localError) {
      setLocalError('')
    }
  }

  const handleSave = () => {
    // Validate that at least one skill is selected
    if (editSkills.length === 0) {
      setLocalError('At least one skill is required')
      return
    }

    // Clear any local errors
    setLocalError('')
    onSave(editSkills)
  }

  const handleCancel = () => {
    setEditSkills(skills)
    setLocalError('')
    onCancel()
  }

  const renderSkillsDisplay = () => {
    if (skills.length === 0) {
      return (
        <div className="text-gray-500 italic">
          No skills added yet
        </div>
      )
    }

    return (
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Technical Skills
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        {!isEditing && (
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit Skills"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Add or remove your technical skills to help match you with relevant opportunities:
            </p>
            
            <SkillCollection
              onSkillsChange={handleSkillsChange}
              placeholder="Add your skills (e.g., React, Solidity, Web3.js)"
              className="w-full"
              initialSkills={editSkills}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isLoading ? 'Saving...' : 'Save Skills'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4 mr-1" />
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
        renderSkillsDisplay()
      )}
    </div>
  )
}

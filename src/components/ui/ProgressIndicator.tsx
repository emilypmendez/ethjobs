'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressStep {
  id: string
  title: string
  description?: string
  completed?: boolean
  current?: boolean
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  currentStepId: string
  className?: string
  showDescriptions?: boolean
}

export default function ProgressIndicator({ 
  steps, 
  currentStepId, 
  className,
  showDescriptions = false 
}: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId)

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex || step.completed
            const isCurrent = step.id === currentStepId || step.current
            const isUpcoming = index > currentStepIndex && !step.completed

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex items-center">
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                    {
                      'bg-green-600 border-green-600 text-white': isCompleted,
                      'bg-blue-600 border-blue-600 text-white': isCurrent,
                      'bg-white border-gray-300 text-gray-500': isUpcoming
                    }
                  )}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="ml-3">
                    <div className={cn(
                      'text-sm font-medium',
                      {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent,
                        'text-gray-500': isUpcoming
                      }
                    )}>
                      {step.title}
                    </div>
                    {showDescriptions && step.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors',
                    {
                      'bg-green-600': index < currentStepIndex,
                      'bg-gray-300': index >= currentStepIndex
                    }
                  )} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-900">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <div className="text-sm text-gray-500">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {steps[currentStepIndex]?.title}
          </div>
          {showDescriptions && steps[currentStepIndex]?.description && (
            <div className="text-sm text-gray-600 mt-1">
              {steps[currentStepIndex].description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Predefined step configurations for common flows
export const PROFILE_CREATION_STEPS: ProgressStep[] = [
  {
    id: 'skills',
    title: 'Select Skills',
    description: 'Choose your technical skills'
  },
  {
    id: 'wallet',
    title: 'Connect Wallet',
    description: 'Connect your Web3 wallet'
  },
  {
    id: 'profile',
    title: 'Profile Info',
    description: 'Add your basic information'
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review and create your profile'
  }
]

export const JOB_APPLICATION_STEPS: ProgressStep[] = [
  {
    id: 'profile',
    title: 'Profile',
    description: 'Your developer profile'
  },
  {
    id: 'application',
    title: 'Application',
    description: 'Submit your application'
  },
  {
    id: 'interview',
    title: 'Interview',
    description: 'Interview process'
  },
  {
    id: 'offer',
    title: 'Offer',
    description: 'Job offer and contract'
  }
]

// Utility function to update step completion status
export function updateStepCompletion(
  steps: ProgressStep[], 
  completedStepIds: string[]
): ProgressStep[] {
  return steps.map(step => ({
    ...step,
    completed: completedStepIds.includes(step.id)
  }))
}

// Utility function to get next/previous steps
export function getAdjacentSteps(steps: ProgressStep[], currentStepId: string) {
  const currentIndex = steps.findIndex(step => step.id === currentStepId)
  
  return {
    previous: currentIndex > 0 ? steps[currentIndex - 1] : null,
    current: steps[currentIndex] || null,
    next: currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null,
    isFirst: currentIndex === 0,
    isLast: currentIndex === steps.length - 1
  }
}

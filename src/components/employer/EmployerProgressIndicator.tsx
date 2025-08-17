'use client'

import { Check, Wallet, Building, Shield, FileText, DollarSign, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmployerStep {
  id: string
  title: string
  description: string
}

interface EmployerProgressIndicatorProps {
  steps: EmployerStep[]
  currentStep: number
  className?: string
}

const STEP_ICONS = {
  'connect-wallet': Wallet,
  'company-profile': Building,
  'verification': Shield,
  'create-job': FileText,
  'approve-pyusd': DollarSign,
  'fund-escrow': Lock
}

export default function EmployerProgressIndicator({ 
  steps, 
  currentStep, 
  className 
}: EmployerProgressIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const isUpcoming = stepNumber > currentStep
            const IconComponent = STEP_ICONS[step.id as keyof typeof STEP_ICONS] || FileText

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle and Content */}
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                    {
                      'bg-green-600 border-green-600 text-white': isCompleted,
                      'bg-blue-600 border-blue-600 text-white': isCurrent,
                      'bg-white border-gray-300 text-gray-400': isUpcoming
                    }
                  )}>
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <IconComponent className="w-6 h-6" />
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center max-w-24">
                    <div className={cn(
                      'text-sm font-medium leading-tight',
                      {
                        'text-green-600': isCompleted,
                        'text-blue-600': isCurrent,
                        'text-gray-500': isUpcoming
                      }
                    )}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 leading-tight">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-4 transition-colors duration-300',
                    {
                      'bg-green-600': stepNumber < currentStep,
                      'bg-gray-300': stepNumber >= currentStep
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
            Step {currentStep} of {steps.length}
          </div>
          <div className="text-sm text-gray-500">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 mb-1">
            {steps[currentStep - 1]?.title}
          </div>
          <div className="text-sm text-gray-600">
            {steps[currentStep - 1]?.description}
          </div>
        </div>
      </div>
    </div>
  )
}

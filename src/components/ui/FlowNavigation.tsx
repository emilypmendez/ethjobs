'use client'

import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FlowNavigationProps {
  onBack?: () => void
  onNext?: () => void
  onCancel?: () => void
  backLabel?: string
  nextLabel?: string
  cancelLabel?: string
  isNextDisabled?: boolean
  isNextLoading?: boolean
  showCancel?: boolean
  className?: string
  variant?: 'default' | 'compact'
}

export default function FlowNavigation({
  onBack,
  onNext,
  onCancel,
  backLabel = 'Back',
  nextLabel = 'Next',
  cancelLabel = 'Cancel',
  isNextDisabled = false,
  isNextLoading = false,
  showCancel = false,
  className,
  variant = 'default'
}: FlowNavigationProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-between', className)}>
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {backLabel}
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center space-x-3">
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          
          {onNext && (
            <button
              onClick={onNext}
              disabled={isNextDisabled || isNextLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isNextLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {nextLabel}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-between pt-6 border-t border-gray-200', className)}>
      {/* Left side - Back/Cancel */}
      <div className="flex items-center space-x-4">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </button>
        )}
        
        {showCancel && onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {cancelLabel}
          </button>
        )}
      </div>

      {/* Right side - Next/Submit */}
      <div>
        {onNext && (
          <button
            onClick={onNext}
            disabled={isNextDisabled || isNextLoading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isNextLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {nextLabel}
                {nextLabel !== 'Submit' && nextLabel !== 'Complete' && (
                  <ArrowRight className="h-4 w-4 ml-2" />
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Specialized navigation components for common patterns
interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onBack?: () => void
  onNext?: () => void
  onCancel?: () => void
  isNextDisabled?: boolean
  isNextLoading?: boolean
  className?: string
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onCancel,
  isNextDisabled = false,
  isNextLoading = false,
  className
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  return (
    <FlowNavigation
      onBack={!isFirstStep ? onBack : undefined}
      onNext={onNext}
      onCancel={onCancel}
      backLabel={isFirstStep ? 'Back to Home' : 'Previous'}
      nextLabel={isLastStep ? 'Complete' : 'Next'}
      isNextDisabled={isNextDisabled}
      isNextLoading={isNextLoading}
      showCancel={isFirstStep}
      className={className}
    />
  )
}

// Breadcrumb navigation for complex flows
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[]
  className?: string
}

export function BreadcrumbNavigation({ items, className }: BreadcrumbNavigationProps) {
  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className={cn(
                'text-sm',
                item.current ? 'text-gray-900 font-medium' : 'text-gray-500'
              )}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Quick action navigation for common flows
interface QuickActionProps {
  title: string
  description?: string
  actions: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'danger'
    disabled?: boolean
    loading?: boolean
  }[]
  className?: string
}

export function QuickActionNavigation({ title, description, actions, className }: QuickActionProps) {
  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className={cn(
              'inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors',
              {
                'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400': 
                  action.variant === 'primary' || !action.variant,
                'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50': 
                  action.variant === 'secondary',
                'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400': 
                  action.variant === 'danger'
              },
              'disabled:cursor-not-allowed'
            )}
          >
            {action.loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              action.label
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

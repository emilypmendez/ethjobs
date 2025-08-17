import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EditableProfileField from '../EditableProfileField'

describe('EditableProfileField', () => {
  const mockProps = {
    label: 'Test Field',
    value: 'Test Value',
    isEditing: false,
    onEdit: jest.fn(),
    onSave: jest.fn(),
    onCancel: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders field in view mode', () => {
    render(<EditableProfileField {...mockProps} />)
    
    expect(screen.getByText('Test Field')).toBeInTheDocument()
    expect(screen.getByText('Test Value')).toBeInTheDocument()
    expect(screen.getByTitle('Edit Test Field')).toBeInTheDocument()
  })

  it('switches to edit mode when edit button is clicked', () => {
    render(<EditableProfileField {...mockProps} />)
    
    fireEvent.click(screen.getByTitle('Edit Test Field'))
    expect(mockProps.onEdit).toHaveBeenCalled()
  })

  it('renders field in edit mode', () => {
    render(<EditableProfileField {...mockProps} isEditing={true} />)
    
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onSave when save button is clicked', () => {
    render(<EditableProfileField {...mockProps} isEditing={true} />)
    
    fireEvent.click(screen.getByText('Save'))
    expect(mockProps.onSave).toHaveBeenCalledWith('Test Value')
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(<EditableProfileField {...mockProps} isEditing={true} />)
    
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockProps.onCancel).toHaveBeenCalled()
  })

  it('shows validation error for required field', () => {
    render(
      <EditableProfileField 
        {...mockProps} 
        isEditing={true} 
        value="" 
        required={true}
      />
    )
    
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Test Field is required')).toBeInTheDocument()
    expect(mockProps.onSave).not.toHaveBeenCalled()
  })

  it('renders textarea for textarea type', () => {
    render(
      <EditableProfileField 
        {...mockProps} 
        isEditing={true} 
        type="textarea"
      />
    )
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('renders select for select type', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' }
    ]
    
    render(
      <EditableProfileField 
        {...mockProps} 
        isEditing={true} 
        type="select"
        options={options}
      />
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <EditableProfileField 
        {...mockProps} 
        isEditing={true} 
        isLoading={true}
      />
    )
    
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeDisabled()
    expect(screen.getByText('Cancel')).toBeDisabled()
  })

  it('shows error message and retry button', () => {
    const mockRetry = jest.fn()
    
    render(
      <EditableProfileField 
        {...mockProps} 
        isEditing={true} 
        error="Something went wrong"
        onRetry={mockRetry}
      />
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Try again'))
    expect(mockRetry).toHaveBeenCalled()
  })
})

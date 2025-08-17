import { render, screen, fireEvent } from '@testing-library/react'
import SearchAndFilters from '../SearchAndFilters'

describe('SearchAndFilters', () => {
  it('should call onFilterChange when chain filter is changed', () => {
    const mockOnFilterChange = jest.fn()
    const mockOnSearch = jest.fn()

    render(
      <SearchAndFilters 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Open filters
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)

    // Find and change the chain select
    const chainSelect = screen.getByLabelText('Blockchain Networks')
    fireEvent.change(chainSelect, { target: { value: 'Ethereum' } })

    // Verify onFilterChange was called with correct data
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      chains: ['Ethereum'],
      stacks: []
    })
  })

  it('should call onFilterChange when stack filter is changed', () => {
    const mockOnFilterChange = jest.fn()
    const mockOnSearch = jest.fn()

    render(
      <SearchAndFilters 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Open filters
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)

    // Find and change the stack select
    const stackSelect = screen.getByLabelText('Tech Stack')
    fireEvent.change(stackSelect, { target: { value: 'Solidity' } })

    // Verify onFilterChange was called with correct data
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      chains: [],
      stacks: ['Solidity']
    })
  })

  it('should call onFilterChange with empty arrays when "All" options are selected', () => {
    const mockOnFilterChange = jest.fn()
    const mockOnSearch = jest.fn()

    render(
      <SearchAndFilters 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Open filters
    const filtersButton = screen.getByText('Filters')
    fireEvent.click(filtersButton)

    // Change to a specific chain first
    const chainSelect = screen.getByLabelText('Blockchain Networks')
    fireEvent.change(chainSelect, { target: { value: 'Ethereum' } })

    // Then change back to "All Chains"
    fireEvent.change(chainSelect, { target: { value: 'All Chains' } })

    // Verify onFilterChange was called with empty chains array
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      chains: [],
      stacks: []
    })
  })

  it('should call onSearch when search form is submitted', () => {
    const mockOnFilterChange = jest.fn()
    const mockOnSearch = jest.fn()

    render(
      <SearchAndFilters 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )

    // Find search input and enter text
    const searchInput = screen.getByPlaceholderText('Search Web3 jobs...')
    fireEvent.change(searchInput, { target: { value: 'developer' } })

    // Submit the form
    const searchButton = screen.getByText('Search Jobs')
    fireEvent.click(searchButton)

    // Verify onSearch was called with the search query
    expect(mockOnSearch).toHaveBeenCalledWith('developer')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../../components/ui/Input'

describe('Input Component', () => {
  it('renders with basic props', () => {
    render(<Input id="test" label="Test Label" />)
    expect(screen.getByLabelText(/test label/i)).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input id="email" label="Email Address" />)
    expect(screen.getByText(/email address/i)).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    const { container } = render(<Input id="test" />)
    expect(container.querySelector('span')).not.toBeInTheDocument()
  })

  it('displays error message when error prop is provided', () => {
    render(<Input id="email" error="Invalid email" />)
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    expect(screen.getByText(/invalid email/i)).toHaveClass('text-red-600')
  })

  it('does not display error when error prop is not provided', () => {
    const { container } = render(<Input id="test" />)
    expect(container.querySelector('.text-red-600')).not.toBeInTheDocument()
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input id="name" label="Name" />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'John Doe')
    expect(input).toHaveValue('John Doe')
  })

  it('forwards additional props to input element', () => {
    render(
      <Input 
        id="email" 
        type="email" 
        placeholder="Enter email"
        required 
        autoComplete="email"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('placeholder', 'Enter email')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })

  it('applies custom className', () => {
    render(<Input id="test" className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('has correct id association with label', () => {
    render(<Input id="unique-id" label="Label Text" />)
    expect(screen.getByLabelText(/label text/i)).toHaveAttribute('id', 'unique-id')
  })
})

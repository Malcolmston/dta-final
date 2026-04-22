import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TickerInput from '../../app/components/TickerInput';

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
  };
});

describe('TickerInput', () => {
  const mockOnChange = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default tickers', () => {
    render(
      <TickerInput
        value="AAPL"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        defaultTickers={['AAPL', 'GOOGL']}
      />
    );

    expect(screen.getByText('AAPL')).toBeDefined();
    expect(screen.getByText('GOOGL')).toBeDefined();
  });

  it('calls onChange when input changes', () => {
    render(
      <TickerInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByPlaceholderText('Enter ticker symbol');
    fireEvent.change(input, { target: { value: 'MSFT' } });

    expect(mockOnChange).toHaveBeenCalledWith('MSFT');
  });

  it('adds ticker on Enter key', async () => {
    render(
      <TickerInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByPlaceholderText('Enter ticker symbol');
    fireEvent.change(input, { target: { value: 'MSFT' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it('validates ticker format before adding', async () => {
    render(
      <TickerInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByPlaceholderText('Enter ticker symbol');

    // Invalid: too long
    fireEvent.change(input, { target: { value: 'TOOLONG' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Should not submit invalid ticker
    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('shows suggestions for popular tickers', async () => {
    render(
      <TickerInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );

    const input = screen.getByPlaceholderText('Enter ticker symbol');
    fireEvent.change(input, { target: { value: 'AA' } });

    await waitFor(() => {
      // Should show suggestions for tickers starting with 'AA'
      expect(screen.getByText('AAPL')).toBeDefined();
    });
  });

  it('removes ticker when remove button clicked', async () => {
    render(
      <TickerInput
        value="AAPL,GOOGL"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        defaultTickers={['AAPL', 'GOOGL']}
      />
    );

    // Find and click the remove button for AAPL
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
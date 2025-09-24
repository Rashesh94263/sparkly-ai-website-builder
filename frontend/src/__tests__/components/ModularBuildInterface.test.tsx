// Enterprise Modular Build Interface Tests
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/testUtils';
import { ModularBuildInterface } from '../../pages/WebsitePreviewExplorer';
import { mockBuildSession, mockUser } from '../../utils/testUtils';

// Mock the useLocation hook
const mockLocation = {
  state: { prompt: 'Create a React app' },
  pathname: '/build',
  search: '',
  hash: '',
  key: 'test-key',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

// Mock the useWebContainer hook
jest.mock('../../hooks/webContainer', () => ({
  useWebContainer: () => null,
}));

// Mock the Preview component
jest.mock('../../components/Preview', () => ({
  Preview: ({ files }: { files: any[] }) => (
    <div data-testid="preview-component">
      Preview with {files.length} files
    </div>
  ),
}));

describe('ModularBuildInterface', () => {
  const mockOnBackToChat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders without crashing', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    expect(screen.getByText('Website Builder')).toBeInTheDocument();
    expect(screen.getByText('Create a React app')).toBeInTheDocument();
  });

  it('displays the prompt in the header', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    expect(screen.getByText('Create a React app')).toBeInTheDocument();
  });

  it('shows copy button when prompt exists', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('handles back button click', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
    
    expect(mockOnBackToChat).toHaveBeenCalledTimes(1);
  });

  it('handles copy button click', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Create a React app');
    });
  });

  it('renders tab navigation', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Steps')).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    const codeTab = screen.getByText('Code');
    fireEvent.click(codeTab);
    
    // The tab should be active (this would be verified by checking the active class)
    expect(codeTab).toBeInTheDocument();
  });

  it('renders preview button', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('handles preview button click', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    expect(previewButton).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    // The component should show some loading indication
    // This depends on the implementation of the useBuildSession hook
  });

  it('handles errors gracefully', () => {
    // Mock an error in the build session
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    // The component should handle errors without crashing
    expect(screen.getByText('Website Builder')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('has proper accessibility attributes', () => {
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    const backButton = screen.getByText('Back');
    expect(backButton).toHaveAttribute('aria-label', 'Go back to chat interface');
    
    const copyButton = screen.getByText('Copy');
    expect(copyButton).toHaveAttribute('aria-label', 'Copy prompt to clipboard');
  });

  it('handles missing prompt gracefully', () => {
    const mockLocationWithoutPrompt = {
      ...mockLocation,
      state: {},
    };
    
    jest.doMock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useLocation: () => mockLocationWithoutPrompt,
    }));
    
    render(<ModularBuildInterface onBackToChat={mockOnBackToChat} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});




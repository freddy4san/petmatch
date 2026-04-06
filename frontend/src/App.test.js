import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the welcome screen', () => {
  render(<App />);
  expect(screen.getByText(/welcome to petmatch/i)).toBeInTheDocument();
});

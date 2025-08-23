import { render, screen } from '@testing-library/react';
import Home from '../src/components/pages/home/Home'
describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />);
    const heading = screen.getByText(/coming soon/i);
    expect(heading).toBeInTheDocument();
  });
});

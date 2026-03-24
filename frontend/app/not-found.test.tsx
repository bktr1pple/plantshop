import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('global not-found page', () => {
  it('рендерить зрозумілий 404 екран із корисними переходами', () => {
    render(<NotFound />);

    expect(
      screen.getByRole('heading', { name: 'Сторінку не знайдено' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Помилка 404')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'На головну' }),
    ).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('link', { name: 'До каталогу' }),
    ).toHaveAttribute('href', '/plants');
  });
});

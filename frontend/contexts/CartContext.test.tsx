import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

function CartHarness() {
  const { cartItems, addToCart, updateQuantity, totalItems, totalPrice } =
    useCart();

  return (
    <div>
      <pre data-testid="items">{JSON.stringify(cartItems)}</pre>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice}</div>
      <button
        onClick={() =>
          addToCart({
            id: '1',
            name: 'Monstera',
            price: 25,
            image: '/monstera.jpg',
          })
        }
      >
        add-valid
      </button>
      <button
        onClick={() =>
          addToCart({
            id: 'bad-id',
            name: 'Broken',
            price: 10,
            image: '/broken.jpg',
          })
        }
      >
        add-invalid
      </button>
      <button onClick={() => updateQuantity('1', 2000)}>set-high</button>
    </div>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('завантажує лише валідні позиції з localStorage і обмежує quantity', async () => {
    localStorage.setItem(
      'plantShop_cart',
      JSON.stringify([
        {
          id: '1',
          name: 'Monstera',
          price: 25,
          image: '/monstera.jpg',
          quantity: 2000,
        },
        {
          id: 'legacy-id',
          name: 'Broken',
          price: 10,
          image: '/broken.jpg',
          quantity: 1,
        },
      ]),
    );

    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('items')).toHaveTextContent(
        '"quantity":1000',
      );
      expect(screen.getByTestId('items')).not.toHaveTextContent('legacy-id');
      expect(screen.getByTestId('total-items')).toHaveTextContent('1000');
    });
  });

  it('не додає невалідні позиції і не дозволяє quantity більше 1000', () => {
    render(
      <CartProvider>
        <CartHarness />
      </CartProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'add-invalid' }));
    expect(screen.getByTestId('items')).toHaveTextContent('[]');

    fireEvent.click(screen.getByRole('button', { name: 'add-valid' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-high' }));

    expect(screen.getByTestId('items')).toHaveTextContent(
      '"quantity":1000',
    );
    expect(screen.getByTestId('total-price')).toHaveTextContent('25000');
  });
});

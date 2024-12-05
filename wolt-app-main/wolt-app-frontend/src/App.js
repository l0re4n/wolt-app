import './App.css';
import React, { useState, useEffect } from 'react';

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [viewingCart, setViewingCart] = useState(false); // Состояние для отображения корзины
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false); // Состояние для показа формы оплаты
  const [paymentData, setPaymentData] = useState({ cardNumber: '', cardHolder: '', expirationDate: '', cvv: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then((response) => response.json())
      .then((data) => setRestaurants(data))
      .catch((error) => console.error('Error:', error));
  }, []);

  const selectRestaurant = (id) => {
    fetch(`http://localhost:5000/api/restaurants/${id}/dishes`)
      .then((response) => response.json())
      .then((data) => {
        setSelectedRestaurant(id);
        setDishes(data);
      })
      .catch((error) => console.error('Error:', error));
  };

  const addToCart = (dish) => {
    setCart((prev) => [...prev, dish]);
  };

  const handlePaymentInput = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    setIsPaymentFormVisible(true); // Показываем форму оплаты
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Здесь мы имитируем успешную оплату
    alert('Payment successful! Your order has been placed.');
    setCart([]);
    setSelectedRestaurant(null);
    setDishes([]);
    setIsPaymentFormVisible(false);
    setViewingCart(false);
  };

  const clearCart = () => {
    setCart([]); // Очистка корзины
  };

  return (
    <div className="AppWrap">
      {!viewingCart && !isPaymentFormVisible && ( // Показываем рестораны только если не открыта корзина и не отображается форма оплаты
        <>
          <h1>Restaurants</h1>
          <ul>
            {restaurants.map((restaurant) => (
              <li key={restaurant.id}>
                <span>{restaurant.name}</span>
                <button className="select-restaurant" onClick={() => selectRestaurant(restaurant.id)}>
                  Select
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedRestaurant && !viewingCart && (
        <>
          <h2>{restaurants.find(r => r.id === selectedRestaurant)?.name} Dishes</h2> {/* Показываем название ресторана */}
          <ul>
            {dishes.map((dish) => (
              <li key={dish.id}>
                <span>{dish.name} - ${dish.price}</span>
                <button className="add-to-cart" onClick={() => addToCart(dish)}>
                  Add to Cart
                </button>
              </li>
            ))}
          </ul>
          <button className="back-to-dishes-button" onClick={() => setViewingCart(true)}>
            Go to Cart
          </button>
        </>
      )}

      {viewingCart && !isPaymentFormVisible && (
        <>
          <h2>Cart</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                {item.name} - ${item.price}
              </li>
            ))}
          </ul>
          <ul className='buttons-wrap'>
            <button className="clear-cart-button" onClick={clearCart}>Clear Cart</button>
            <button className="place-order-button" onClick={handlePlaceOrder}>Place Order</button>
            <button className="back-to-dishes-button" onClick={() => setViewingCart(false)}>Back to Dishes</button>
          </ul>
        </>
      )}

      {isPaymentFormVisible && (
        <>
          <h2>Payment</h2>
          <form onSubmit={handlePaymentSubmit} className='payment-form'>
            <div>
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handlePaymentInput}
                placeholder="1234 5678 9876 5432"
                required
              />
            </div>
            <div>
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardHolder"
                value={paymentData.cardHolder}
                onChange={handlePaymentInput}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label>Expiration Date</label>
              <input
                type="text"
                name="expirationDate"
                value={paymentData.expirationDate}
                onChange={handlePaymentInput}
                placeholder="MM/YY"
                required
              />
            </div>
            <div>
              <label>CVV</label>
              <input
                type="text"
                name="cvv"
                value={paymentData.cvv}
                onChange={handlePaymentInput}
                placeholder="123"
                required
              />
            </div>
            <button type="submit" className="submit-payment-button">Confirm Payment</button>
            <button
              type="button"
              className="back-to-cart-button"
              onClick={() => setIsPaymentFormVisible(false)}
            >
              Cancel
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;

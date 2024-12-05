from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Настройки базы данных PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:q9w0e8r8t7y8@localhost:5432/wolt-app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Модели базы данных
class Restaurant(db.Model):
    __tablename__ = 'restaurants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    contact_number = db.Column(db.String(50))
    rating = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    dishes = db.relationship('Dish', backref='restaurant', lazy=True)


class Dish(db.Model):
    __tablename__ = 'dishes'
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurants.id'), nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship('OrderItem', backref='order', lazy=True)


class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    dish_id = db.Column(db.Integer, db.ForeignKey('dishes.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

# Создание всех таблиц
with app.app_context():
    db.create_all()

# Эндпоинты
@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    restaurants = Restaurant.query.all()
    result = [
        {
            'id': r.id,
            'name': r.name,
            'address': r.address,
            'contact_number': r.contact_number,
            'rating': r.rating,
        } for r in restaurants
    ]
    return jsonify(result)

@app.route('/api/restaurants/<int:restaurant_id>/dishes', methods=['GET'])
def get_dishes(restaurant_id):
    dishes = Dish.query.filter_by(restaurant_id=restaurant_id).all()
    result = [
        {
            'id': d.id,
            'name': d.name,
            'description': d.description,
            'price': d.price,
            'is_available': d.is_available
        } for d in dishes
    ]
    return jsonify(result)

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    try:
        new_order = Order(
            restaurant_id=data['restaurant_id'],
            total_price=sum(item['price'] * item['quantity'] for item in data['items']),
            status='Pending'
        )
        db.session.add(new_order)
        db.session.flush()

        for item in data['items']:
            order_item = OrderItem(
                order_id=new_order.id,
                dish_id=item['dish_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            db.session.add(order_item)

        db.session.commit()
        return jsonify({"message": "Order created successfully", "order_id": new_order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)

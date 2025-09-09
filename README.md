# MERN E-Commerce Backend API with SSLCommerz Integration

## Project Overview

This is the backend server for a full-featured e-commerce platform built using Node.js, Express.js, and MongoDB. The server provides RESTful APIs for user authentication, product management, shopping cart functionality, order processing, and secure payment handling through SSLCommerz.

## Features

### Core Functionality
- User authentication (Registration, Login, Password Reset)
- Product management (CRUD operations)
- Shopping cart system
- Order processing and management
- Address management
- Admin dashboard APIs
- Search and filtering capabilities

### Payment Processing
- SSLCommerz payment gateway integration
- Instant Payment Notification (IPN) handling
- Payment status management
- Order status synchronization

### Security Features
- JWT-based authentication
- Password encryption with bcrypt
- CORS protection
- Input validation and sanitization
- Rate limiting
- Secure HTTP headers

## Technology Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling (ODM) library
- **JSON Web Tokens (JWT)** - Token-based authentication
- **Bcrypt.js** - Password hashing
- **SSLCommerz LTS** - Payment gateway integration
- **Dotenv** - Environment variable management
- **Cors** - Cross-origin resource sharing
- **Cookie-parser** - Cookie parsing middleware

## API Endpoints

### Authentication Routes
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/verify - Token verification
```

### Shop Routes
```
GET /api/shop/products - Get all products
GET /api/shop/products/:id - Get product by ID
GET /api/shop/search - Search products
GET /api/shop/categories - Get product categories
```

### User Routes
```
GET /api/user/cart - Get user cart
POST /api/user/cart - Add item to cart
PUT /api/user/cart/:id - Update cart item
DELETE /api/user/cart/:id - Remove item from cart
GET /api/user/address - Get user addresses
POST /api/user/address - Add new address
PUT /api/user/address/:id - Update address
DELETE /api/user/address/:id - Delete address
```

### Order Routes
```
POST /api/shop/order/create - Create new order
POST /api/shop/order/success/:id - Handle successful payment
POST /api/shop/order/fail/:id - Handle failed payment
POST /api/shop/order/cancel/:id - Handle cancelled payment
GET /api/shop/order/list/:userId - Get user orders
GET /api/shop/order/details/:id - Get order details
```

### Admin Routes
```
GET /api/admin/products - Get all products
POST /api/admin/products - Create new product
PUT /api/admin/products/:id - Update product
DELETE /api/admin/products/:id - Delete product
GET /api/admin/orders - Get all orders
PUT /api/admin/orders/:id - Update order status
GET /api/admin/categories - Get all categories
POST /api/admin/categories - Create new category
```

## SSLCommerz Integration

### Implementation Details

The server integrates with SSLCommerz using the official `sslcommerz-lts` Node.js package. The integration includes:

1. **Payment Initialization**: When a user places an order, the server creates a payment request with order details
2. **Gateway Redirect**: User is redirected to SSLCommerz payment gateway for payment processing
3. **IPN Handling**: SSLCommerz sends Instant Payment Notifications to server endpoints:
   - Success endpoint: Updates order status to "paid" and confirms order
   - Failure endpoint: Updates order status to "failed"
   - Cancel endpoint: Updates order status to "cancelled"
4. **Stock Management**: Product inventory is automatically updated upon successful payments

### Configuration

To configure SSLCommerz, set the following environment variables:

```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false  # Set to true for production
```

### Sandbox vs Production

- **Sandbox Mode**: Used for testing with dummy transactions
- **Live Mode**: Used for real transactions with actual payments

## Database Schema

### User Model
```javascript
{
  userName: String,
  email: String,
  password: String,
  role: String  // 'admin' or 'customer'
}
```

### Product Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  salePrice: Number,
  totalStock: Number,
  category: String,
  image: String,
  ratings: [{
    userId: String,
    rating: Number,
    review: String
  }]
}
```

### Order Model
```javascript
{
  userId: String,
  cartId: String,
  cartItems: [{
    productId: String,
    title: String,
    image: String,
    price: String,
    quantity: Number
  }],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentURL: String
}
```

### Cart Model
```javascript
{
  userId: String,
  items: [{
    productId: String,
    title: String,
    image: String,
    price: Number,
    quantity: Number
  }]
}
```

## Environment Variables

Create a `.env` file in the server root directory with the following variables:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
SSLCOMMERZ_STORE_ID=your_sslcommerz_store_id
SSLCOMMERZ_STORE_PASSWORD=your_sslcommerz_store_password
SSLCOMMERZ_IS_LIVE=false
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Navigate to the server directory:
```bash
cd server
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables in `.env` file

5. Start the development server:
```bash
npm run dev
```

6. For production deployment:
```bash
npm start
```

## Project Structure

```
server/
├── controllers/             # Request handlers
│   ├── admin/              # Admin controllers
│   └── shop/               # Shop controllers
├── models/                 # Database models
├── routes/                 # API routes
│   ├── admin/              # Admin routes
│   └── shop/               # Shop routes
├── helpers/                # Utility functions
├── middleware/             # Custom middleware
├── config/                 # Configuration files
├── .env                    # Environment variables
├── server.js              # Entry point
└── package.json           # Project dependencies
```

## Payment Flow Implementation

1. **Order Creation**: When a user confirms their order, the server creates a new order document with "pending" status

2. **SSLCommerz Initialization**: The server initializes a payment request with SSLCommerz using order details:
   ```javascript
   const data = {
     total_amount: order.totalAmount,
     currency: "BDT",
     tran_id: unique_transaction_id,
     success_url: `${BACKEND_URL}/api/shop/order/success/${order._id}`,
     fail_url: `${BACKEND_URL}/api/shop/order/fail/${order._id}`,
     cancel_url: `${BACKEND_URL}/api/shop/order/cancel/${order._id}`,
     // Customer and shipping information
   };
   ```

3. **Redirect to Gateway**: The server responds with the SSLCommerz payment gateway URL where the user completes payment

4. **Payment Processing**: SSLCommerz processes the payment and sends IPN to the appropriate endpoint

5. **Status Update**: Based on the IPN, the server updates the order status and inventory:
   - Success: Set order status to "paid", update inventory
   - Failure: Set order status to "failed"
   - Cancel: Set order status to "cancelled"

## Security Best Practices

1. **Input Validation**: All incoming data is validated and sanitized
2. **Authentication**: JWT tokens are used for secure user authentication
3. **Password Security**: Passwords are hashed using bcrypt before storage
4. **CORS Protection**: Cross-origin requests are restricted to authorized domains
5. **Rate Limiting**: API requests are rate-limited to prevent abuse
6. **Environment Variables**: Sensitive data is stored in environment variables

## Error Handling

The server implements comprehensive error handling with:
- Custom error messages for different scenarios
- Proper HTTP status codes
- Detailed logging for debugging
- Graceful degradation for non-critical failures

## Testing

The server includes:
- Unit tests for critical functions
- Integration tests for API endpoints
- Load testing configurations
- Test data fixtures

## Deployment

### Requirements
- Node.js v14 or higher
- MongoDB database
- SSLCommerz merchant account

### Hosting Options
- Heroku
- AWS EC2
- DigitalOcean
- Render
- Any Node.js compatible hosting platform

### Deployment Steps
1. Set up MongoDB database (MongoDB Atlas recommended)
2. Configure environment variables
3. Deploy code to hosting platform
4. Set up SSL certificate (recommended)
5. Configure domain and DNS settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For any issues or questions regarding the server implementation, please contact the development team.
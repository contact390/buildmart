# 🏗️ Product Upload Backend API Documentation

## Overview
The Product Uploads API handles adding, retrieving, updating, and deleting building materials with image uploads and category-specific fields.

## Base URL
```
http://localhost:5000/api
```

## Database Table
**Table Name:** `products_extended`

### Fields:
- `id` (INT) - Auto-increment primary key
- `productName` (VARCHAR) - Required
- `brand` (VARCHAR) - Optional
- `category` (VARCHAR) - Required (cement, bricks, building-materials, iron-steel, plumbing, home-interior)
- `description` (LONGTEXT) - Optional
- `price` (DECIMAL) - Required
- `discount` (INT) - Optional, default 0
- `finalPrice` (DECIMAL) - Auto-calculated
- `quantity` (INT) - Default 1
- `quantityUnit` (VARCHAR) - Unit of measurement
- `rating` (DECIMAL) - 0-5 scale
- `moq` (INT) - Minimum Order Quantity
- `warranty` (INT) - Warranty period in months
- `color` (VARCHAR) - Optional
- `imageUrl` (VARCHAR) - Full URL to image
- `imagePath` (VARCHAR) - Filename stored locally

### Category-Specific Fields:

#### Cement:
- `cementType` - OPC, PPC, Slag, White, Rapid Hardening
- `cementGrade` - 33, 43, 53
- `settingTime` - Initial setting time in minutes
- `compressiveStrength` - In MPa

#### Bricks:
- `brickType` - Clay, Fly Ash, Concrete, Hollow, Perforated
- `brickSize` - Size in inches
- `weight` - Weight per piece

#### Building Materials:
- `materialType` - Sand, Aggregate, Plywood, etc.
- `thickness` - In mm
- `density` - In kg/m³
- `application` - Usage context

#### Iron & Steel:
- `steelType` - TMT Bar, Mild Steel, etc.
- `diameter` - Size in mm
- `steelGrade` - Fe415, Fe500, etc.
- `yieldStrength` - In MPa

#### Plumbing:
- `plumbingType` - Pipe, Fitting, Sanitary, Faucet, Valve
- `material` - PVC, CPVC, GI, Copper, Ceramic
- `pressureRating` - In psi

#### Home Interior:
- `interiorType` - Flooring, Wall, Ceiling, Door, Window, Furniture
- `finishType` - Polished, Matt, Glossy, Textured
- `coverage` - Coverage area per unit
- `installation` - Yes, No, Extra Charge

---

## API Endpoints

### 1. POST - Upload Product with Image
**Endpoint:** `POST /api/product_uploads`

**Description:** Upload a new product with image file and category-specific details

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data (multipart):**
```
- image: File (JPG, PNG, GIF, WebP, max 5MB)
- productName: string (required)
- brand: string
- category: string (required)
- description: string
- price: number (required)
- discount: number (0-100)
- quantity: number
- quantityUnit: string
- rating: number (0-5)
- moq: number
- warranty: number
- color: string
- finalPrice: number (auto-calculated if not provided)
- [category-specific fields as per above]
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:5000/api/product_uploads \
  -F "image=@/path/to/image.jpg" \
  -F "productName=Cement Grade 53" \
  -F "category=cement" \
  -F "price=380" \
  -F "discount=5" \
  -F "quantityUnit=bag" \
  -F "cementType=opc" \
  -F "cementGrade=53"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product uploaded successfully",
  "productId": 1,
  "product": {
    "id": 1,
    "productName": "Cement Grade 53",
    "category": "cement",
    "price": 361,
    "imageUrl": "http://localhost:5000/uploads/products/1234567890-123456.jpg",
    "createdAt": "2026-01-26T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Product name, category, and price are required"
}
```

---

### 2. GET - Fetch All Products
**Endpoint:** `GET /api/product_uploads`

**Query Parameters:**
- `category` (optional) - Filter by category
- `status` (optional) - active, inactive, draft (default: active)
- `limit` (optional) - Number of products (default: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Example Request:**
```
GET http://localhost:5000/api/product_uploads?category=cement&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "total": 10,
  "products": [
    {
      "id": 1,
      "productName": "Cement Grade 53",
      "category": "cement",
      "price": 380,
      "finalPrice": 361,
      "imageUrl": "http://localhost:5000/uploads/products/...",
      "created_at": "2026-01-26T10:30:00.000Z"
    }
  ]
}
```

---

### 3. GET - Fetch Single Product
**Endpoint:** `GET /api/product_uploads/:id`

**Example Request:**
```
GET http://localhost:5000/api/product_uploads/1
```

**Response (200):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "productName": "Cement Grade 53",
    "brand": "Ultra Tech",
    "category": "cement",
    "description": "High strength cement for construction",
    "price": 380,
    "discount": 5,
    "finalPrice": 361,
    "cementType": "opc",
    "cementGrade": "53",
    "settingTime": 30,
    "compressiveStrength": 53,
    "imageUrl": "http://localhost:5000/uploads/products/...",
    "created_at": "2026-01-26T10:30:00.000Z"
  }
}
```

---

### 4. GET - Fetch Products by Category
**Endpoint:** `GET /api/product_uploads/category/:category`

**Example Request:**
```
GET http://localhost:5000/api/product_uploads/category/cement?limit=20
```

**Response (200):**
```json
{
  "success": true,
  "category": "cement",
  "total": 5,
  "products": [...]
}
```

---

### 5. PUT - Update Product
**Endpoint:** `PUT /api/product_uploads/:id`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:** Same as POST (all fields optional except for update)

**Example Request:**
```bash
curl -X PUT http://localhost:5000/api/product_uploads/1 \
  -F "image=@/path/to/new-image.jpg" \
  -F "price=390" \
  -F "discount=10"
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "productId": 1
}
```

---

### 6. DELETE - Delete Product
**Endpoint:** `DELETE /api/product_uploads/:id`

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/api/product_uploads/1
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid product ID"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to save product to database"
}
```

---

## File Upload Details

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Constraints
- **Max File Size:** 5MB
- **Storage Location:** `/uploads/products/`
- **URL Format:** `http://localhost:5000/uploads/products/{filename}`

### Image Handling
- Uploaded images are stored with timestamp-based filenames
- Old images are deleted when product is updated
- Images are deleted when product is deleted

---

## Testing Examples

### 1. Upload Cement Product
```javascript
const formData = new FormData();
formData.append('productName', 'Ultratech Cement 53');
formData.append('category', 'cement');
formData.append('price', '380');
formData.append('discount', '5');
formData.append('brand', 'Ultratech');
formData.append('quantityUnit', 'bag');
formData.append('cementType', 'opc');
formData.append('cementGrade', '53');
formData.append('image', fileInput.files[0]);

fetch('http://localhost:5000/api/product_uploads', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(d => console.log(d));
```

### 2. Fetch All Cement Products
```javascript
fetch('http://localhost:5000/api/product_uploads?category=cement&limit=10')
  .then(r => r.json())
  .then(d => console.log(d));
```

### 3. Update Product Price
```javascript
const formData = new FormData();
formData.append('price', '390');
formData.append('discount', '10');

fetch('http://localhost:5000/api/product_uploads/1', {
  method: 'PUT',
  body: formData
})
.then(r => r.json())
.then(d => console.log(d));
```

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install multer express cors mysql2
```

### 2. Create Database Table
The table is automatically created when the server starts. Ensure MySQL is running with database `buildingmaterials`.

### 3. Create Uploads Directory
```bash
mkdir -p uploads/products
```

### 4. Start Server
```bash
node server.js
```

### 5. Access Frontend Form
```
http://localhost:5000/productslatestuploads.html
```

---

## Notes
- All timestamps are in UTC
- Prices are stored as DECIMAL(12,2) for precision
- Images are stored locally and served via static file middleware
- Category-specific fields are optional and based on category selection
- Status field defaults to 'active' for all new products


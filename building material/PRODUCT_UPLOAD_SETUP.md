# 🏗️ Product Upload Backend - Setup & Installation Guide

## Overview
Complete backend implementation for product uploads with:
- ✅ Multer-based image file uploads
- ✅ MySQL database with category-specific fields
- ✅ RESTful API endpoints (CRUD operations)
- ✅ Form validation and error handling
- ✅ Automatic image file management

---

## 📋 Prerequisites

- Node.js (v14+) installed
- MySQL Server running
- Database: `buildingmaterials` created
- npm packages already installed (see package.json)

---

## 🚀 Quick Start

### Step 1: Create Uploads Directory
```bash
# From project root
mkdir -p uploads/products
```

### Step 2: Verify Dependencies
Check if `multer` is installed:
```bash
npm list multer
```

If not installed:
```bash
npm install multer
```

### Step 3: Start the Server
```bash
node server.js
```

Expected output:
```
✅ MySQL connected.
✅ products_extended table ready
🚀 Server running at http://localhost:5000
```

### Step 4: Test the Frontend
Open in browser:
```
http://localhost:5000/productslatestuploads.html
```

---

## 📁 File Structure

```
project/
├── server.js                      (Updated - includes product_uploads routes)
├── db.js                          (Database connection)
├── package.json                   (Dependencies)
├── productslatestuploads.html     (Updated frontend form)
├── routes/
│   ├── product_uploads.js         (🆕 New route file - ALL backend logic)
│   ├── products.js
│   ├── cart.js
│   ├── contact_us.js
│   └── ...
├── uploads/
│   └── products/                  (🆕 Image storage directory)
├── PRODUCT_UPLOAD_API.md          (🆕 API documentation)
└── test_product_upload.js         (🆕 Test file)
```

---

## 🔧 Backend Implementation Details

### New Route File: `routes/product_uploads.js`

**Features:**
1. **Upload Handler** - Accepts multipart form data with image
2. **Image Storage** - Saves images to `uploads/products/` directory
3. **Database Queries** - CRUD operations on `products_extended` table
4. **Error Handling** - Validates files, cleans up on errors
5. **Automatic Cleanup** - Deletes old images when updating/deleting products

**Multer Configuration:**
- File size limit: 5MB
- Allowed formats: JPEG, PNG, GIF, WebP
- Storage: Local disk with timestamp-based naming

---

## 📊 Database Table Schema

### Table: `products_extended`

```sql
CREATE TABLE products_extended (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productName VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  description LONGTEXT,
  price DECIMAL(12,2) NOT NULL,
  discount INT DEFAULT 0,
  finalPrice DECIMAL(12,2),
  quantity INT DEFAULT 1,
  quantityUnit VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 0,
  moq INT DEFAULT 1,
  warranty INT DEFAULT 0,
  color VARCHAR(100),
  imageUrl VARCHAR(500),
  imagePath VARCHAR(500),
  
  -- Category-specific fields (40+ fields for all categories)
  cementType VARCHAR(50),
  cementGrade VARCHAR(50),
  settingTime INT,
  compressiveStrength DECIMAL(6,2),
  -- ... (see full schema in product_uploads.js)
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
  createdBy VARCHAR(255),
  seller_id INT
);
```

### Supported Categories:
1. **Cement** - OPC, PPC, Slag, White, Rapid
2. **Bricks** - Clay, Fly Ash, Concrete, Hollow, Perforated
3. **Building Materials** - Sand, Aggregate, Plywood, etc.
4. **Iron & Steel** - TMT, Mild, Structural, Stainless
5. **Plumbing** - Pipes, Fittings, Sanitary, Faucets, Valves
6. **Home Interior** - Flooring, Wall, Ceiling, Doors, Windows

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/product_uploads` | Upload new product with image |
| GET | `/product_uploads` | Get all products (with filters) |
| GET | `/product_uploads/:id` | Get single product |
| GET | `/product_uploads/category/:category` | Get products by category |
| PUT | `/product_uploads/:id` | Update product |
| DELETE | `/product_uploads/:id` | Delete product |

---

## 📤 Upload Endpoint Details

### POST `/api/product_uploads`

**Content Type:** `multipart/form-data`

**Required Fields:**
- `productName` (string)
- `category` (string) - One of: cement, bricks, building-materials, iron-steel, plumbing, home-interior
- `price` (number)

**Optional Fields:**
- `image` (file) - JPG, PNG, GIF, WebP (max 5MB)
- `brand` (string)
- `description` (string)
- `discount` (number)
- `quantity` (number)
- `quantityUnit` (string)
- `rating` (number)
- `moq` (number)
- `warranty` (number)
- `color` (string)
- `[category-specific fields]`

**Response Success (200):**
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

**Response Error (400):**
```json
{
  "success": false,
  "error": "Product name, category, and price are required"
}
```

---

## 🧪 Testing

### Using HTML Form (Easiest)
1. Start server: `node server.js`
2. Open: `http://localhost:5000/productslatestuploads.html`
3. Fill form, upload image, submit
4. Check response message

### Using cURL
```bash
curl -X POST http://localhost:5000/api/product_uploads \
  -F "productName=Cement Grade 53" \
  -F "category=cement" \
  -F "price=380" \
  -F "discount=5" \
  -F "quantityUnit=bag" \
  -F "cementType=opc" \
  -F "image=@/path/to/image.jpg"
```

### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('productName', 'Cement Grade 53');
formData.append('category', 'cement');
formData.append('price', '380');
formData.append('image', fileInput.files[0]);

fetch('http://localhost:5000/api/product_uploads', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(d => console.log(d));
```

### Test Script
```bash
node test_product_upload.js
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'multer'"
**Solution:**
```bash
npm install multer --save
```

### Issue: "ENOENT: no such file or directory, open 'uploads/products'"
**Solution:**
```bash
mkdir -p uploads/products
```

### Issue: "Access denied" for MySQL
**Solution:**
- Check MySQL credentials in `db.js`
- Default: user=`root`, password=`2001`, database=`buildingmaterials`
- Update as needed: `db.js` line 5

### Issue: File upload fails with 413 status
**Solution:**
- Express payload limit set to 50MB in `server.js`
- Multer file limit is 5MB per file
- Check file size and format

### Issue: Image not displaying
**Solution:**
- Check if `uploads/products/` directory is created
- Check file permissions: `chmod 755 uploads/products/`
- Verify image was actually saved

### Issue: Database fields missing
**Solution:**
- Table is auto-created when server starts
- Check MySQL logs: `mysql> SHOW TABLES;`
- If missing, restart server: `node server.js`

---

## 🔐 Security Considerations

1. **File Validation**
   - Only allows specific image formats (JPEG, PNG, GIF, WebP)
   - Maximum file size: 5MB
   - Filename sanitized with timestamps

2. **Input Validation**
   - Required fields checked
   - Data type validation
   - Database injection prevention via parameterized queries

3. **File Cleanup**
   - Old images deleted on update
   - Images deleted on product deletion
   - Automatic cleanup on upload errors

### Additional Security (Optional):
```javascript
// Add authentication middleware
app.use('/api/product_uploads', authenticateUser);

// Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

---

## 📈 Performance Tips

1. **Image Optimization**
   - Compress images before upload
   - Use WebP format for smaller file sizes
   - Maximum dimensions recommended: 2000x2000px

2. **Database**
   - Add indexes on frequently queried fields:
     ```sql
     CREATE INDEX idx_category ON products_extended(category);
     CREATE INDEX idx_status ON products_extended(status);
     ```

3. **Caching**
   - Implement Redis for product list caching
   - Cache category-wise products

---

## 📝 API Documentation

See [PRODUCT_UPLOAD_API.md](./PRODUCT_UPLOAD_API.md) for:
- Complete endpoint reference
- Request/response examples
- Field descriptions
- Error codes
- Testing examples

---

## 🎯 Next Steps

1. ✅ Run backend: `node server.js`
2. ✅ Test upload: Open HTML form
3. ✅ Verify database: Check MySQL table
4. ✅ Check files: Look in `uploads/products/`
5. ✅ Retrieve products: Use GET endpoint
6. ✅ Build admin panel: Display uploaded products
7. ✅ Add edit functionality: Update products
8. ✅ Implement deletion: Remove old products

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `PRODUCT_UPLOAD_API.md`
3. Check server console logs
4. Verify database connection: `mysql -u root -p buildingmaterials`
5. Check file permissions: `ls -la uploads/products/`

---

## 📦 Dependencies Used

```json
{
  "express": "^5.1.0",
  "multer": "^2.0.2",
  "mysql2": "^3.14.3",
  "cors": "^2.8.5",
  "express-session": "^1.18.2"
}
```

---

**Last Updated:** January 26, 2026  
**Status:** ✅ Production Ready


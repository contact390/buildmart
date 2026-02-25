# 🎯 QUICK REFERENCE - Product Upload Backend

## ⚡ Quick Start (30 seconds)

```bash
# 1. Directory already created ✅
# 2. Start server
node server.js

# 3. Open in browser
http://localhost:5000/productslatestuploads.html

# 4. Fill form, upload image, click Submit
```

---

## 📍 Key Files & Locations

| File | Location | Purpose |
|------|----------|---------|
| Backend Routes | `routes/product_uploads.js` | All API logic |
| Frontend Form | `productslatestuploads.html` | Upload interface |
| Database Config | `db.js` | MySQL connection |
| Server Config | `server.js` | Route registration |
| Image Storage | `uploads/products/` | Uploaded images |
| API Docs | `PRODUCT_UPLOAD_API.md` | Full API reference |
| Setup Guide | `PRODUCT_UPLOAD_SETUP.md` | Detailed setup |

---

## 🌐 API Endpoints

```
POST   /api/product_uploads           → Upload product
GET    /api/product_uploads           → Get all products
GET    /api/product_uploads/:id       → Get one product
GET    /api/product_uploads/category/:cat → Get by category
PUT    /api/product_uploads/:id       → Update product
DELETE /api/product_uploads/:id       → Delete product
```

---

## 📊 Database

**Table:** `products_extended`

**Auto-created** with:
- All product fields
- Category-specific fields (50+ total)
- Image URL and path
- Timestamps and status

---

## 🔧 Form Integration

Frontend sends:
- Form fields (name, price, description, etc.)
- Image file
- Category selection
- Category-specific data

Backend receives:
- Saves image to `uploads/products/`
- Stores in database
- Returns product ID and image URL

---

## ✅ Features Included

✔️ Image upload (5MB max)  
✔️ Multiple image formats (JPG, PNG, GIF, WebP)  
✔️ Auto image cleanup  
✔️ Category-specific database fields  
✔️ Real-time price calculation  
✔️ Error handling & validation  
✔️ RESTful API  
✔️ CRUD operations  

---

## 🧪 Quick Test

### Browser Test
1. Open: `http://localhost:5000/productslatestuploads.html`
2. Select category
3. Fill form
4. Upload image
5. Submit
6. Check response

### cURL Test
```bash
curl -X POST http://localhost:5000/api/product_uploads \
  -F "productName=Test" \
  -F "category=cement" \
  -F "price=300" \
  -F "image=@test.jpg"
```

### Get All Products
```bash
curl http://localhost:5000/api/product_uploads
```

---

## 📝 Form Categories

- 🏭 **Cement** - Type, Grade, Setting Time, Strength
- 🧱 **Bricks** - Type, Size, Weight
- 🏗️ **Building Materials** - Type, Thickness, Density
- ⚙️ **Iron & Steel** - Type, Diameter, Grade
- 🚰 **Plumbing** - Type, Material, Diameter, Pressure
- 🎨 **Home Interior** - Type, Finish, Coverage

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Directory not found | `mkdir -p uploads/products` |
| Multer not found | `npm install multer` |
| MySQL error | Check `db.js` credentials |
| Upload fails | Check file size (max 5MB) & format |
| Image not showing | Check `uploads/products/` exists |

---

## 📦 What's New

✨ **New File:** `routes/product_uploads.js` (560 lines)  
✨ **New Table:** `products_extended` with 50+ fields  
✨ **Updated:** `server.js` with route import  
✨ **Updated:** `productslatestuploads.html` with API integration  
✨ **New Docs:** API reference & setup guides  

---

## 💾 Database Details

**Fields Included:**
- Basic: name, brand, category, description
- Price: price, discount, finalPrice
- Quantity: quantity, quantityUnit, moq
- Quality: rating, warranty, color
- Images: imageUrl, imagePath
- Category-specific fields (40+ more)
- Metadata: created_at, updated_at, status

---

## 🎨 Image Upload Details

**Storage:**
- Location: `uploads/products/`
- Filename: `{timestamp}-{random}.{ext}`
- Example: `1674234890123-987654321.jpg`

**Access:**
- URL: `http://localhost:5000/uploads/products/{filename}`

**Limits:**
- Max size: 5MB
- Formats: JPG, PNG, GIF, WebP
- Auto cleanup: On update/delete

---

## 🚀 Full Workflow

1. **User opens form** → `productslatestuploads.html`
2. **Select category** → Form fields update
3. **Fill details** → Name, price, description, etc.
4. **Upload image** → Preview shows
5. **Click Submit** → FormData sent to API
6. **Backend receives** → Saves image, stores in DB
7. **Returns response** → Product ID, image URL
8. **Success message** → Shows to user
9. **Image accessible** → Via HTTP URL
10. **Retrievable via API** → GET endpoints

---

## 📞 Support Files

- 📖 Full API docs: `PRODUCT_UPLOAD_API.md`
- 🔧 Setup guide: `PRODUCT_UPLOAD_SETUP.md`
- 📋 This summary: `QUICK_REFERENCE.md`
- 🧪 Test utilities: `test_product_upload.js`

---

## ⚙️ Configuration

**MySQL** (db.js):
```
Host: localhost
User: root
Password: 2001
Database: buildingmaterials
```

**Server** (server.js):
```
Port: 5000
Payload limit: 50MB
Image limit: 5MB (multer)
```

**File Upload** (product_uploads.js):
```
Directory: uploads/products
Formats: JPG, PNG, GIF, WebP
```

---

## 🎯 Next Steps

1. ✅ Start server: `node server.js`
2. ✅ Open form: `http://localhost:5000/productslatestuploads.html`
3. ✅ Upload test product
4. ✅ Verify in database: `SELECT * FROM products_extended;`
5. ✅ Check image file: `uploads/products/`
6. ✅ Get via API: `GET /api/product_uploads`
7. 🔲 Build product display page
8. 🔲 Build admin panel
9. 🔲 Add edit/delete UI
10. 🔲 Implement pagination

---

## 🏆 Ready to Use!

Everything is configured and ready to go. Just:
- Run `node server.js`
- Open the form
- Upload products
- Start using the API!

---

**Quick Reference Card**  
*Created: January 26, 2026*  
*Status: ✅ Complete*


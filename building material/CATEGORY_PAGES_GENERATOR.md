# Category Pages - Complete HTML Templates

## Files to Create/Replace:
1. cement.html
2. bricks.html
3. building-materials.html
4. iron-steel.html
5. plumbing.html
6. home-interior.html

## Category Configuration:

| File | Category ID | Emoji | Title | Color Gradient |
|------|------------|-------|-------|-----------------|
| cement.html | cement | 🏗️ | Cement Products | #667eea → #764ba2 |
| bricks.html | bricks | 🧱 | Bricks & Blocks | #f093fb → #f5576c |
| building-materials.html | building-materials | 🏢 | Building Materials | #4facfe → #00f2fe |
| iron-steel.html | iron-steel | ⚙️ | Iron & Steel | #fa709a → #fee140 |
| plumbing.html | plumbing | 🔧 | Plumbing Supplies | #30cfd0 → #330867 |
| home-interior.html | home-interior | 🏠 | Home Interior | #a8edea → #fed6e3 |

## Features Included in Each Page:
✓ Category navigation menu (all 6 categories + All Products)
✓ Header with emoji and category name
✓ Statistics dashboard (Total Products, Average Price, In Stock)
✓ Sort dropdown (Newest, Price Low-High, Price High-Low, Rating)
✓ Search functionality
✓ Product cards with:
  - Product image
  - Product name
  - Price with original price
  - Discount badge
  - Rating
  - View Details button
  - Wishlist button (with heart icon)
✓ Product details modal
✓ Wishlist management with localStorage
✓ Responsive design (mobile, tablet, desktop)
✓ Loading states
✓ Error handling

## API Endpoints:
All pages use: `/api/product_uploads/category/{categoryName}`

Examples:
- `/api/product_uploads/category/cement`
- `/api/product_uploads/category/bricks`
- `/api/product_uploads/category/building-materials`
- `/api/product_uploads/category/iron-steel`
- `/api/product_uploads/category/plumbing`
- `/api/product_uploads/category/home-interior`

## Installation Instructions:
1. Replace/overwrite the existing files in your project directory
2. Ensure your backend API is running and providing data for these endpoints
3. Update any internal links in other pages if needed
4. Test each category page to ensure products load correctly

## Styling Highlights:
- Gradient backgrounds for visual appeal
- Smooth animations and transitions
- Card hover effects
- Modal animations
- Mobile-responsive layout
- Consistent color scheme (#ff6b00 for primary actions)

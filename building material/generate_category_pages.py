#!/usr/bin/env python3
"""
Category Pages Generator for Building Materials Website
Generates 6 category pages with consistent styling and functionality
"""

import os
import json

# Configuration for each category
CATEGORIES = [
    {
        "filename": "cement.html",
        "category_id": "cement",
        "emoji": "🏗️",
        "title": "Cement Products",
        "description": "Premium Quality Cement for All Your Construction Needs",
        "gradient": "#667eea 0%, #764ba2 100%"
    },
    {
        "filename": "bricks.html",
        "category_id": "bricks",
        "emoji": "🧱",
        "title": "Bricks & Blocks",
        "description": "High-Quality Bricks for Durable Construction",
        "gradient": "#f093fb 0%, #f5576c 100%"
    },
    {
        "filename": "building-materials.html",
        "category_id": "building-materials",
        "emoji": "🏢",
        "title": "Building Materials",
        "description": "Complete Range of Building Supplies & Materials",
        "gradient": "#4facfe 0%, #00f2fe 100%"
    },
    {
        "filename": "iron-steel.html",
        "category_id": "iron-steel",
        "emoji": "⚙️",
        "title": "Iron & Steel",
        "description": "Durable Iron & Steel Products for Construction",
        "gradient": "#fa709a 0%, #fee140 100%"
    },
    {
        "filename": "plumbing.html",
        "category_id": "plumbing",
        "emoji": "🔧",
        "title": "Plumbing Supplies",
        "description": "Premium Plumbing Materials & Fixtures",
        "gradient": "#30cfd0 0%, #330867 100%"
    },
    {
        "filename": "home-interior.html",
        "category_id": "home-interior",
        "emoji": "🏠",
        "title": "Home Interior",
        "description": "Beautiful Home Interior Products & Solutions",
        "gradient": "#a8edea 0%, #fed6e3 100%"
    }
]

# HTML Template
HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Building Materials</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #333;
            padding: 30px 15px;
            min-height: 100vh;
        }}

        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}

        /* Navigation */
        .category-nav {{
            background: #fff;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: center;
            justify-content: center;
        }}

        .nav-link {{
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            border: 2px solid #ddd;
            background: #f9f9f9;
        }}

        .nav-link:hover {{
            background: #ff6b00;
            color: #fff;
            border-color: #ff6b00;
        }}

        .nav-link.active {{
            background: #ff6b00;
            color: #fff;
            border-color: #ff6b00;
        }}

        /* Header */
        .category-header {{
            background: linear-gradient(135deg, {gradient});
            color: white;
            padding: 40px 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }}

        .category-header h1 {{
            font-size: 42px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }}

        .category-header .emoji {{
            font-size: 50px;
        }}

        .category-header p {{
            font-size: 16px;
            opacity: 0.95;
        }}

        /* Stats Dashboard */
        .stats-dashboard {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}

        .stat-card {{
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 5px solid #ff6b00;
            transition: transform 0.3s ease;
        }}

        .stat-card:hover {{
            transform: translateY(-5px);
        }}

        .stat-card .value {{
            font-size: 32px;
            font-weight: bold;
            color: #ff6b00;
            margin: 10px 0;
        }}

        .stat-card .label {{
            font-size: 14px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}

        /* Filter Section */
        .filter-section {{
            background: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }}

        .filter-group {{
            display: flex;
            gap: 12px;
            align-items: center;
        }}

        .filter-label {{
            font-weight: bold;
            color: #333;
            white-space: nowrap;
        }}

        select, input {{
            padding: 10px 15px;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
        }}

        select:hover, input:hover {{
            border-color: #ff6b00;
        }}

        select:focus, input:focus {{
            outline: none;
            border-color: #ff6b00;
            box-shadow: 0 0 8px rgba(255, 107, 0, 0.2);
        }}

        /* Products Grid */
        .products-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }}

        .product-card {{
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            position: relative;
        }}

        .product-card:hover {{
            transform: translateY(-8px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.2);
        }}

        .product-image {{
            width: 100%;
            height: 250px;
            object-fit: cover;
            background: #f5f5f5;
        }}

        .discount-badge {{
            position: absolute;
            top: 12px;
            right: 12px;
            background: #ff6b00;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            font-size: 14px;
        }}

        .product-info {{
            padding: 20px;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
        }}

        .product-name {{
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #222;
        }}

        .product-price {{
            font-size: 20px;
            font-weight: bold;
            color: #ff6b00;
            margin-bottom: 4px;
        }}

        .product-original-price {{
            font-size: 14px;
            color: #999;
            text-decoration: line-through;
            margin-bottom: 12px;
        }}

        .product-rating {{
            font-size: 14px;
            color: #f39c12;
            margin-bottom: 12px;
        }}

        .product-actions {{
            display: flex;
            gap: 10px;
            margin-top: auto;
        }}

        .action-btn {{
            flex: 1;
            padding: 12px 15px;
            border: 2px solid #ff6b00;
            background: white;
            color: #ff6b00;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }}

        .action-btn:hover {{
            background: #ff6b00;
            color: white;
        }}

        .wishlist-btn {{
            width: 45px;
            padding: 12px;
        }}

        .wishlist-btn.liked {{
            background: #ff6b00;
            color: white;
            border-color: #ff6b00;
        }}

        /* Modal */
        .modal {{
            display: none;
            position: fixed;
            z-index: 2000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            overflow-y: auto;
        }}

        .modal.show {{
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }}

        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}

        .modal-content {{
            background: white;
            padding: 40px;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        }}

        @keyframes slideUp {{
            from {{ transform: translateY(50px); opacity: 0; }}
            to {{ transform: translateY(0); opacity: 1; }}
        }}

        .modal-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
        }}

        .modal-header h2 {{
            font-size: 24px;
            color: #333;
        }}

        .close-btn {{
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #999;
            transition: color 0.3s ease;
        }}

        .close-btn:hover {{
            color: #333;
        }}

        .modal-body {{
            margin-bottom: 25px;
        }}

        .modal-body img {{
            width: 100%;
            max-height: 300px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 20px;
        }}

        .modal-detail {{
            margin-bottom: 15px;
            font-size: 14px;
            line-height: 1.6;
        }}

        .modal-detail strong {{
            color: #333;
            display: inline-block;
            min-width: 120px;
        }}

        .modal-footer {{
            display: flex;
            gap: 12px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}

        .modal-btn {{
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }}

        .modal-btn-primary {{
            background: #ff6b00;
            color: white;
        }}

        .modal-btn-primary:hover {{
            background: #e55a00;
        }}

        .modal-btn-secondary {{
            background: #f0f0f0;
            color: #333;
        }}

        .modal-btn-secondary:hover {{
            background: #e0e0e0;
        }}

        /* Empty State */
        .empty-state {{
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }}

        .empty-state-icon {{
            font-size: 60px;
            margin-bottom: 20px;
        }}

        .empty-state h2 {{
            font-size: 24px;
            margin-bottom: 10px;
            color: #333;
        }}

        /* Responsive */
        @media (max-width: 768px) {{
            .category-header h1 {{
                font-size: 28px;
            }}

            .category-header .emoji {{
                font-size: 36px;
            }}

            .products-grid {{
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
            }}

            .filter-section {{
                flex-direction: column;
                align-items: stretch;
            }}

            .filter-group {{
                width: 100%;
            }}

            select, input {{
                width: 100%;
            }}

            .modal-content {{
                padding: 20px;
            }}

            .stats-dashboard {{
                grid-template-columns: 1fr;
            }}
        }}

        .loading {{
            text-align: center;
            padding: 40px;
            font-size: 16px;
            color: #666;
        }}

        .spinner {{
            display: inline-block;
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #ff6b00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }}

        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Navigation -->
        <div class="category-nav">
            <a href="allproducts.html" class="nav-link">All Products</a>
            <a href="cement.html" class="nav-link">🏗️ Cement</a>
            <a href="bricks.html" class="nav-link">🧱 Bricks</a>
            <a href="building-materials.html" class="nav-link">🏢 Building Materials</a>
            <a href="iron-steel.html" class="nav-link">⚙️ Iron & Steel</a>
            <a href="plumbing.html" class="nav-link">🔧 Plumbing</a>
            <a href="home-interior.html" class="nav-link">🏠 Home Interior</a>
        </div>

        <!-- Header -->
        <div class="category-header">
            <h1>
                <span class="emoji">{emoji}</span>
                {title}
            </h1>
            <p>{description}</p>
        </div>

        <!-- Stats Dashboard -->
        <div class="stats-dashboard" id="statsDashboard">
            <div class="stat-card">
                <div class="label">Total Products</div>
                <div class="value" id="totalProducts">0</div>
            </div>
            <div class="stat-card">
                <div class="label">Average Price</div>
                <div class="value" id="averagePrice">₹0</div>
            </div>
            <div class="stat-card">
                <div class="label">In Stock</div>
                <div class="value" id="inStock">0</div>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="filter-section">
            <div class="filter-group">
                <label class="filter-label">Sort By:</label>
                <select id="sortSelect">
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Search:</label>
                <input type="text" id="searchInput" placeholder="Search products...">
            </div>
        </div>

        <!-- Products Grid -->
        <div class="products-grid" id="productsGrid">
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading products...</p>
            </div>
        </div>
    </div>

    <!-- Product Details Modal -->
    <div class="modal" id="productModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalProductName">Product Name</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <img id="modalProductImage" src="" alt="Product" style="width: 100%; border-radius: 8px;">
                <div class="modal-detail">
                    <strong>Price:</strong> <span id="modalProductPrice">₹0</span>
                </div>
                <div class="modal-detail">
                    <strong>Original Price:</strong> <span id="modalProductOriginalPrice">₹0</span>
                </div>
                <div class="modal-detail">
                    <strong>Category:</strong> <span id="modalProductCategory">-</span>
                </div>
                <div class="modal-detail">
                    <strong>Description:</strong> <span id="modalProductDescription">-</span>
                </div>
                <div class="modal-detail">
                    <strong>Stock Status:</strong> <span id="modalProductStock">In Stock</span>
                </div>
                <div class="modal-detail">
                    <strong>Rating:</strong> <span id="modalProductRating">⭐ 4.5/5</span>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn-primary" onclick="addToCart()">Add to Cart</button>
                <button class="modal-btn modal-btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    </div>

    <script>
        const CATEGORY = '{category_id}';
        const API_BASE = '/api/product_uploads/category';
        let allProducts = [];
        let currentProduct = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {{
            loadProducts();
            setupEventListeners();
        }});

        function setupEventListeners() {{
            document.getElementById('sortSelect').addEventListener('change', handleSort);
            document.getElementById('searchInput').addEventListener('input', handleSearch);
            document.addEventListener('click', (e) => {{
                if (e.target === document.getElementById('productModal')) {{
                    closeModal();
                }}
            }});
        }}

        function loadProducts() {{
            fetch(`${{API_BASE}}/${{CATEGORY}}`)
                .then(res => res.json())
                .then(data => {{
                    allProducts = Array.isArray(data) ? data : (data.products || []);
                    displayProducts(allProducts);
                    updateStats(allProducts);
                }})
                .catch(err => {{
                    console.error('Error loading products:', err);
                    document.getElementById('productsGrid').innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">⚠️</div>
                            <h2>Failed to Load Products</h2>
                            <p>Please try again later</p>
                        </div>
                    `;
                }});
        }}

        function displayProducts(products) {{
            const grid = document.getElementById('productsGrid');
            
            if (!products || products.length === 0) {{
                grid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📦</div>
                        <h2>No Products Found</h2>
                        <p>Try adjusting your filters</p>
                    </div>
                `;
                return;
            }}

            grid.innerHTML = products.map(product => createProductCard(product)).join('');
            
            // Attach event listeners
            products.forEach(product => {{
                document.querySelector(`[data-product-id="${{product._id}}"]`)?.addEventListener('click', (e) => {{
                    if (e.target.closest('.wishlist-btn')) return;
                    currentProduct = product;
                    openModal(product);
                }});
            }});

            // Attach wishlist listeners
            document.querySelectorAll('.wishlist-btn').forEach(btn => {{
                btn.addEventListener('click', (e) => {{
                    e.stopPropagation();
                    toggleWishlist(btn, btn.dataset.productId);
                }});
            }});
        }}

        function createProductCard(product) {{
            const wishlist = getWishlist();
            const isWishlisted = wishlist.includes(product._id);
            const discount = product.discount || 0;
            const originalPrice = product.originalPrice || product.price;
            const rating = product.rating || 4.5;

            return `
                <div class="product-card" data-product-id="${{product._id}}">
                    <img src="${{product.image || 'https://via.placeholder.com/280x250'}}" alt="${{product.name}}" class="product-image">
                    ${{discount > 0 ? `<div class="discount-badge">-${{discount}}%</div>` : ''}}
                    <div class="product-info">
                        <div class="product-name">${{product.name}}</div>
                        <div class="product-price">₹${{product.price?.toFixed(2) || 0}}</div>
                        ${{originalPrice && originalPrice !== product.price ? `<div class="product-original-price">₹${{originalPrice.toFixed(2)}}</div>` : ''}}
                        <div class="product-rating">⭐ ${{rating}}/5</div>
                        <div class="product-actions">
                            <button class="action-btn">View Details</button>
                            <button class="action-btn wishlist-btn ${{isWishlisted ? 'liked' : ''}}" data-product-id="${{product._id}}">❤️</button>
                        </div>
                    </div>
                </div>
            `;
        }}

        function handleSort(e) {{
            const sortType = e.target.value;
            let sorted = [...allProducts];

            switch(sortType) {{
                case 'price-low':
                    sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                    break;
                case 'price-high':
                    sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                    break;
                case 'rating':
                    sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
                case 'newest':
                    sorted = [...allProducts];
                    break;
            }}

            displayProducts(sorted);
        }}

        function handleSearch(e) {{
            const query = e.target.value.toLowerCase();
            const filtered = allProducts.filter(product => 
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            );
            displayProducts(filtered);
        }}

        function openModal(product) {{
            document.getElementById('modalProductName').textContent = product.name;
            document.getElementById('modalProductImage').src = product.image || 'https://via.placeholder.com/600x400';
            document.getElementById('modalProductPrice').textContent = `₹${{product.price?.toFixed(2) || 0}}`;
            document.getElementById('modalProductOriginalPrice').textContent = `₹${{(product.originalPrice || product.price)?.toFixed(2) || 0}}`;
            document.getElementById('modalProductCategory').textContent = product.category || '{title}';
            document.getElementById('modalProductDescription').textContent = product.description || 'Premium quality product';
            document.getElementById('modalProductStock').textContent = product.inStock ? 'In Stock' : 'Out of Stock';
            document.getElementById('modalProductRating').textContent = `⭐ ${{product.rating || 4.5}}/5`;
            
            document.getElementById('productModal').classList.add('show');
        }}

        function closeModal() {{
            document.getElementById('productModal').classList.remove('show');
        }}

        function addToCart() {{
            if (!currentProduct) return;
            alert(`Added "${{currentProduct.name}}" to cart!`);
            closeModal();
        }}

        function toggleWishlist(btn, productId) {{
            let wishlist = getWishlist();
            
            if (wishlist.includes(productId)) {{
                wishlist = wishlist.filter(id => id !== productId);
                btn.classList.remove('liked');
            }} else {{
                wishlist.push(productId);
                btn.classList.add('liked');
            }}
            
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }}

        function getWishlist() {{
            const stored = localStorage.getItem('wishlist');
            return stored ? JSON.parse(stored) : [];
        }}

        function updateStats(products) {{
            const totalProducts = products.length;
            const averagePrice = products.length > 0 
                ? (products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length).toFixed(2)
                : 0;
            const inStock = products.filter(p => p.inStock !== false).length;

            document.getElementById('totalProducts').textContent = totalProducts;
            document.getElementById('averagePrice').textContent = `₹${{averagePrice}}`;
            document.getElementById('inStock').textContent = inStock;
        }}

        // Set active nav link
        document.addEventListener('DOMContentLoaded', () => {{
            const filename = '{filename}';
            document.querySelectorAll('.nav-link').forEach(link => {{
                if (link.href.includes(filename)) {{
                    link.classList.add('active');
                }}
            }});
        }});
    </script>
</body>
</html>
'''

def generate_pages():
    """Generate all category pages"""
    base_path = os.path.dirname(os.path.abspath(__file__))
    
    for category in CATEGORIES:
        # Generate HTML from template
        html_content = HTML_TEMPLATE.format(
            filename=category['filename'],
            category_id=category['category_id'],
            emoji=category['emoji'],
            title=category['title'],
            description=category['description'],
            gradient=category['gradient']
        )
        
        # Write to file
        file_path = os.path.join(base_path, category['filename'])
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"✓ Generated: {category['filename']}")

if __name__ == '__main__':
    print("Generating Category Pages...")
    print("=" * 50)
    generate_pages()
    print("=" * 50)
    print("✓ All 6 category pages generated successfully!")
    print("\nGenerated files:")
    for cat in CATEGORIES:
        print(f"  - {cat['filename']}")

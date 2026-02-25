# Login & Session Testing Guide

## Overview
The login functionality has been updated to show the user's name in the navbar instead of "Login" when logged in, and display a "Logout" link until they log out.

## Quick Start

### 1. Start the Server
```powershell
cd 'C:\Users\admin\Downloads\building material'
node server.js
```

You should see:
```
🚀 Server running at http://localhost:5000
✅ MySQL connected.
✅ seller_profiles table created
✅ buyer_profiles table created
```

### 2. Test Using the Test Page
Open in browser: http://localhost:5000/test_session.html

**Follow these steps:**
1. Click **"0. Create Test Buyer (if needed)"** to create a test account
2. Click **"1. Check Session"** - should say "No session found"
3. Click **"2. Login as Buyer"** - should succeed
4. Click **"3. Check Session Again"** - should show the test buyer's name
5. Click **"4. Logout"** - should log out
6. Click **"1. Check Session"** again - should say "No session found"

### 3. Test in Real Pages

After successful login via test page (or manually), try:

1. **Go to Home Page**: http://localhost:5000/index.html
   - Look for username in navbar where "Login" was
   - Should show "Test Buyer" in green
   - "Logout" link should appear

2. **Navigate Between Pages**:
   - Visit: http://localhost:5000/cement.html
   - Visit: http://localhost:5000/bricks.html
   - Username should persist across all pages

3. **Click Logout**:
   - Click the "Logout" link
   - Page reloads
   - "Login" should reappear in navbar

## Manual Login Testing

### Create a Test Buyer Account
Visit: http://localhost:5000/buyer_register.html
- Fill in the form with:
  - Name: Test Buyer
  - Email: testbuyer@test.com
  - Phone: 9999999999
  - Password: password123
- Click Register

### Login
Visit: http://localhost:5000/login.html
- Email/Phone: testbuyer@test.com
- Password: password123
- Select "Buyer" radio button
- Click Login
- Should redirect to http://localhost:5000/index.html
- Check navbar for username

## Troubleshooting

### Username Not Showing in Navbar

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Go to Console tab
   - Look for messages like:
     - "🔍 Checking session..."
     - "📊 Session data: ..." 
     - "✅ User logged in: ..."

2. **Check Browser Cookies**:
   - Open DevTools (F12)
   - Go to Application → Cookies → http://localhost:5000
   - Should see a `connect.sid` cookie after login
   - If missing, session is not being set

3. **Check Server Terminal**:
   - Look for any error messages
   - If session issues, you'll see them there

4. **Common Issues**:
   - **Using file:// instead of http://**: Sessions only work with proper HTTP origin
   - **Different domain/port**: Must use http://localhost:5000
   - **Browser Privacy Mode**: May block cookies

## Expected Behavior

### Before Login
```
Navbar: [Home] [About] [Store] [Cart] [Login] [Contact]
```

### After Buyer Login
```
Navbar: [Home] [About] [Store] [Cart] [Test Buyer] [Logout] [Contact]
```

### After Logout
```
Navbar: [Home] [About] [Store] [Cart] [Login] [Contact]
```

## Technical Details

### Files Modified
- `server.js` - Updated CORS and session cookie config
- `index.html` - Added session check script
- `login.html` - Updated login form with better logging
- `test_session.html` - Created test utility page
- Other pages - Added session check script to all pages with login link

### Session Flow
1. User submits login form on `/login.html`
2. Form POSTs to `/api/login` with `credentials: 'include'`
3. Server sets `req.session.user` with user details
4. Server responds with `{ success: true, user: {...} }`
5. Client redirects to `/index.html`
6. On page load, JavaScript calls `/api/me` with `credentials: 'include'`
7. Server returns session user data
8. JavaScript updates navbar to show username instead of "Login"
9. "Logout" link appears and sends POST to `/api/logout`
10. Server destroys session and clears cookie
11. Page reloads, navbar returns to "Login" state

## Notes

- Session persists across browser tabs (same origin)
- Session expires after 24 hours of inactivity
- Logout immediately destroys the session
- Test data is stored in MySQL database

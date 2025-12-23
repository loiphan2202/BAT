# TODO List for Fixing Signup Page Issues

## 1. Implement registerUser function in backend
- [x] Add registerUser function to backend/controllers/userController.js with password hashing, email uniqueness check, and JWT token generation
- [x] Include welcome email sending in registerUser

## 2. Fix Google sign-in API URL in frontend
- [x] Correct the malformed URL in frontend/src/pages/Signup.jsx to ${import.meta.env.VITE_BACKEND_BASEURL}/api/google-signin

## 3. Update CORS origins in backend
- [x] Add http://localhost:5178 to allowedOrigins in backend/index.js

## 4. Fix Google sign-in navigation in frontend
- [x] Change navigate('/home') to navigate('/') in frontend/src/pages/Signup.jsx

## 5. Create frontend/.env if missing
- [x] Add VITE_BACKEND_BASEURL=http://localhost:4000 to frontend/.env

## 6. Testing
- [x] Restart backend server after changes
- [x] Test regular signup functionality
- [x] Test Google sign-in functionality
- [x] Verify navigation after successful signup
- [x] Fix CORS issues for localhost:5179
- [x] Add autocomplete attributes to password fields

## 7. Fix Destination Page Layout
- [x] Fix sidebar width and main content margin
- [x] Test destination page functionality

## 8. Fix API Endpoint Issues
- [x] Update Destination.jsx to use /api/destinations instead of /destinations
- [x] Update Booking.jsx to use /api/bookings/verify-payment instead of /api/verify-payment
- [x] Create frontend/.env with VITE_BACKEND_BASEURL=http://localhost:4000
- [x] Update CORS origins to include localhost:5179, 5180

## 9. Fix Remaining Issues
- [x] Fixed destination page layout (ml-55 to ml-72)
- [x] Updated CORS for current frontend port (5180)
- [x] Payment verification endpoint working successfully
- [x] Login authentication working successfully - tested with API calls
- [ ] Investigate SVG attribute errors (width/height "auto") - cosmetic only, doesn't affect functionality

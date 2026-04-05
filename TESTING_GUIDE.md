# 🧪 TESTING GUIDE - Backend Quick Fixes

After implementing all 8 quick fixes, use this guide to verify everything is working correctly.

---

## 🚀 Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Both should start without errors. Check for:
```
✅ Backend: "Server running in development mode on port 5000"
✅ Frontend: "VITE v8.0.3  ready in 828 ms"
```

---

## 🔒 Test 1: CORS Protection

### Test Case 1a: Valid Domain (Should succeed)
```bash
curl -X GET http://localhost:5000/ \
  -H "Origin: http://localhost:5173"

# Expected: {"success":true,"message":"Welcome to Sivilize Hub Pro API"}
```

### Test Case 1b: Invalid Domain (Should block)
```bash
curl -X OPTIONS http://localhost:5000/api/auth/login \
  -H "Origin: http://attacker.com" \
  -H "Access-Control-Request-Method: POST"

# Expected: No CORS headers in response
# Expected in browser console: CORS error
```

### Test in Browser:
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Should succeed (Origin: localhost:5173 allowed)
5. Change frontend port → should fail with CORS error

---

## ⚡ Test 2: Rate Limiting

### Test Case 2a: Normal Rate (Should succeed)
```bash
# Single request - should succeed
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response: {"success":false,"message":"Kredensial tidak valid"}
# (Auth failed but rate limit OK)
```

### Test Case 2b: Exceed Rate Limit (Should block)
```bash
# Rapid-fire 6 login attempts
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nAttempt $i\n"
  sleep 0.05  # Very fast
done

# Attempts 1-5: Succeed
# Attempt 6: Should get rate limit error
# Response: "message":"Terlalu banyak percobaan login, coba lagi nanti"
```

### Test in Browser:
1. Open DevTools (F12)
2. Try to spam the login button
3. After 5 attempts, button should be disabled
4. Error: "Terlalu banyak percobaan login"

---

## ✔️ Test 3: Input Validation

### Test Case 3a: Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"not-an-email","password":"password123"}'

# Expected: {"success":false,"message":"Validasi data gagal","errors":[{"field":"email","message":"Format email tidak valid"}]}
```

### Test Case 3b: Short Password
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123"}'

# Expected: Validation error - "Password minimal 6 karakter"
```

### Test Case 3c: Missing Field
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","password":"password123"}'

# Expected: Validation error - "Email diperlukan"
```

### Test Case 3d: Invalid Project Data
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Proj","budget":"not-a-number","startDate":"2025-01-01","endDate":"2024-01-01"}'

# Expected: Multiple validation errors for budget and endDate
```

---

## 🔐 Test 4: XSS Protection (HTML Sanitization)

### Test Case 4a: Script Tag
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","password":"password123"}'

# Check database: Name should be sanitized, no script tags
```

### Test Case 4b: HTML Tags
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Project","description":"<img src=x onerror=alert(1)>","budget":1000000,"startDate":"2025-01-01","endDate":"2025-12-31"}'

# Expected: Description should be cleaned, no dangerous HTML
```

---

## 📁 Test 5: Secure File Upload

### Test Case 5a: Valid Image
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "project=PROJECT_ID" \
  -F "date=2025-01-01" \
  -F "description=Daily log" \
  -F "photos=@/path/to/image.jpg"

# Expected: Upload succeeds, filename sanitized
```

### Test Case 5b: Invalid File Type (Should fail)
```bash
# Create test file
echo "Malicious content" > test.js

curl -X POST http://localhost:5000/api/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "project=PROJECT_ID" \
  -F "date=2025-01-01" \
  -F "description=Daily log" \
  -F "photos=@test.js"

# Expected error: "Hanya file gambar (JPEG, PNG, WebP) yang diizinkan"
```

### Test Case 5c: File Size Exceeded (Should fail)
```bash
# Create large file (10MB)
$filename = "large_image.jpg"
$size = 10MB
$fs = New-Object System.IO.FileStream $filename, Create, Write
$fs.SetLength($size)
$fs.Close()

curl -X POST http://localhost:5000/api/logs \
  -F "photos=@large_image.jpg"

# Expected error: "Ukuran file maksimal 5MB"
```

### Test Case 5d: Path Traversal (Should fail)
```bash
# Try to upload to ../important_file.xyz
curl -X POST http://localhost:5000/api/logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "project=PROJECT_ID" \
  -F "date=2025-01-01" \
  -F "description=Hack attempt" \
  -F "photos=@../../../../../../etc/passwd"

# Expected: File saved safely in /uploads/ with sanitized name
# Check: cat server/uploads/TIMESTAMP-*.jpg (should exist, not /etc/passwd)
```

---

## 📄 Test 6: Pagination

### Test Case 6a: Default Pagination
```bash
curl -X GET "http://localhost:5000/api/projects" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: First 20 projects returned
# Response includes pagination object:
# {"data":[...20 items...],"pagination":{"page":1,"limit":20,"total":150,"totalPages":8,"hasMore":true}}
```

### Test Case 6b: Custom Page
```bash
curl -X GET "http://localhost:5000/api/projects?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Projects 11-20 returned
# {"pagination":{"page":2,"limit":10,...}}
```

### Test Case 6c: High Limit (Should cap at 100)
```bash
curl -X GET "http://localhost:5000/api/projects?limit=500" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: Limit capped at 100, not 500
# {"pagination":{"limit":100,...}}
```

### Test  in Browser:
1. Open Chrome DevTools
2. Go to Performance tab
3. Load projects
4. Before: Network tab shows 50+MB response
5. After: Shows ~50KB response (10K times smaller!)

---

## 🔍 Test 7: Error Handling

### Test Case 7a: Server Error (500)
```bash
# Trigger error by requesting non-existent endpoint
curl -X GET http://localhost:5000/api/invalid-endpoint

# Expected consistent error format:
# {"success":false,"message":"...","stack":"..."}
```

### Test Case 7b: Validation Error (400)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# Expected:
# {"success":false,"message":"Validasi data gagal","errors":[...]}
```

### Test Case 7c: Auth Required (401)
```bash
# Without token
curl -X GET http://localhost:5000/api/projects

# Expected: {"success":false,"message":"Not authorized to access this route"}
```

### Test Case 7d: Not Authorized (403)
```bash
# Try to access someone else's project
curl -X GET http://localhost:5000/api/projects/OTHER_USER_PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected 403: {"success":false,"message":"Tidak authorized"}
```

---

## 📊 Test 8: Combined Load Test

### What It Tests:
- Rate limiting under load
- Validation at scale
- Pagination performance
- File upload concurrent requests

### Run Load Test:
```bash
# Install artillery (load testing)
npm install -g artillery

# Create load-test.yml (see MongoDB roadmap)
artillery run load-test.yml

# Will show:
# - Response times
# - Error rates (should be <1%)
# - Throughput (requests/sec)
```

---

## ✅ Test Checklist

Before declaring "implementation complete":

- [ ] CORS blocks unknown origins
- [ ] CORS allows localhost:5173
- [ ] Rate limiting kicks in after 5 login attempts
- [ ] Invalid emails rejected
- [ ] Short passwords rejected
- [ ] XSS attempts sanitized
- [ ] Non-image files rejected
- [ ] Large files (>5MB) rejected
- [ ] Path traversal attempts blocked
- [ ] First 20 projects returned (not all)
- [ ] Custom pagination works
- [ ] Errors have consistent format
- [ ] 403 vs 401 vs 400 status codes correct
- [ ] Server handles 100 concurrent requests
- [ ] Dev Tools Network tab shows <100KB responses

---

## 🐛 Debugging

### Enable Verbose Logging:
```env
# Add to .env
DEBUG=*
NODE_ENV=development
```

### Check Logs:
```bash
# Monitor server logs in real-time
node index.js | findstr "Error\|Warning\|Rate limit"
```

### Test with Postman:
1. Import [postman_collection.json](./postman_collection.json) (if available)
2. Set environment:
   - Backend URL: http://localhost:5000
   - Token: (get from login response)
3. Run test suite

---

## 📈 Success Criteria

**All fixes working correctly when:**

1. ✅ CORS prevents external domain access
2. ✅ Rate limiting blocks spam
3. ✅ Validation rejects invalid data
4. ✅ File upload is secure
5. ✅ XSS is prevented
6. ✅ Pagination works
7. ✅ Errors are consistent
8. ✅ Response times <100ms
9. ✅ No console errors
10. ✅ Browser DevTools shows healthy network

---

## 🎉 When Tests Pass

You're ready to:
- [ ] Deploy to staging
- [ ] Run production load tests
- [ ] Optional: Setup MongoDB for true production readiness
- [ ] Go live!

---

**All tests passing? Congratulations! 🚀 Your backend is now secure and robust!**

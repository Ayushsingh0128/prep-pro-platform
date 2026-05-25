#!/bin/bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User", "email":"test@example.com", "password":"password123"}'

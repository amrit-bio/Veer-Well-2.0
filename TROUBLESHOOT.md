VEERWELL TROUBLESHOOTING GUIDE
================================

IF YOU SEE "cannot get" OR "404" IN BROWSER:

STEP 1: Check if Vite is running
- Look for this in your terminal:
  "VITE v5.4.21 ready in 1715 ms"
- If you don't see it, Vite isn't running

STEP 2: Restart the client if needed
1. Stop any running process (Ctrl+C in the terminal)
2. Run: cd C:\Users\hp\OneDrive\Desktop\VeerWell 2.0\client
3. Run: npm run dev
4. Wait for: "VITE v5.4.21 ready in 1715 ms"
5. Then open browser to: http://localhost:3000

STEP 3: Check the server is also running
- Look for: "[VeerWell Server] Server running at http://localhost:5000"
- If not running: cd C:\Users\hp\OneDrive\Desktop\VeerWell 2.0\server
- Run: npm run dev:server

STEP 4: Verify the AI fix is in place
- Open: C:\Users\hp\OneDrive\Desktop\VeerWell 2.0\client\.env
- Ensure line 2 says: VITE_API_BASE=http://localhost:5000

STEP 5: Browser URL
- Open: http://localhost:3000
- Click the "Rakshak AI Copilot" button (bottom right)
- Start messaging!

================================
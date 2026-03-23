Here is your final clean single README.md file — no extra text, just copy-paste ready:

# 🔐 VAULT — Minimal File Server with Admin Dashboard

A lightweight, zero-dependency file server built with pure Node.js and a terminal-style admin dashboard for managing files locally or over the internet.

---

## ✨ Overview

VAULT is designed to be:

- ⚡ Zero-dependency (Node.js core only)
- 🧩 Simple to run (single command)
- 📁 Persistent (files stored on disk)
- 🌐 Accessible globally (via ngrok)
- 🖥️ Admin-controlled dashboard

---

## 🚀 Features

### 📁 File Management
- Upload multiple files (drag & drop)
- Persistent disk storage
- Download files with correct headers
- Delete files from dashboard

### 📊 System Monitoring
- Total files count
- Disk usage tracking
- RAM usage (live stats)

### 🔐 Admin Dashboard
- Login-protected UI (frontend-based)
- File explorer interface
- Upload progress indicator
- Terminal-style design
 ## 🔐 Change Admin Credentials

To update the admin login credentials, edit the following line in your HTML file.

### 📍 Code Reference (Line ~320)

``javascript
// Line 320
const CREDS = { u: 'admin', p: '1234' };
// Line 320 (after change)
const CREDS = { u: 'your_username', p: 'your_password' };

### 🌍 Networking
- Local server (`localhost`)
- Public sharing via ngrok tunnel

---

## 🧱 Project Structure

. ├── server.js ├── index.html └── uploads/

---

## ⚙️ Tech Stack

| Layer     | Technology |
|----------|-----------|
| Backend  | Node.js (http, fs, path, os) |
| Frontend | HTML, CSS, Vanilla JS |
| Storage  | Local filesystem |
| Tunnel   | ngrok |

---

## ⚡ Quick Start

### 1. Install Node.js

```bash
node -v

2. Run Server

node server.js

3. Open Dashboard

http://localhost:3000

4. Login

Username: kaztral
Password: 1234

> ⚠️ Hardcoded credentials (not secure for production)




---

🌍 Public Access (ngrok)

pkg install ngrok
ngrok config add-authtoken YOUR_TOKEN
ngrok http 3000


---

🔌 API

Get files

GET /api/files

Upload

POST /api/upload

Delete

DELETE /api/files/:filename

Download

GET /uploads/:filename


---

⚠️ Limitations

No backend authentication

Uploads stored fully in memory

No file size limits

No HTTPS (without ngrok)

Not production ready



---

🔧 Roadmap

[ ] JWT authentication

[ ] Streaming uploads

[ ] File size limits

[ ] Logging

[ ] Docker support

[ ] HTTPS setup



---

🧪 Use Cases

Personal file vault

Temporary file sharing

Local network storage

Termux hosting



---

📄 License

MIT


---

👤 Author

Kaztral

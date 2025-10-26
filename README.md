# ☀️ Developer Portal

An interactive web app for exploring renewable energy developer projects — includes an interactive map, a searchable list of developer cards, and a side-by-side comparison view.

---

## 🚀 Features

### 🌍 **Map View**
- Displays developer project locations using **React Leaflet**.
- Each marker shows details (project type, capacity, region, contact).
- Click **Compare** in a popup to open the comparison modal.

### 🧩 **Developers List**
- Grid of developer cards fetched from your backend.
- Each card has **Select** and **Compare** buttons.
- Selecting developers adds them to a bottom **Comparison Hotbar**.

### ⚖️ **Comparison Modal**
- Shows selected developers side by side.
- Can be opened from:
  - Map markers  
  - Developer cards  
  - Comparison hotbar  

### 🏠 **Home Page**
- Landing section with quick stats and navigation tabs.
- Tabs for **Home**, **Map**, and **Developers**.

---

## 🛠️ Setup & Run

### 1️⃣ Install dependencies
```bash
npm install
# or
yarn install
```

### 2️⃣ Start the development server
```bash
npm start
# or
yarn start
```

The app will open at **http://localhost:3000**

Make sure your backend API (`http://127.0.0.1:8000/developers`) is running and accessible (CORS enabled).

---

## 🗺️ Map Configuration

The app uses **OpenStreetMap tiles** through React Leaflet:

```jsx
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
```

If you want to change tile style (for example, Mapbox or Stamen), replace the URL and add your credentials if required.

---

## 🧩 Customization

### Change Map Center & Zoom
Edit in `MapView.jsx`:
```jsx
<MapContainer center={[-25, 133]} zoom={4} />
```

### Add More Fields to Cards or Comparison
Edit `DeveloperCard.js` or `ComparisonView.js` and include your custom fields (like `offer_model` or `classification`).

---

## 🧪 Troubleshooting

| Issue | Fix |
|-------|-----|
| Map loads but no markers/cards | Ensure backend `/developers` returns valid JSON with `lat` and `lng` keys. |
| “CORS error” in console | Enable CORS on your backend (`django-cors-headers` for Django, `fastapi.middleware.cors` for FastAPI). |
| Cards show blank fields | Check your CSV → backend pipeline; missing fields become empty strings. |
| Nothing renders | Check the console for network errors. The app won’t display developers if API fails. |

---

## 🧭 Next Steps
- ✅ Add search & filters on the developer list  
- ✅ Paginate or cluster markers for large datasets  
- 📦 Add backend sorting & filtering endpoints  
- 💾 Add CSV export from comparison modal  

---

**Made with ❤️ using React + Leaflet + Axios**

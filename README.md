# Streats 🚚

Streats is a food truck finder web app built to help users find food trucks nearby, search for specific trucks, view important details, and save their favorites.

It is a single-page app that works on both desktop and mobile.

---

## Project Description

The goal of Streats is to make it easy to discover food trucks near you. Users can:

- See nearby food trucks on an interactive map
- Search for food trucks by name or keyword
- View details like rating, address, phone number, and website
- Save favorite trucks to come back to later
- Use the app on desktop or mobile

---

## How to Run the Project

### Prerequisites

You will need:

- Node.js version 18 or later
- A Google Maps API key with these enabled:
  - Maps JavaScript API
  - Places API (New)

### Setup

1. Clone the repo:

```bash
git clone https://github.com/tatematley/Streats.git
cd Streats
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root folder and add:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the app:

```bash
npm run dev
```

5. Open it in your browser at:

```bash
http://localhost:5173
```

---

## APIs Used and How Data Is Handled

### Google Maps JavaScript API

This is used to render the map and display food truck locations as markers.

### Google Places API (New)

This is used to search for food trucks and get more detailed place information.

- `Place.searchByText()` is used to search for food trucks based on location or keyword
- `Place.fetchFields()` is used to load more detailed info when a user opens a truck page

### Data Handling

- The app uses the browser’s Geolocation API to get the user’s location
- That location is used to search for nearby food trucks
- Results are stored in state as typed `FoodTruck` objects
- Truck data is passed through route state when moving to a detail page so it loads faster
- More details are fetched only when needed
- Favorites are saved in `localStorage` so they persist across sessions

---

## Additional Features Implemented

- Save and remove favorite food trucks
- Search for trucks by keyword
- Mobile-friendly responsive layout
- Quick info card when a map marker is clicked
- Image preloading for smoother browsing
- Faster detail page loading through route state

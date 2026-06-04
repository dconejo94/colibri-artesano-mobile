# Colibrí Artesano — Mobile App

Welcome to the mobile frontend for **Colibrí Artesano**, an e-commerce platform bridging local artisans and buyers. This application is designed to allow artisans to easily manage their stores, products, inventory variants, and order fulfillment right from their phones.

This project is built using **React Native**, **Expo**, and **TypeScript**.

---

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and package manager)
- [Expo Go](https://expo.dev/client) app installed on your physical device, OR
- Android Studio Emulator / iOS Simulator installed on your machine.

---

## Getting Started

### 1. Install Dependencies
Clone the repository and install the dependencies using Bun:
```bash
bun install
```

### 2. Environment Configuration
The application needs to communicate with the Colibrí Artesano backend (FastAPI). 
If you are running the backend locally via Docker, the app uses smart defaults to connect to it automatically:
- **Android Emulator**: Defaults to `http://10.0.2.2:8000`
- **iOS Simulator**: Defaults to `http://localhost:8000`

**Testing on a Physical Device:**
If you want to run the app on your physical phone via Expo Go, you **must** connect to the same Wi-Fi network as your computer and create a `.env` file in the root of the project:
```env
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:8000
```
*(Example: `EXPO_PUBLIC_API_URL=http://192.168.1.50:8000`)*

### 3. Start the Application
Run the Expo bundler:
```bash
bun start --clear
```
- Press `a` to open in the Android Emulator.
- Press `i` to open in the iOS Simulator.
- Scan the QR code with the **Expo Go** app to run it on your physical device.

---

## Architecture & File Structure

The project strictly follows a decoupled architectural pattern:

- **`/app`**: Contains the Expo Router file-based navigation (e.g., `_layout.tsx`, `index.tsx`).
- **`/screens`**: Contains the full UI views for the application, completely separated from the routing logic.
- **`/api`**: Centralized Axios client and domain-specific endpoints (`products.ts`, `stores.ts`, `orders.ts`). All backend HTTP requests live here.
- **`/components`**: Reusable UI blocks like buttons, inputs, category pickers, and the hamburger menu.
- **`/types`**: Shared TypeScript interfaces that strictly match the backend PostgreSQL/Pydantic schemas.
- **`/constants`**: Shared stylesheets (`shared-styles.ts`), theme tokens, and hardcoded development constants.

---

## Best Practices Implemented
- **Safe State Updates:** Implemented spread-operator merging `(...prev, ...updated)` across all store screens to safely persist nested relationships even if the backend HTTP `PUT` responses omit them.
- **Strict Error Boundaries:** Removed all silent error swallowing (`catch { /* silent */ }`). Mutations and data fetching now surface real native `Alert.alert` dialogs, and 500/network errors bubble up predictably instead of masking as empty responses.
- **Strict HTTP Method Parity:** Strictly respects the backend OpenAPI specifications (`PUT` vs `PATCH`) and connects to explicit endpoints (e.g. `/api/v1/stores/owner/{ownerId}`).
- **UUID Parity:** All TypeScript interfaces are synchronized with the backend database schemas, supporting UUIDs for primary keys and `string | number` unions for safe decimal currency parsing.
- **Granular Variant Management:** Includes an accessible inline stepper UI to manage nested product variants smoothly.

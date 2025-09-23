# Travion - AI Travel Companion

A modern travel planning application built with React, TypeScript, and Firebase authentication.

## 🚀 Features

- **AI-Powered Travel Planning**: Get personalized trip recommendations
- **Firebase Authentication**: Secure email/password and Google OAuth sign-in
- **Responsive Design**: Beautiful UI that works on all devices
- **Protected Routes**: Authentication-required pages for personalized features
- **Modern UI Components**: Built with Tailwind CSS and Radix UI

## 🔧 Firebase Setup Instructions

**IMPORTANT**: To enable authentication features, you must configure Firebase:

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication in the Firebase console
4. Enable Email/Password and Google sign-in methods

### 2. Update Configuration
Replace the placeholder values in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com", 
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-app-id"
};
```

### 3. Authentication Flow
- **Public**: Home page accessible to all
- **Protected**: Chat, Preferences, Destinations require sign-in
- **Auto-redirect**: Unauthenticated users redirected to sign-in page

## Project info

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript  
- React
- Firebase Authentication
- shadcn-ui
- Tailwind CSS

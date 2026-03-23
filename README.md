# Tonka Router 🚦

Bring the power of your [**Tonka Framework**](https://clicalmani.github.io/tonka) named routes to your JavaScript frontend.

This package allows you to use your backend route definitions to generate URLs in your React or Vue (Inertia JS) application. It works exactly like Laravel's **Ziggy**, ensuring your frontend links never break when you change a route URI.

## ✨ Features

*   🔄 **Synchronization**: Frontend URLs stay in sync with your backend routes.
*   🎯 **Named Routes**: Generate links using route names instead of hardcoded paths.
*   ⚛️ **React Hook**: Includes a `useRoute` hook for seamless integration with React components.
*   🛣️ **Query Parameters**: Automatically appends query strings for parameters not defined in the route URI.
*   📍 **Current Route Detection**: Easily check if the current page matches a specific route name (perfect for active navigation links).

## 📦 Installation

```bash
npm install tonka-router
# or
yarn add tonka-router
```

## ⚙️ Setup

Install backend dependency:

```bash
composer require tonka/spark
```

## 🚀 Usage

### 1. Standard Usage

Import the functions directly to generate URLs anywhere in your application.

```javascript
import { route, current } from 'tonka-router';

// Generate a URL with a parameter
const url = route('users.show', { id: 1 });
// Output: https://yourapp.com/users/1

// Generate a URL with query parameters
const url = route('posts.index', { page: 2, search: 'tonka' });
// Output: https://

// Expose current route parameters
current().parameters; // {page: 2, search: 'tonka'}
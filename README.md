# 🚀 DataShare

A modern, fast, and scalable web application built with React, TypeScript, Vite, and Tailwind CSS.

## 🛠️ Tech Stack

- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **Icons:** Lucide React
- **Linting:** ESLint

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- Node.js (Version 18.x or higher recommended)
- Git

Check your Node version by running:

```bash
node -v
```

## ⚡ Getting Started (Quickstart)

Follow these steps to run the project locally on your machine:

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/DataShare.git
cd DataShare
```

### 2. Install dependencies

This command reads `package.json` and automatically downloads all required libraries into `node_modules`:

```bash
npm install
```

### 3. Start the local development server

```bash
npm run dev
```

### 4. Open in browser

Hold `Ctrl` (or `Cmd` on Mac) and click the URL printed in your terminal, or manually visit:

```
http://localhost:5173/
```

## 📁 Project Structure

```
DataShare/
├── public/                 # Static assets (favicons, public images)
├── src/
│   ├── assets/              # Media assets (SVGs, logos)
│   ├── components/          # Reusable UI components (Buttons, Navbars, etc.)
│   ├── layouts/             # Page templates and wrappers
│   ├── pages/               # Main route views (Home, About, etc.)
│   ├── routes/              # App routing configuration
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # React application entry point
│   └── index.css             # Global stylesheet and Tailwind directives
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
└── package.json              # Project dependencies and npm scripts
```

## 📜 Available Scripts

In the project root directory, you can run:

- `npm run dev` — Runs the app in development mode with Hot Module Replacement (HMR).
- `npm run build` — Compiles and optimizes the code for production into the `dist/` folder.
- `npm run preview` — Locally previews the production build.
- `npm run lint` — Runs ESLint to check for code quality and style errors.

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -m "feat: Add new feature"`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Open a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Share2, Home as HomeIcon, Info } from 'lucide-react';

function Navbar() {
  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center space-x-2">
        <Share2 className="text-blue-500 w-6 h-6" />
        <h1 className="text-xl font-bold tracking-wide">DataShare</h1>
      </div>
      <div className="space-x-6 flex items-center">
        <Link to="/" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
          <HomeIcon className="w-4 h-4" /> Home
        </Link>
        <Link to="/about" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
          <Info className="w-4 h-4" /> About
        </Link>
      </div>
    </nav>
  );
}

function Home() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-3xl font-bold text-slate-800">Welcome to DataShare!</h2>
      <p className="mt-4 text-slate-600 leading-relaxed text-lg">
        Your full stack is now working: <span className="font-semibold text-blue-600">React + TypeScript + Tailwind CSS + Lucide Icons + React Router</span>.
      </p>
      <button className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl shadow hover:bg-blue-700 transition">
        Start Sharing Data
      </button>
    </div>
  );
}

function About() {
  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-3xl font-bold text-slate-800">About DataShare</h2>
      <p className="mt-4 text-slate-600 text-lg">
        This is a multi-page React application running smoothly with client-side routing.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
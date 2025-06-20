import { Link } from "wouter";
import Logo from "@/components/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <Logo size="small" />
        </div>
        <nav className="flex space-x-4 mb-4 md:mb-0">
          <a href="#" className="text-gray-500 hover:text-gray-900">About</a>
          <a href="#" className="text-gray-500 hover:text-gray-900">Terms</a>
          <a href="#" className="text-gray-500 hover:text-gray-900">Privacy</a>
          <a href="#" className="text-gray-500 hover:text-gray-900">Help</a>
        </nav>
        <div className="text-sm text-gray-500">
          © {currentYear} VentureConnect, Inc.
        </div>
      </div>
    </footer>
  );
}

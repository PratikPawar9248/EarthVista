import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import routes from "../../routes";
import { Sparkles, Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigation = routes.filter((route) => route.visible !== false);

  return (
    <header className="bg-gradient-to-r from-primary via-secondary to-accent sticky top-0 z-50 shadow-elegant animate-gradient">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse-glow"></div>
                <Sparkles className="h-8 w-8 text-white relative z-10 animate-float" />
              </div>
              <span className="ml-3 text-2xl font-bold text-white drop-shadow-lg hover-scale">
                GeoHeatmap AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 overflow-x-auto">
            {navigation.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover-scale whitespace-nowrap ${location.pathname === item.path
                    ? "bg-white text-primary shadow-lg"
                    : "text-white hover:bg-white/20 backdrop-blur-sm"
                  }`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {item.name}
              </Link>
            ))}

            {/* Smart Dashboard External Link */}
            <a
              href="https://isro-smart-dashboard.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover-scale text-white hover:bg-white/20 backdrop-blur-sm whitespace-nowrap"
              style={{
                animationDelay: `${navigation.length * 0.1}s`,
              }}
            >
              Smart Dashboard
            </a>

            {/* JNEXA AI External Link */}
            <a
              href="https://veda-wise-mind.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover-scale text-white hover:bg-white/20 backdrop-blur-sm whitespace-nowrap"
              style={{
                animationDelay: `${(navigation.length + 1) * 0.1}s`,
              }}
            >
              JNEXA AI
            </a>

            {/* 2D/3D Plots External Link */}
            <a
              href="https://ocean-explorer-pro.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover-scale text-white hover:bg-white/20 backdrop-blur-sm whitespace-nowrap bg-orange-500"
              style={{
                animationDelay: `${(navigation.length + 2) * 0.1}s`,
              }}
            >
              🌊 2D/3D Plots
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/20 transition-all"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-2 text-base font-medium rounded-lg transition-all ${location.pathname === item.path
                    ? "bg-white text-primary shadow-lg"
                    : "text-white hover:bg-white/20"
                  }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Smart Dashboard External Link - Mobile */}
            <a
              href="https://isro-smart-dashboard.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-base font-medium rounded-lg transition-all text-white hover:bg-white/20"
              onClick={() => setIsMenuOpen(false)}
            >
              Smart Dashboard
            </a>

            {/* JNEXA AI External Link - Mobile */}
            <a
              href="https://veda-wise-mind.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-base font-medium rounded-lg transition-all text-white hover:bg-white/20"
              onClick={() => setIsMenuOpen(false)}
            >
              JNEXA AI
            </a>

            {/* 2D/3D Plots External Link - Mobile */}
            <a
              href="https://ocean-explorer-pro.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2 text-base font-medium rounded-lg transition-all text-white hover:bg-white/20 bg-orange-500"
              onClick={() => setIsMenuOpen(false)}
            >
              🌊 2D/3D Plots
            </a>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Users, FileImage, Github, MessageCircle, Menu, X, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explorer', label: 'Explorer', icon: Activity },
  { href: '/about', label: 'About', icon: Info },
  { href: '/volunteer', label: 'Become a Validator', icon: Users },
  { href: '/gallery', label: 'Gallery', icon: FileImage },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-24 items-center justify-between">
          <div className="flex gap-6">
            {/* Logo Section */}
            <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
              <Image
                src="/logo.png"
                alt="BetterGov"
                height={64}
                width={200}
              />
            </Link>

            {/* Desktop Navigation Links */}
            <ul className="hidden md:flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium
                      ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }
                    `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://discord.gg/bettergovph"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Join us on Discord</span>
              </Button>
            </a>
            <a
              href="https://github.com/bettergovph/govchain"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                <span className="hidden lg:inline">Contribute on GitHub</span>
              </Button>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Links */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-base font-medium w-full
                      ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Social Links */}
              <div className="pt-4 border-t space-y-2">
                <a
                  href="https://discord.gg/bettergovph"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors w-full"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Join us on Discord</span>
                </a>
                <a
                  href="https://github.com/bettergovph/govchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-3 py-3 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors w-full"
                >
                  <Github className="h-5 w-5" />
                  <span>Contribute on GitHub</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

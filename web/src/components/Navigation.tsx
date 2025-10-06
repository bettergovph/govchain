'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Info, Users, FileImage, Github, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/volunteer', label: 'Become a Validator', icon: Users },
  { href: '/gallery', label: 'Gallery', icon: FileImage },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-24 items-center gap-8">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="BetterGov" 
              height={48}
              width={160}
            />           
          </Link>

          {/* Navigation Links */}
          <ul className="flex items-center gap-4">
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
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Side Actions */}
          <div className="ml-auto flex items-center gap-3">
            <a 
              href="https://discord.gg/bettergovph" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Join us on Discord</span>
              </Button>
            </a>
            <a 
              href="https://github.com/bettergovph/govchain" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Contribute on GitHub</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

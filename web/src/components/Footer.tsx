import Link from 'next/link';
import { Home, Info, Users, FileImage, Github, MessageCircle } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/about', label: 'About', icon: Info },
  { href: '/volunteer', label: 'Become a Validator', icon: Users },
  { href: '/gallery', label: 'Gallery', icon: FileImage },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="GovChain Logo" 
                className="rounded-lg h-12"
              />
              <h3 className="text-lg font-bold">GovChain</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              BetterGov.ph is an open-source #civictech movement that aims to provide citizen-driven innovation by building sites and apps to promote good design, usability, accessibility, and data transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Licensed under</span>
              <a 
                href="https://creativecommons.org/publicdomain/zero/1.0/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                CC0 1.0 Universal
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://discord.gg/bettergovph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/bettergovph/govchain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Built with ❤️ for democratic accountability in the digital age</p>
          <p className="mt-2">© {new Date().getFullYear()} BetterGov.ph. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import { Github, HelpCircleIcon, MessageCircle, User2Icon } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/whitepaper', label: 'Whitepaper' },
  { href: '/standards/ocds', label: 'Procurement (OCDS)' },
  { href: '/standards/oc4ids', label: 'Infrastructure (OC4IDS)' },
  { href: '/about', label: 'About OpenGovChain' },
];

const developerItems = [
  { href: '/developer-guide', label: 'Developer Guide' },
  { href: '/standards/ocds', label: 'Procurement (OCDS)' },
  { href: '/standards/oc4ids', label: 'Infrastructure (OC4IDS)' },
  { href: '/api-docs', label: 'Data Schema' },
  { href: 'https://github.com/bettergovph/govchain/issues', label: 'Report Issues'}
];

const resourceItems = [
  { href: '/api-docs', label: 'API Reference' },
  { href: '/datasets', label: 'Dataset Portal' },
  { href: '/explorer', label: 'Blockchain Explorer' },
  { href: '/volunteer', label: 'Run a Validator' }
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* About Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="OpenGovChain Logo"
                className="rounded-lg h-12"
              />
              <h3 className="text-lg font-bold">OpenGovChain</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              BetterGov.ph is an open-source #civictech movement that aims to provide citizen-driven innovation by building sites and apps to promote good design, usability, accessibility, and data transparency.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>MIT License</span>
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

          {/* Developer Links */}
          <div>
            <h4 className="font-semibold mb-4">Developers</h4>
            <ul className="space-y-2">
              {developerItems.map((item) => (
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

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceItems.map((item) => (
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
                  <User2Icon className="h-4 w-4" />
                  Become a Volunteer
                </a>
              </li>
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
               <li>
                <a
                  href="https://about.bettergov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <HelpCircleIcon className="h-4 w-4" />
                  About BetterGov.ph
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Built with ❤️ for democratic accountability in the digital age</p>
          <p className="mt-2">{new Date().getFullYear()} BetterGov.ph.</p>
        </div>
      </div>
    </footer>
  );
}

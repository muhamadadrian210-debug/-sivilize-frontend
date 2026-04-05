import type { ComponentType } from 'react';
import { useStore } from '../../store/useStore';
import { 
  ShieldCheck, 
  FileText, 
  Users, 
  Mail, 
  ExternalLink,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

type FooterTabLink = {
  label: string;
  tab: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

type FooterExternalLink = {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

type FooterLink = FooterTabLink | FooterExternalLink;

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const Footer = () => {
  const { setActiveTab } = useStore();
  const currentYear = new Date().getFullYear();

  const footerLinks: FooterSection[] = [
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', tab: 'privacy-policy', icon: ShieldCheck },
        { label: 'Terms of Service', tab: 'terms-of-service', icon: FileText },
      ]
    },
    {
      title: 'Perusahaan',
      links: [
        { label: 'Tentang Kami', tab: 'about', icon: Users },
        { label: 'Kontak', tab: 'contact', icon: Mail },
      ]
    },
    {
      title: 'Social',
      links: [
        { label: 'Twitter', href: '#', icon: Twitter },
        { label: 'LinkedIn', href: '#', icon: Linkedin },
        { label: 'GitHub', href: '#', icon: Github },
      ]
    }
  ];

  return (
    <footer className="bg-card/50 backdrop-blur-md border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                Sivilize Hub Pro
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Platform teknik sipil tercanggih untuk perhitungan RAB, manajemen proyek, dan analisis AHSP berbasis AI.
            </p>
          </div>

          {/* Links Sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-bold mb-6">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {'tab' in link ? (
                      <button
                        onClick={() => setActiveTab(link.tab)}
                        className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                      >
                        <link.icon size={14} className="group-hover:scale-110 transition-transform" />
                        {link.label}
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="text-text-secondary hover:text-primary transition-colors text-sm flex items-center gap-2 group"
                      >
                        <link.icon size={14} className="group-hover:scale-110 transition-transform" />
                        {link.label}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            © {currentYear} Sivilize Hub Pro. All rights reserved. Dilindungi oleh undang-undang.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-text-secondary px-3 py-1 rounded-full bg-border/50 border border-border">
              v1.0.2 Stable
            </span>
            <span className="text-xs text-text-secondary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              System Online
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

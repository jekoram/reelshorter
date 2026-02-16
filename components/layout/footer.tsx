import { SiInstagram, SiYoutube, SiX, SiFacebook, SiTiktok } from "react-icons/si"

const NAV_LINKS = ["How It Works", "Pricing", "FAQ", "Contact"]

const SOCIAL_ICONS = [
  { Icon: SiInstagram, label: "Instagram" },
  { Icon: SiYoutube, label: "YouTube" },
  { Icon: SiX, label: "X" },
  { Icon: SiFacebook, label: "Facebook" },
  { Icon: SiTiktok, label: "TikTok" },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 pt-6 pb-8 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <nav className="flex gap-6">
        {NAV_LINKS.map((link) => (
          <span
            key={link}
            className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            {link}
          </span>
        ))}
      </nav>

      <div className="flex gap-3">
        {SOCIAL_ICONS.map(({ Icon, label }) => (
          <a
            key={label}
            href="#"
            aria-label={label}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Icon className="w-5 h-5" />
          </a>
        ))}
      </div>
    </footer>
  )
}

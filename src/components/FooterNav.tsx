import logo from "@/assets/logo.png";
import instagramIcon from "@/assets/icon-instagram.png";
import telegramIcon from "@/assets/icon-telegram.png";
import youtubeIcon from "@/assets/icon-youtube.png";

const socialLinks = [
  {
    name: "Instagram",
    icon: instagramIcon,
    href: "https://www.onliner.by/",
    ariaLabel: "Перейти в наш Instagram",
  },
  {
    name: "Telegram",
    icon: telegramIcon,
    href: "https://www.onliner.by/",
    ariaLabel: "Перейти в наш Telegram",
  },
  {
    name: "YouTube",
    icon: youtubeIcon,
    href: "https://www.onliner.by/",
    ariaLabel: "Перейти на наш YouTube канал",
  },
];

const FooterNav = () => {
  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <footer className="mt-8 pb-8">
      <div className="px-4">
        <div className="border-t mb-8" style={{ borderColor: "#363546" }} />
      </div>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleLogoClick}
          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-md hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Обновить страницу"
          type="button"
        >
          <img src={logo} alt="Fantasy Sports" className="h-8" />
        </button>
      </div>

      <div className="flex justify-center gap-6">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            className="hover:opacity-80 transition-opacity"
          >
            <img src={social.icon} alt={social.name} className="w-10 h-10" />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default FooterNav;

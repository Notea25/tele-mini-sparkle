// import { Instagram, Send, Youtube } from "lucide-react";
// import logo from "@/assets/logo.png";

// const FooterNav = () => {
//   return (
//     <footer className="mt-8 pb-8 px-4">
//       <div className="flex justify-center mb-8">
//         <img src={logo} alt="Fantasy Sports" className="h-8" />
//       </div>

//       <div className="flex justify-center gap-6">
//         <button className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center">
//           <Instagram className="w-6 h-6 text-foreground" />
//         </button>
//         <button className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center">
//           <Send className="w-6 h-6 text-foreground" />
//         </button>
//         <button className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center">
//           <Youtube className="w-6 h-6 text-foreground" />
//         </button>
//       </div>
//     </footer>
//   );
// };

// export default FooterNav;
import { Instagram, Send, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

const socialLinks = [
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.onliner.by/",
    ariaLabel: "Перейти в наш Instagram",
  },
  {
    name: "Telegram",
    icon: Send,
    href: "https://www.onliner.by/",
    ariaLabel: "Перейти в наш Telegram",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://www.onliner.by/",
    ariaLabel: "Перейти на наш YouTube канал",
  },
];

// const FooterNav = () => {
//   return (
//     <footer className="mt-8 pb-8 px-4 border-t" style={{ borderColor: "#363546" }}>
//       <div className="flex justify-center mb-8 pt-8">
//         <img src={logo} alt="Fantasy Sports" className="h-8" />
//       </div>

//       <div className="flex justify-center gap-6">
//         {socialLinks.map((social) => (
//           <a
//             key={social.name}
//             href={social.href}
//             target="_blank"
//             rel="noopener noreferrer"
//             aria-label={social.ariaLabel}
//             className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center"
//           >
//             <social.icon className="w-6 h-6 text-foreground" />
//           </a>
//         ))}
//       </div>
//     </footer>
//   );
// };
const FooterNav = () => {
  return (
    <footer className="mt-8 pb-8">
      {/* Граница с горизонтальными паддингами */}
      <div className="px-4">
        <div className="border-t mb-8" style={{ borderColor: "#363546" }} />
      </div>

      <div className="flex justify-center mb-8">
        <img src={logo} alt="Fantasy Sports" className="h-8" />
      </div>

      <div className="flex justify-center gap-6">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            className="w-14 h-14 rounded-full bg-secondary/80 border border-muted-foreground/30 hover:bg-secondary transition-colors flex items-center justify-center"
          >
            <social.icon className="w-6 h-6 text-foreground" />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default FooterNav;

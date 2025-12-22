// import { useState, useEffect, useCallback } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import SportHeader from "@/components/SportHeader";
// import PromoBanner from "@/components/PromoBanner";
// import SearchBar from "@/components/SearchBar";
// import CategoryFilter, { categories } from "@/components/CategoryFilter";
// import SportCard from "@/components/SportCard";
// import FooterNav from "@/components/FooterNav";
// import LeagueInviteModal from "@/components/LeagueInviteModal";
// import { ChevronDown } from "lucide-react";
// import { toast } from "sonner";
// import leagueLogo from "@/assets/league-logo.png";
// import iconFootball from "@/assets/icon-football.png";
// import iconBasketball from "@/assets/icon-basketball.png";
// import iconHockey from "@/assets/icon-hockey.png";
// import iconCs2 from "@/assets/icon-cs2.png";
// import championsLeagueLogo from "@/assets/champions-league-logo-white.png";
// import europaLeagueLogo from "@/assets/europa-league-logo.png";
// import vtbLeagueLogo from "@/assets/vtb-league-logo.png";
// import nbaLogo from "@/assets/nba-logo.png";
// import khlLogo from "@/assets/khl-logo.png";
// import nhlLogo from "@/assets/nhl-logo.png";
// import pglLogo from "@/assets/pgl-logo.png";
// import fastcupLogo from "@/assets/fastcup-logo.png";
// import eslLogo from "@/assets/esl-logo.png";
// import extraligaLogo from "@/assets/extraliga-logo.png";
// import rplLogo from "@/assets/rpl-logo.png";
// import aplLogo from "@/assets/apl-logo.png";
// import beteraBasketballLogo from "@/assets/betera-basketball-logo.png";
// import { Card } from "@/components/ui/card";
// const PROFILE_STORAGE_KEY = "fantasyUserProfile";
// const TEAM_PLAYERS_KEY = "fantasyTeamPlayers";
// const FAVORITES_STORAGE_KEY = "fantasyFavoriteLeagues";

// const Index = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [selectedSort, setSelectedSort] = useState("Сначала ТОП-лиги");
//   const [showLeagueInvite, setShowLeagueInvite] = useState(false);
//   const [leagueInviteData, setLeagueInviteData] = useState<{
//     leagueId: string;
//     leagueName: string;
//     inviter: string;
//   } | null>(null);
//   const [hasTeam, setHasTeam] = useState(false);
//   const [activeCategory, setActiveCategory] = useState("all");
//   const [favorites, setFavorites] = useState<string[]>([]);

//   // Load favorites from localStorage
//   useEffect(() => {
//     const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
//     if (storedFavorites) {
//       try {
//         setFavorites(JSON.parse(storedFavorites));
//       } catch {
//         setFavorites([]);
//       }
//     }
//   }, []);

//   const toggleFavorite = useCallback((leagueId: string) => {
//     setFavorites((prev) => {
//       const newFavorites = prev.includes(leagueId) ? prev.filter((id) => id !== leagueId) : [...prev, leagueId];
//       localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
//       return newFavorites;
//     });
//   }, []);

//   // Scroll detection for active category
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollY = window.scrollY;
//       const headerOffset = 200; // Account for header height

//       // Check sections from bottom to top to find the first visible one
//       const sectionsToCheck = categories.filter((c) => c.scrollTo).reverse();

//       for (const category of sectionsToCheck) {
//         if (category.scrollTo) {
//           const element = document.getElementById(category.scrollTo);
//           if (element) {
//             const rect = element.getBoundingClientRect();
//             const elementTop = rect.top + scrollY - headerOffset;

//             if (scrollY >= elementTop) {
//               setActiveCategory(category.id);
//               return;
//             }
//           }
//         }
//       }

//       // If we're at the top, set to "all"
//       setActiveCategory("all");
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Check if user has a team
//   useEffect(() => {
//     const teamPlayers = localStorage.getItem(TEAM_PLAYERS_KEY);
//     if (teamPlayers) {
//       try {
//         const parsed = JSON.parse(teamPlayers);
//         setHasTeam(Array.isArray(parsed) && parsed.length > 0);
//       } catch {
//         setHasTeam(false);
//       }
//     }
//   }, []);

//   // Check for league invite
//   useEffect(() => {
//     const storedInvite = localStorage.getItem("fantasyLeagueInvite");
//     if (storedInvite) {
//       try {
//         const invite = JSON.parse(storedInvite);
//         setLeagueInviteData(invite);
//         setShowLeagueInvite(true);
//         // Clear the stored invite
//         localStorage.removeItem("fantasyLeagueInvite");
//       } catch {
//         // Invalid data
//       }
//     }
//   }, []);

//   // Check if this is a referral link and user is already registered
//   useEffect(() => {
//     const refParam = searchParams.get("ref");
//     if (refParam) {
//       // Check if user is already registered
//       const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
//       if (profileData) {
//         try {
//           const profile = JSON.parse(profileData);
//           if (profile.userName && profile.birthDate) {
//             // User is registered, redirect to /create-team
//             navigate("/create-team", { replace: true });
//           }
//         } catch {
//           // Invalid profile data, continue normally
//         }
//       }
//     }
//   }, [searchParams, navigate]);

//   const handleSelect = (option: string) => {
//     setSelectedSort(option);
//     setIsDropdownOpen(false);
//   };

//   const handleJoinLeague = () => {
//     if (leagueInviteData) {
//       // Add user to league
//       const userLeagues = JSON.parse(localStorage.getItem("userJoinedLeagues") || "[]");
//       if (!userLeagues.find((l: { id: string }) => l.id === leagueInviteData.leagueId)) {
//         userLeagues.push({
//           id: leagueInviteData.leagueId,
//           name: leagueInviteData.leagueName,
//           joinedAt: new Date().toISOString(),
//         });
//         localStorage.setItem("userJoinedLeagues", JSON.stringify(userLeagues));
//       }
//       toast.success(`Вы вступили в лигу "${leagueInviteData.leagueName}"`);
//       navigate("/league");
//     }
//   };

//   const handleCategoryClick = useCallback((categoryId: string) => {
//     setActiveCategory(categoryId);
//   }, []);

//   const sortOptions = ["Избранные", "ТОП-лиги", "От А до Я", "От Я до А"];

//   // Define all leagues data for sorting
//   const allLeagues = [
//     {
//       id: "football-belarus",
//       title: "Футбол",
//       section: "section-football",
//       iconImage: iconFootball,
//       leagueIcon: leagueLogo,
//       league: "Беларусь",
//       participants: 26130,
//       date: "04.04",
//       time: "19.00",
//       glowColor: "120 85% 55%",
//       href: "/create-team",
//       comingSoon: false,
//     },
//     {
//       id: "basketball",
//       title: "Баскетбол",
//       section: "section-basketball",
//       iconImage: iconBasketball,
//       glowColor: "35 85% 55%",
//       comingSoon: true,
//       comingSoonYear: "2026",
//       hideCard: true,
//     },
//     {
//       id: "hockey",
//       title: "Хоккей",
//       section: "section-hockey",
//       iconImage: iconHockey,
//       glowColor: "200 85% 55%",
//       comingSoon: true,
//       comingSoonYear: "2028",
//       hideCard: true,
//     },
//     {
//       id: "cs2",
//       title: "Counter-Strike 2",
//       section: "section-cs2",
//       iconImage: iconCs2,
//       glowColor: "0 85% 55%",
//       comingSoon: true,
//       comingSoonYear: "2029",
//       hideCard: true,
//     },
//   ];

//   // Sort leagues based on selected option
//   const getSortedLeagues = () => {
//     const leagues = [...allLeagues];

//     switch (selectedSort) {
//       case "Избранные":
//         return leagues.sort((a, b) => {
//           const aFav = favorites.includes(a.id) ? 1 : 0;
//           const bFav = favorites.includes(b.id) ? 1 : 0;
//           return bFav - aFav;
//         });
//       case "От А до Я":
//         return leagues.sort((a, b) => a.league?.localeCompare(b.league || a.title) || a.title.localeCompare(b.title));
//       case "От Я до А":
//         return leagues.sort((a, b) => b.league?.localeCompare(a.league || b.title) || b.title.localeCompare(a.title));
//       default:
//         return leagues;
//     }
//   };

//   const sortedLeagues = getSortedLeagues();

//   return (
//     <div className="min-h-screen bg-background">
//       <SportHeader />
//       <PromoBanner />

//       <div className="px-4 mt-6">
//         <h2
//           className="text-foreground text-[28px] font-normal leading-[130%] tracking-normal mb-4"
//           style={{ fontFamily: "Unbounded, sans-serif" }}
//         >
//           Чемпионаты
//         </h2>
//       </div>

//       <SearchBar />

//       <div className="px-4 mt-4">
//         <div className="relative">
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="flex items-center justify-between w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
//             style={{
//               height: "40px",
//               backgroundColor: "#1A1924",
//               borderColor: isDropdownOpen ? "rgba(255, 255, 255, 0.2)" : "#2D2B3E",
//             }}
//           >
//             <span
//               className="font-medium text-[12px]"
//               style={{
//                 color: isDropdownOpen ? "#FFFFFF" : "#4B485F",
//               }}
//             >
//               {selectedSort}
//             </span>
//             <ChevronDown
//               className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//               style={{
//                 color: isDropdownOpen ? "#FFFFFF" : "#4B485F",
//               }}
//             />
//           </button>

//           {isDropdownOpen && (
//             <>
//               <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

//               <div
//                 className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50"
//                 style={{
//                   backgroundColor: "#1A1924",
//                   borderColor: "rgba(255, 255, 255, 0.2)",
//                 }}
//               >
//                 {sortOptions.map((option) => (
//                   <button
//                     key={option}
//                     onClick={() => handleSelect(option)}
//                     className={`w-full px-4 py-3 text-left transition-colors hover:bg-accent/10 ${
//                       selectedSort === option ? "font-medium" : ""
//                     } ${option !== sortOptions[sortOptions.length - 1] ? "border-b border-border" : ""}`}
//                     style={{
//                       fontSize: "14px",
//                       color: "#FFFFFF",
//                       borderBottomColor: "rgba(255, 255, 255, 0.1)",
//                     }}
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       <CategoryFilter activeCategory={activeCategory} onCategoryClick={handleCategoryClick} />

//       <div className="mt-6">
//         {sortedLeagues.map((leagueData) => (
//           <div key={leagueData.id} id={leagueData.section}>
//             {leagueData.hideCard ? (
//               // Only show header for items with hideCard
//               <div className="px-4 mb-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <img src={leagueData.iconImage} alt={leagueData.title} className="w-7 h-7 object-contain" />
//                   <h3 className="text-foreground text-lg font-bold">{leagueData.title}</h3>
//                 </div>
//               </div>
//             ) : (
//               <SportCard
//                 title={leagueData.title}
//                 iconImage={leagueData.iconImage}
//                 leagueIcon={leagueData.leagueIcon}
//                 league={leagueData.league}
//                 participants={leagueData.participants}
//                 userRank={leagueData.id === "football-belarus" && hasTeam ? 21953 : undefined}
//                 date={leagueData.date}
//                 time={leagueData.time}
//                 glowColor={leagueData.glowColor}
//                 href={leagueData.href}
//                 comingSoon={leagueData.comingSoon}
//                 comingSoonYear={leagueData.comingSoonYear}
//                 leagueId={leagueData.id}
//                 isFavorite={favorites.includes(leagueData.id)}
//                 onToggleFavorite={toggleFavorite}
//                 hasTeam={leagueData.id === "football-belarus" && hasTeam}
//               />
//             )}

//             {/* UEFA Leagues Coming Soon - shown after Football Belarus */}
//             {leagueData.id === "football-belarus" && (
//               <div className="px-4 mb-4">
//                 <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
//                   {/* Blurred league cards container */}
//                   <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[180px]">
//                     {/* Blurred league cards - stacked like Belarus card */}
//                     <div className="opacity-25 blur-[4px] flex flex-col gap-6">
//                       {/* Champions League card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={championsLeagueLogo} alt="Champions League" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">Лига Чемпионов</h4>
//                           <p className="text-white/50 text-sm">54 230 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">17.09 в 22.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* Europa League card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={europaLeagueLogo} alt="Europa League" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">Лига Европы</h4>
//                           <p className="text-white/50 text-sm">32 450 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">17.09 в 19.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* RPL card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={rplLogo} alt="RPL" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">РПЛ</h4>
//                           <p className="text-white/50 text-sm">41 890 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">01.08 в 18.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* APL card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={aplLogo} alt="APL" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">АПЛ</h4>
//                           <p className="text-white/50 text-sm">67 320 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">16.08 в 15.00</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Overlay text */}
//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <p className="text-foreground text-xl font-bold font-unbounded mb-2">Скоро запустим</p>
//                       <p className="text-primary text-lg font-black">2027</p>
//                     </div>
//                   </div>
//                 </Card>
//               </div>
//             )}

//             {/* Basketball Leagues Coming Soon - shown after Basketball */}
//             {leagueData.id === "basketball" && (
//               <div className="px-4 mb-4">
//                 <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
//                   {/* Blurred league cards container */}
//                   <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[180px]">
//                     {/* Blurred league cards - stacked like Belarus card */}
//                     <div className="opacity-25 blur-[4px] flex flex-col gap-6">
//                       {/* VTB League card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={vtbLeagueLogo} alt="VTB League" className="w-16 h-16 object-contain rounded-full" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">Лига ВТБ</h4>
//                           <p className="text-white/50 text-sm">18 340 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">15.10 в 20.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* NBA card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={nbaLogo} alt="NBA" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">НБА</h4>
//                           <p className="text-white/50 text-sm">45 120 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">22.10 в 03.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* BETERA Championship card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={beteraBasketballLogo} alt="BETERA" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">BETERA-Чемпионат</h4>
//                           <p className="text-white/50 text-sm">12 580 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">01.11 в 19.00</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Overlay text */}
//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <p className="text-foreground text-xl font-bold font-unbounded mb-2">Скоро запустим</p>
//                       <p className="text-primary text-lg font-black">2026</p>
//                     </div>
//                   </div>
//                 </Card>
//               </div>
//             )}

//             {/* Hockey Leagues Coming Soon - shown after Hockey */}
//             {leagueData.id === "hockey" && (
//               <div className="px-4 mb-4">
//                 <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
//                   {/* Blurred league cards container */}
//                   <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[180px]">
//                     {/* Blurred league cards - stacked like Belarus card */}
//                     <div className="opacity-25 blur-[4px] flex flex-col gap-6">
//                       {/* Extraliga card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={extraligaLogo} alt="Extraliga" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">Экстралига</h4>
//                           <p className="text-white/50 text-sm">8 450 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">25.08 в 18.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* KHL card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={khlLogo} alt="KHL" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">КХЛ</h4>
//                           <p className="text-white/50 text-sm">21 890 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">01.09 в 19.30</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* NHL card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={nhlLogo} alt="NHL" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">НХЛ</h4>
//                           <p className="text-white/50 text-sm">38 760 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">10.10 в 03.00</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Overlay text */}
//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <p className="text-foreground text-xl font-bold font-unbounded mb-2">Скоро запустим</p>
//                       <p className="text-primary text-lg font-black">2028</p>
//                     </div>
//                   </div>
//                 </Card>
//               </div>
//             )}

//             {/* CS2 Leagues Coming Soon - shown after CS2 */}
//             {leagueData.id === "cs2" && (
//               <div className="px-4 mb-4">
//                 <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50">
//                   {/* Blurred league cards container */}
//                   <div className="relative py-5 px-4 flex flex-col gap-4 min-h-[220px]">
//                     {/* Blurred league cards */}
//                     <div className="opacity-25 blur-[4px] flex flex-col gap-5">
//                       {/* PGL card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={pglLogo} alt="PGL" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">PGL</h4>
//                           <p className="text-white/50 text-sm">15 420 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">05.03 в 18.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* FASTCUP card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={fastcupLogo} alt="FASTCUP" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">FASTCUP</h4>
//                           <p className="text-white/50 text-sm">28 910 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">12.03 в 21.00</span>
//                           </p>
//                         </div>
//                       </div>

//                       {/* ESL card */}
//                       <div className="flex items-center gap-4">
//                         <div className="w-16 h-16 rounded-full flex items-center justify-center">
//                           <img src={eslLogo} alt="ESL" className="w-16 h-16 object-contain" />
//                         </div>
//                         <div className="blur-[1px]">
//                           <h4 className="text-white/70 font-bold text-lg">ESL</h4>
//                           <p className="text-white/50 text-sm">42 650 участников</p>
//                           <p className="text-sm">
//                             <span className="text-white/50">Дедлайн: </span>
//                             <span className="text-white/60">20.03 в 20.00</span>
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Overlay text */}
//                     <div className="absolute inset-0 flex flex-col items-center justify-center">
//                       <p className="text-foreground text-xl font-bold font-unbounded mb-2">Скоро запустим</p>
//                       <p className="text-primary text-lg font-black">2029</p>
//                     </div>
//                   </div>
//                 </Card>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>

//       <FooterNav />

//       {/* League Invite Modal */}
//       {leagueInviteData && (
//         <LeagueInviteModal
//           open={showLeagueInvite}
//           onOpenChange={setShowLeagueInvite}
//           leagueName={leagueInviteData.leagueName}
//           inviterName={leagueInviteData.inviter}
//           hasTeam={hasTeam}
//           onJoin={handleJoinLeague}
//         />
//       )}
//     </div>
//   );
// };

// export default Index;
import footballFieldNew from "@/assets/football-field-new.png";
import playerJerseyNew from "@/assets/player-jersey-new.png";
import jerseyDinamoMinsk from "@/assets/jersey-dinamo-minsk.png";
import jerseyBate from "@/assets/jersey-bate.png";
import jerseyBateGk from "@/assets/jersey-bate-gk.png";
import jerseyDinamoBrest from "@/assets/jersey-dinamo-brest.png";
import jerseyMlVitebsk from "@/assets/jersey-ml-vitebsk.png";
import jerseyMlVitebskGk from "@/assets/jersey-ml-vitebsk-gk.png";
import jerseySlavia from "@/assets/jersey-slaviya.png";
import jerseySlaviaGk from "@/assets/jersey-slaviya-gk-new.png";
import jerseyNeman from "@/assets/jersey-neman.png";
import jerseyMinsk from "@/assets/jersey-minsk.png";
import jerseyTorpedo from "@/assets/jersey-torpedo.png";
import jerseyVitebsk from "@/assets/jersey-vitebsk.png";
import jerseyVitebskGk from "@/assets/jersey-vitebsk-gk.png";
import jerseyArsenalGk from "@/assets/jersey-arsenal-gk.png";
import captainBadge from "@/assets/captain-badge.png";
import viceCaptainBadge from "@/assets/vice-captain-badge.png";
import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";

// Helper function to get jersey based on team and position
const getJerseyForTeam = (team: string, position?: string) => {
  switch (team) {
    case "Динамо-Минск":
      return jerseyDinamoMinsk;
    case "БАТЭ":
      return position === "ВР" ? jerseyBateGk : jerseyBate;
    case "Динамо-Брест":
      return jerseyDinamoBrest;
    case "МЛ Витебск":
      return position === "ВР" ? jerseyMlVitebskGk : jerseyMlVitebsk;
    case "Славия-Мозырь":
      return position === "ВР" ? jerseySlaviaGk : jerseySlavia;
    case "Арсенал":
      return position === "ВР" ? jerseyArsenalGk : playerJerseyNew;
    case "Неман":
      return jerseyNeman;
    case "Минск":
      return jerseyMinsk;
    case "Торпедо-БелАЗ":
      return jerseyTorpedo;
    case "Витебск":
      return position === "ВР" ? jerseyVitebskGk : jerseyVitebsk;
    default:
      return playerJerseyNew;
  }
};

interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  price?: number;
  slotIndex?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

interface FormationPosition {
  position: string;
  row: number;
  col: number;
}

interface FormationFieldProps {
  selectedPlayers?: PlayerData[];
  onRemovePlayer?: (playerId: number) => void;
  onPlayerClick?: (player: PlayerData) => void;
  onEmptySlotClick?: (position: string) => void;
  captain?: number | null;
  viceCaptain?: number | null;
  showCaptainBadges?: boolean;
}

const FormationField = ({
  selectedPlayers = [],
  onRemovePlayer,
  onPlayerClick,
  onEmptySlotClick,
  captain,
  viceCaptain,
  showCaptainBadges = true,
}: FormationFieldProps) => {
  // Formation: 2 ВР (goalkeepers), 5 ЗЩ (defenders), 5 ПЗ (midfielders), 3 НП (forwards)
  const formation: FormationPosition[] = [
    // Row 1 - Goalkeepers (top)
    { position: "ВР", row: 1, col: 1 },
    { position: "ВР", row: 1, col: 2 },
    // Row 2 - Defenders
    { position: "ЗЩ", row: 2, col: 1 },
    { position: "ЗЩ", row: 2, col: 2 },
    { position: "ЗЩ", row: 2, col: 3 },
    { position: "ЗЩ", row: 2, col: 4 },
    { position: "ЗЩ", row: 2, col: 5 },
    // Row 3 - Midfielders
    { position: "ПЗ", row: 3, col: 1 },
    { position: "ПЗ", row: 3, col: 2 },
    { position: "ПЗ", row: 3, col: 3 },
    { position: "ПЗ", row: 3, col: 4 },
    { position: "ПЗ", row: 3, col: 5 },
    // Row 4 - Forwards (bottom)
    { position: "НП", row: 4, col: 1 },
    { position: "НП", row: 4, col: 2 },
    { position: "НП", row: 4, col: 3 },
  ];

  const truncateName = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  // Get assigned player for a formation slot
  const getAssignedPlayer = (formationPos: FormationPosition) => {
    // Find the slot index within the position
    const slotsForPosition = formation.filter((f) => f.position === formationPos.position);
    const slotPositionIndex = slotsForPosition.findIndex(
      (s) => s.row === formationPos.row && s.col === formationPos.col,
    );

    // Find player assigned to this specific slot
    return selectedPlayers.find((p) => p.position === formationPos.position && p.slotIndex === slotPositionIndex);
  };

  // Group players by row
  const rows = {
    1: formation.filter((slot) => slot.row === 1),
    2: formation.filter((slot) => slot.row === 2),
    3: formation.filter((slot) => slot.row === 3),
    4: formation.filter((slot) => slot.row === 4),
  };

  // Состояние для определения размера экрана
  const [cardSize, setCardSize] = useState({ width: 64, height: 82 });

  useEffect(() => {
    const updateCardSize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth >= 1024) {
        // Десктоп
        // В 2 раза больше мобильного (64 × 2 = 128)
        setCardSize({ width: 128, height: 164 }); // +100% от мобильного
      } else if (screenWidth >= 768) {
        // Планшет
        // В 1.5 раза больше мобильного (64 × 1.5 = 96)
        setCardSize({ width: 96, height: 123 }); // +50% от мобильного
      } else {
        // Мобильный (не меняем - идеально)
        setCardSize({ width: 64, height: 82 });
      }
    };

    // Устанавливаем начальный размер
    updateCardSize();

    // Добавляем слушатель изменения размера
    window.addEventListener("resize", updateCardSize);

    return () => window.removeEventListener("resize", updateCardSize);
  }, []);

  // Компонент карточки игрока
  const PlayerCardComponent = ({
    player,
    showRemoveButton = true,
  }: {
    player: PlayerData;
    showRemoveButton?: boolean;
  }) => (
    <div
      className="relative flex flex-col cursor-pointer border border-white/60 rounded-md overflow-hidden bg-[#3a5a28]/40 backdrop-blur-[2px]"
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
      }}
      onClick={() => onPlayerClick?.(player)}
    >
      {/* Captain/Vice-Captain badge */}
      {showCaptainBadges && captain === player.id && (
        <img
          src={captainBadge}
          alt="C"
          className="absolute top-2 left-2 z-50"
          style={{
            width: `${cardSize.width * 0.18}px`, // 18% от ширины карточки
            height: `${cardSize.width * 0.18}px`,
          }}
        />
      )}
      {showCaptainBadges && viceCaptain === player.id && (
        <img
          src={viceCaptainBadge}
          alt="V"
          className="absolute top-2 left-2 z-50"
          style={{
            width: `${cardSize.width * 0.18}px`,
            height: `${cardSize.width * 0.18}px`,
          }}
        />
      )}

      {/* Delete button */}
      {showRemoveButton && onRemovePlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemovePlayer(player.id);
          }}
          className="absolute top-2 right-2 z-50 flex items-center justify-center bg-[#5a7a4a] rounded-full"
          style={{
            width: `${cardSize.width * 0.18}px`,
            height: `${cardSize.width * 0.18}px`,
          }}
        >
          <X
            className="text-[#1a2e1a]"
            style={{
              width: `${cardSize.width * 0.12}px`,
              height: `${cardSize.width * 0.12}px`,
            }}
          />
        </button>
      )}

      {/* Price */}
      <div
        className="w-full flex items-center justify-center pt-2 pb-1.5 z-30"
        style={{ height: `${cardSize.height * 0.22}px` }} // 22% от высоты карточки
      >
        <span
          className="text-white font-medium drop-shadow-md whitespace-nowrap leading-tight"
          style={{ fontSize: `${cardSize.width * 0.12}px` }} // 12% от ширины карточки
        >
          ${(player.price || 9).toFixed(1)}
        </span>
      </div>

      {/* Jersey */}
      <div className="relative w-full flex-1 z-10 overflow-hidden">
        <img
          src={getJerseyForTeam(player.team, player.position)}
          alt={player.name}
          className="h-auto object-contain absolute left-1/2 transform -translate-x-1/2"
          style={{
            width: `${cardSize.width * 1.5}px`, // 150% от ширины карточки
            top: `-${cardSize.height * 0.16}px`, // -16% от высоты карточки
          }}
        />
      </div>

      {/* Name and team */}
      <div className="w-full relative z-20">
        <div
          className="bg-white"
          style={{
            paddingTop: `${cardSize.height * 0.02}px`,
            paddingBottom: `${cardSize.height * 0.02}px`,
          }}
        >
          <span
            className="font-semibold text-black block truncate whitespace-nowrap text-center"
            style={{ fontSize: `${cardSize.width * 0.1}px` }} // 10% от ширины
          >
            {truncateName(player.name, cardSize.width >= 128 ? 20 : cardSize.width >= 96 ? 15 : 10)}
          </span>
        </div>
        <div
          className="bg-[#1a1a2e]"
          style={{
            paddingTop: `${cardSize.height * 0.018}px`,
            paddingBottom: `${cardSize.height * 0.018}px`,
          }}
        >
          <span
            className="font-medium block truncate whitespace-nowrap text-center"
            style={{ fontSize: `${cardSize.width * 0.085}px` }} // 8.5% от ширины
          >
            <span className="text-[#7D7A94]">(Д)</span>
            <span className="text-white ml-[2%]">
              {truncateName(player.team, cardSize.width >= 128 ? 16 : cardSize.width >= 96 ? 12 : 8)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );

  // Компонент пустого слота
  const EmptySlotComponent = ({ position }: { position: string }) => (
    <div
      className="rounded-md border-2 border-dashed border-white/40 bg-[#3a5a28]/60 flex flex-col items-center justify-center cursor-pointer hover:bg-[#3a5a28]/80 transition-colors"
      style={{
        width: `${cardSize.width}px`,
        height: `${cardSize.height}px`,
        gap: `${cardSize.height * 0.06}px`, // 6% от высоты
      }}
      onClick={() => onEmptySlotClick?.(position)}
    >
      <span
        className="text-white font-bold"
        style={{ fontSize: `${cardSize.width * 0.2}px` }} // 20% от ширины
      >
        {position}
      </span>
      <div
        className="rounded-full bg-white/90 flex items-center justify-center"
        style={{
          width: `${cardSize.width * 0.25}px`, // 25% от ширины
          height: `${cardSize.width * 0.25}px`,
        }}
      >
        <Plus
          className="text-[#3a5a28]"
          style={{
            width: `${cardSize.width * 0.14}px`, // 14% от ширины
            height: `${cardSize.width * 0.14}px`,
          }}
        />
      </div>
    </div>
  );

  // Рассчитываем паддинги и гэпы пропорционально
  // На мобильном: padding 4px, гэпы 8-16px
  const mobileCardWidth = 64;
  const mobilePadding = 4;
  const mobileGapFor2 = 16; // для 2 карточек
  const mobileGapFor5 = 8; // для 5 карточек

  // Рассчитываем коэффициент увеличения относительно мобильного
  const scaleFactor = cardSize.width / mobileCardWidth;

  // Гэпы пропорциональны паддингам
  const getRowGap = (cardsInRow: number) => {
    if (cardsInRow === 2) return mobileGapFor2 * scaleFactor;
    if (cardsInRow === 3) return mobileGapFor2 * scaleFactor * 0.85; // Немного меньше для 3 карточек
    if (cardsInRow === 5) return mobileGapFor5 * scaleFactor;
    return mobileGapFor5 * scaleFactor;
  };

  // Паддинги контейнера пропорциональны
  const containerPadding = mobilePadding * scaleFactor;

  // Вертикальные отступы между строками
  const rowSpacing = cardSize.height * 0.5; // 50% от высоты карточки

  return (
    <div className="relative w-full">
      {/* Football field */}
      <div
        style={{
          paddingLeft: `${containerPadding}px`,
          paddingRight: `${containerPadding}px`,
          paddingTop: `${containerPadding}px`,
          paddingBottom: `${containerPadding}px`,
        }}
      >
        <img src={footballFieldNew} alt="Football field" className="w-full" />
      </div>

      {/* Player slots container */}
      <div
        className="absolute inset-0"
        style={{
          paddingLeft: `${containerPadding}px`,
          paddingRight: `${containerPadding}px`,
          paddingTop: `${containerPadding}px`,
          paddingBottom: `${containerPadding}px`,
        }}
      >
        {/* Row 1 - Goalkeepers (2 игрока) */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: "4%",
            gap: `${getRowGap(2)}px`,
          }}
        >
          {rows[1].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>

        {/* Row 2 - Defenders (5 игроков) */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height}px + ${rowSpacing}px)`,
            gap: `${getRowGap(5)}px`,
          }}
        >
          {rows[2].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>

        {/* Row 3 - Midfielders (5 игроков) */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height * 2}px + ${rowSpacing * 2}px)`,
            gap: `${getRowGap(5)}px`,
          }}
        >
          {rows[3].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>

        {/* Row 4 - Forwards (3 игрока) */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `calc(4% + ${cardSize.height * 3}px + ${rowSpacing * 3}px)`,
            gap: `${getRowGap(3)}px`,
          }}
        >
          {rows[4].map((slot, idx) => {
            const assignedPlayer = getAssignedPlayer(slot);
            const isOccupied = !!assignedPlayer;

            return (
              <div key={idx}>
                {isOccupied ? (
                  <PlayerCardComponent player={assignedPlayer!} />
                ) : (
                  <EmptySlotComponent position={slot.position} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormationField;

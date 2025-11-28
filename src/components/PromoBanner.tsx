import bannerBg from "@/assets/beterra-banner-bg.png";

const PromoBanner = () => {
  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden relative bg-black min-h-[140px] border border-border">
      <img src={bannerBg} alt="Beterra Cup Background" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
      <div className="relative p-6 flex items-center justify-start">
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold text-white">🏆</div>
          <div className="text-lg font-bold text-white tracking-wide">BETERRA</div>
          <div className="text-sm font-semibold text-white/90">КУБОК БЕЛАРУСІ</div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

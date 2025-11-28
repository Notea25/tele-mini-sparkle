import bannerBg from "@/assets/beterra-banner-bg.png";

const PromoBanner = () => {
  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden relative bg-black">
      <img src={bannerBg} alt="Beterra Cup Background" className="absolute inset-0 w-full h-full object-cover" />
      <div className="relative p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-primary text-6xl font-bold">
            <div className="w-16 h-16 border-4 border-primary rounded-lg flex items-center justify-center"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;

import bannerBg from "@/assets/beterra-banner-bg.png";

const PromoBanner = () => {
  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border">
      <img src={bannerBg} alt="Beterra Cup" className="w-full h-full object-cover rounded-xl" />
    </div>
  );
};

export default PromoBanner;

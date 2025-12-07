import bannerBg from "@/assets/beterra-banner.png";

const PromoBanner = () => {
  return (
    <div className="mx-4 mt-4">
      <img src={bannerBg} alt="Beterra Cup" className="w-full h-auto object-contain" />
    </div>
  );
};

export default PromoBanner;

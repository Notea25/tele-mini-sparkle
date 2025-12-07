import bannerBg from "@/assets/promo-banner.jpg";

const PromoBanner = () => {
  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden">
      <img src={bannerBg} alt="Promo Banner" className="w-full h-auto object-cover" />
    </div>
  );
};

export default PromoBanner;

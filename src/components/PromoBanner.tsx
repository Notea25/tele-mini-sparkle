const PromoBanner = () => {
  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden relative bg-gradient-to-r from-card to-secondary border border-primary/20">
      <div className="absolute inset-0 bg-gradient-primary opacity-30" />
      <div className="relative p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-primary text-6xl font-bold">
            <div className="w-16 h-16 border-4 border-primary rounded-lg flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
          </div>
          <div>
            <div className="text-primary text-sm font-bold tracking-wider">BETERRA</div>
            <div className="text-foreground text-lg font-bold">КУБОК</div>
            <div className="text-foreground text-lg font-bold">БЕЛАРУСІ</div>
          </div>
        </div>
        <div className="h-full w-32 bg-primary/10 rounded-lg" />
      </div>
    </div>
  );
};

export default PromoBanner;

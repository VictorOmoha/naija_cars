export default function MarketplaceHero({ rental = false }) {
  return (
    <section className="marketplace-hero" aria-labelledby="marketplace-heading">
      <div className="marketplace-hero-copy">
        <p className="marketplace-eyebrow">{rental ? 'Find your next rental' : 'Find your next car'}</p>
        <h1 id="marketplace-heading">{rental ? 'Your plans. The right car.' : 'More choice. A clearer way forward.'}</h1>
        <p>{rental ? 'Explore rental cars across Nigeria. Compare daily rates and contact the owner.' : 'Buy, rent or sell cars across Nigeria. Find the right fit for your next move.'}</p>
      </div>
      <div className="marketplace-hero-cars">
        <img className="marketplace-hero-car marketplace-hero-car-back" src="/assets/header-mercedes.webp" alt="Burgundy Mercedes-Benz G-Class" width="900" height="600" />
        <div className="marketplace-hero-car marketplace-hero-car-front">
          <img src="/assets/header-range-rover.webp" alt="Silver Range Rover" width="900" height="600" fetchPriority="high" />
        </div>
      </div>
    </section>
  );
}

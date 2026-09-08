export default function MarketplaceHero({ rental = false }) {
  return (
    <section className="marketplace-hero" aria-labelledby="marketplace-heading">
      <img className="marketplace-hero-image" src="/assets/marketplace-hero.webp" alt="Silver SUV outside a contemporary Lagos home" fetchPriority="high" />
      <div className="marketplace-hero-copy">
        <p className="marketplace-eyebrow">{rental ? 'Find your next rental' : 'Find your next car'}</p>
        <h1 id="marketplace-heading">{rental ? 'Your plans. The right car.' : 'More choice. A clearer way forward.'}</h1>
        <p>{rental ? 'Explore rental cars across Nigeria. Compare daily rates and contact the owner.' : 'Buy, rent or sell cars across Nigeria. Find the right fit for your next move.'}</p>
      </div>
    </section>
  );
}

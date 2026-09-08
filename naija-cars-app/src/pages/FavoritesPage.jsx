import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { usersAPI, listingsAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import CarCard from '../components/CarCard';
import { PageHeader, PageState } from '../components/PageLayout';
import { transformToCardShape } from '../utils/listingCard';

export default function FavoritesPage() {
  const [sort, setSort] = useState('recent');
  const [removing, setRemoving] = useState(null);
  const { addToast } = useApp();
  const client = useQueryClient();
  const { data = [], isLoading, error, refetch } = useQuery({ queryKey: ['favorites'], queryFn: () => usersAPI.getFavorites(), select: (r) => r.data.data.favorites });
  const cars = [...data].sort((a, b) => sort === 'price-low' ? a.price - b.price : sort === 'price-high' ? b.price - a.price : sort === 'year' ? b.year - a.year : 0);
  const remove = async (id) => {
    setRemoving(id);
    try { await listingsAPI.toggleFavorite(id); await client.invalidateQueries({ queryKey: ['favorites'] }); addToast('Car removed from your shortlist', 'success'); }
    catch { addToast('Could not remove this car. Please try again.', 'error'); }
    finally { setRemoving(null); }
  };
  return <><PageHeader eyebrow="Your shortlist" title="Saved cars" description="Keep your favourites together. Compare the details when you’re ready." /><div className="nc-page-width nc-content">
    {isLoading ? <PageState loading /> : error ? <PageState title="We couldn’t load your saved cars"><button className="nc-button" onClick={() => refetch()}>Try again</button></PageState> : !cars.length ? <PageState title="A little space for your next car" description="Save a car from its listing page and it will appear here."><Link to="/cars" className="nc-button">Explore cars</Link></PageState> : <>
      <div className="nc-content-toolbar"><p>{cars.length} saved {cars.length === 1 ? 'car' : 'cars'}</p><select aria-label="Sort saved cars" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recent">Recently saved</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="year">Year: newest first</option></select></div>
      <div className="nc-saved-grid">{cars.map((car) => <div key={car.id}><CarCard car={transformToCardShape(car)} /><button className="nc-remove-saved" onClick={() => remove(car.id)} disabled={removing === car.id} aria-label={`Remove ${car.year} ${car.make} ${car.model} from saved cars`}><Trash2 size={15} />{removing === car.id ? 'Removing…' : 'Remove from saved'}</button></div>)}</div>
    </>}
  </div></>;
}

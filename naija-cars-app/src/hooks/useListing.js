import { useQuery } from '@tanstack/react-query';
import { listingsAPI } from '../services/api';

// Keep one cache shape across the detail and booking journeys.
export default function useListing(id) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getById(id),
    select: (response) => response.data.data.listing,
    enabled: Boolean(id),
  });
}

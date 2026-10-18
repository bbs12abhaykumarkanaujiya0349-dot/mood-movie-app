import React from 'react';
import { Heart } from 'lucide-react';
import Container from '../components/common/Container';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';

export default function FavoritesPage() {
  return (
    <div className="py-12 sm:py-16 text-left">
      <Container>
        <div className="mb-10">
          <Badge variant="rose" size="md" className="mb-3">
            Favorites
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display">
            Favorite Movies
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2">
            Your all-time cinematic favorites and highest-rated titles.
          </p>
        </div>

        <EmptyState
          icon={Heart}
          title="No Favorites Saved Yet"
          description="Mark films as your favorites to tune the recommendation engine to your personal cinematic taste."
          actionLabel="Explore Catalog"
          onAction={() => window.location.assign('/movies')}
        />
      </Container>
    </div>
  );
}

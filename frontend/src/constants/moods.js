/**
 * The 8 Supported Mood Categories as defined in SRS Section 6.
 * Mapped to specific genres, thematic tones, and cinematic visual styling.
 */
export const MOODS = [
  {
    id: 'happy',
    label: 'Happy',
    tagline: 'Uplifting laughter, vibrant journeys, and feel-good stories',
    iconName: 'Sun',
    accentColor: '#f59e0b',
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    borderHover: 'hover:border-amber-500/50',
    glowColor: 'rgba(245, 158, 11, 0.3)',
    mappedGenres: ['Comedy', 'Family', 'Adventure', 'Feel-Good'],
    bgGradient: 'from-amber-600 to-yellow-500'
  },
  {
    id: 'sad',
    label: 'Sad',
    tagline: 'Soulful narratives, cathartic depths, and poignant human journeys',
    iconName: 'CloudRain',
    accentColor: '#60a5fa',
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    borderHover: 'hover:border-blue-500/50',
    glowColor: 'rgba(96, 165, 250, 0.3)',
    mappedGenres: ['Drama', 'Inspirational', 'Feel-Good'],
    bgGradient: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'romantic',
    label: 'Romantic',
    tagline: 'Heartfelt connections, electric chemistry, and timeless devotion',
    iconName: 'Heart',
    accentColor: '#f43f5e',
    gradient: 'from-rose-500/20 via-rose-500/10 to-transparent',
    borderHover: 'hover:border-rose-500/50',
    glowColor: 'rgba(244, 63, 94, 0.3)',
    mappedGenres: ['Romance', 'Drama', 'Romantic Comedy'],
    bgGradient: 'from-rose-600 to-pink-500'
  },
  {
    id: 'angry',
    label: 'Angry',
    tagline: 'Fierce revenge, relentless grit, and explosive adrenaline',
    iconName: 'Flame',
    accentColor: '#ef4444',
    gradient: 'from-red-600/20 via-red-600/10 to-transparent',
    borderHover: 'hover:border-red-500/50',
    glowColor: 'rgba(239, 68, 68, 0.35)',
    mappedGenres: ['Action', 'Thriller', 'Adventure'],
    bgGradient: 'from-red-600 to-orange-600'
  },
  {
    id: 'excited',
    label: 'Excited',
    tagline: 'Mind-bending worlds, thrilling speed, and grand sci-fi spectacle',
    iconName: 'Zap',
    accentColor: '#a855f7',
    gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    borderHover: 'hover:border-purple-500/50',
    glowColor: 'rgba(168, 85, 247, 0.35)',
    mappedGenres: ['Action', 'Adventure', 'Sci-Fi'],
    bgGradient: 'from-purple-600 to-indigo-600'
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    tagline: 'Peaceful escapism, cozy warmth, and gentle visual comfort',
    iconName: 'Coffee',
    accentColor: '#10b981',
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    borderHover: 'hover:border-emerald-500/50',
    glowColor: 'rgba(16, 185, 129, 0.3)',
    mappedGenres: ['Comedy', 'Family', 'Animation', 'Light Drama'],
    bgGradient: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'fearful',
    label: 'Fearful',
    tagline: 'Creeping dread, psychological tension, and spine-chilling suspense',
    iconName: 'Ghost',
    accentColor: '#8b5cf6',
    gradient: 'from-violet-600/20 via-violet-600/10 to-transparent',
    borderHover: 'hover:border-violet-500/50',
    glowColor: 'rgba(139, 92, 246, 0.35)',
    mappedGenres: ['Horror', 'Mystery', 'Thriller'],
    bgGradient: 'from-violet-700 to-purple-900'
  },
  {
    id: 'motivated',
    label: 'Motivated',
    tagline: 'Triumph over odds, legendary ambition, and inspiring endurance',
    iconName: 'Trophy',
    accentColor: '#eab308',
    gradient: 'from-yellow-500/20 via-yellow-500/10 to-transparent',
    borderHover: 'hover:border-yellow-500/50',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    mappedGenres: ['Biography', 'Sports', 'Inspirational', 'Drama'],
    bgGradient: 'from-amber-500 to-emerald-600'
  }
];

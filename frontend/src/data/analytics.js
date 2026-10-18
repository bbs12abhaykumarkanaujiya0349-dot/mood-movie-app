/**
 * Analytics Dataset with 7d, 30d, and 90d datasets for administrative charting.
 */
export const ANALYTICS_DATA = {
  '7d': {
    kpis: {
      totalUsers: { value: 1248, change: '+12%', isPositive: true },
      totalMovies: { value: 24, change: '+0%', isPositive: true },
      totalReviews: { value: 430, change: '+18%', isPositive: true },
      totalRecommendations: { value: 3120, change: '+24%', isPositive: true },
      activeUsers: { value: 680, change: '+9%', isPositive: true },
      popularMood: { value: 'Happy', change: '34% of queries', isPositive: true }
    },
    userGrowth: [
      { date: 'Mon', users: 1180, active: 590 },
      { date: 'Tue', users: 1195, active: 610 },
      { date: 'Wed', users: 1210, active: 625 },
      { date: 'Thu', users: 1222, active: 640 },
      { date: 'Fri', users: 1235, active: 665 },
      { date: 'Sat', users: 1242, active: 672 },
      { date: 'Sun', users: 1248, active: 680 }
    ],
    moodDistribution: [
      { name: 'Happy', value: 34, color: '#f59e0b' },
      { name: 'Excited', value: 22, color: '#a855f7' },
      { name: 'Relaxed', value: 16, color: '#10b981' },
      { name: 'Sad', value: 10, color: '#60a5fa' },
      { name: 'Romantic', value: 8, color: '#f43f5e' },
      { name: 'Angry', value: 4, color: '#ef4444' },
      { name: 'Fearful', value: 3, color: '#8b5cf6' },
      { name: 'Motivated', value: 3, color: '#eab308' }
    ],
    popularGenres: [
      { genre: 'Comedy', count: 184 },
      { genre: 'Sci-Fi', count: 152 },
      { genre: 'Action', count: 140 },
      { genre: 'Drama', count: 126 },
      { genre: 'Romance', count: 88 },
      { genre: 'Animation', count: 76 }
    ],
    mostReviewedMovies: [
      { title: 'The Midnight Odyssey', reviews: 42, avgRating: 8.6 },
      { title: 'Chronicles of Nebula', reviews: 38, avgRating: 8.7 },
      { title: 'Sunny Side Boulevard', reviews: 31, avgRating: 8.1 },
      { title: 'Echoes of Rain', reviews: 29, avgRating: 8.4 },
      { title: 'Neon Outrun', reviews: 24, avgRating: 8.3 }
    ],
    userActivity: [
      { time: '00:00', queries: 28 },
      { time: '04:00', queries: 12 },
      { time: '08:00', queries: 45 },
      { time: '12:00', queries: 110 },
      { time: '16:00', queries: 165 },
      { time: '20:00', queries: 240 },
      { time: '23:00', queries: 130 }
    ],
    sentimentBreakdown: [
      { name: 'Positive', value: 74, color: '#10b981' },
      { name: 'Neutral', value: 18, color: '#60a5fa' },
      { name: 'Negative', value: 8, color: '#ef4444' }
    ]
  },
  '30d': {
    kpis: {
      totalUsers: { value: 1248, change: '+38%', isPositive: true },
      totalMovies: { value: 24, change: '+4%', isPositive: true },
      totalReviews: { value: 430, change: '+44%', isPositive: true },
      totalRecommendations: { value: 12840, change: '+52%', isPositive: true },
      activeUsers: { value: 920, change: '+31%', isPositive: true },
      popularMood: { value: 'Excited', change: '29% of queries', isPositive: true }
    },
    userGrowth: [
      { date: 'Week 1', users: 950, active: 480 },
      { date: 'Week 2', users: 1040, active: 590 },
      { date: 'Week 3', users: 1150, active: 730 },
      { date: 'Week 4', users: 1248, active: 920 }
    ],
    moodDistribution: [
      { name: 'Happy', value: 31, color: '#f59e0b' },
      { name: 'Excited', value: 29, color: '#a855f7' },
      { name: 'Relaxed', value: 14, color: '#10b981' },
      { name: 'Sad', value: 11, color: '#60a5fa' },
      { name: 'Romantic', value: 7, color: '#f43f5e' },
      { name: 'Angry', value: 4, color: '#ef4444' },
      { name: 'Fearful', value: 2, color: '#8b5cf6' },
      { name: 'Motivated', value: 2, color: '#eab308' }
    ],
    popularGenres: [
      { genre: 'Sci-Fi', count: 640 },
      { genre: 'Comedy', count: 590 },
      { genre: 'Action', count: 510 },
      { genre: 'Drama', count: 480 },
      { genre: 'Romance', count: 320 },
      { genre: 'Animation', count: 280 }
    ],
    mostReviewedMovies: [
      { title: 'The Midnight Odyssey', reviews: 148, avgRating: 8.6 },
      { title: 'Chronicles of Nebula', reviews: 132, avgRating: 8.7 },
      { title: 'Sunny Side Boulevard', reviews: 110, avgRating: 8.1 },
      { title: 'Echoes of Rain', reviews: 94, avgRating: 8.4 },
      { title: 'Neon Outrun', reviews: 86, avgRating: 8.3 }
    ],
    userActivity: [
      { time: 'Sep 20', queries: 320 },
      { time: 'Sep 27', queries: 410 },
      { time: 'Oct 04', queries: 490 },
      { time: 'Oct 11', queries: 580 },
      { time: 'Oct 18', queries: 690 }
    ],
    sentimentBreakdown: [
      { name: 'Positive', value: 71, color: '#10b981' },
      { name: 'Neutral', value: 20, color: '#60a5fa' },
      { name: 'Negative', value: 9, color: '#ef4444' }
    ]
  },
  '90d': {
    kpis: {
      totalUsers: { value: 1248, change: '+110%', isPositive: true },
      totalMovies: { value: 24, change: '+100%', isPositive: true },
      totalReviews: { value: 430, change: '+95%', isPositive: true },
      totalRecommendations: { value: 34200, change: '+140%', isPositive: true },
      activeUsers: { value: 1110, change: '+85%', isPositive: true },
      popularMood: { value: 'Happy', change: '32% of queries', isPositive: true }
    },
    userGrowth: [
      { date: 'Month 1', users: 580, active: 310 },
      { date: 'Month 2', users: 890, active: 540 },
      { date: 'Month 3', users: 1248, active: 1110 }
    ],
    moodDistribution: [
      { name: 'Happy', value: 32, color: '#f59e0b' },
      { name: 'Excited', value: 25, color: '#a855f7' },
      { name: 'Relaxed', value: 15, color: '#10b981' },
      { name: 'Sad', value: 12, color: '#60a5fa' },
      { name: 'Romantic', value: 7, color: '#f43f5e' },
      { name: 'Angry', value: 4, color: '#ef4444' },
      { name: 'Fearful', value: 3, color: '#8b5cf6' },
      { name: 'Motivated', value: 2, color: '#eab308' }
    ],
    popularGenres: [
      { genre: 'Comedy', count: 1820 },
      { genre: 'Sci-Fi', count: 1640 },
      { genre: 'Action', count: 1450 },
      { genre: 'Drama', count: 1290 },
      { genre: 'Romance', count: 890 },
      { genre: 'Animation', count: 780 }
    ],
    mostReviewedMovies: [
      { title: 'The Midnight Odyssey', reviews: 380, avgRating: 8.6 },
      { title: 'Chronicles of Nebula', reviews: 340, avgRating: 8.7 },
      { title: 'Sunny Side Boulevard', reviews: 290, avgRating: 8.1 },
      { title: 'Echoes of Rain', reviews: 240, avgRating: 8.4 },
      { title: 'Relentless Ascent', reviews: 210, avgRating: 8.8 }
    ],
    userActivity: [
      { time: 'Aug', queries: 8200 },
      { time: 'Sep', queries: 11800 },
      { time: 'Oct', queries: 14200 }
    ],
    sentimentBreakdown: [
      { name: 'Positive', value: 76, color: '#10b981' },
      { name: 'Neutral', value: 16, color: '#60a5fa' },
      { name: 'Negative', value: 8, color: '#ef4444' }
    ]
  }
};

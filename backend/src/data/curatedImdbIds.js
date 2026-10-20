/**
 * Curated list of well-known movies by IMDb ID covering all 8 supported mood categories.
 * Each entry includes the verified imdbID, canonical title, and associated mood.
 */
const curatedMovies = [
  // 1. Happy (Comedy, Family, Adventure, Feel-Good)
  { imdbId: 'tt0107048', title: 'Groundhog Day', mood: 'Happy' },
  { imdbId: 'tt0088763', title: 'Back to the Future', mood: 'Happy' },
  { imdbId: 'tt0114709', title: 'Toy Story', mood: 'Happy' },
  { imdbId: 'tt0266543', title: 'Finding Nemo', mood: 'Happy' },
  { imdbId: 'tt0829482', title: 'Superbad', mood: 'Happy' },
  { imdbId: 'tt0211915', title: 'Amélie', mood: 'Happy' },
  { imdbId: 'tt2278388', title: 'The Grand Budapest Hotel', mood: 'Happy' },
  { imdbId: 'tt4468740', title: 'Paddington 2', mood: 'Happy' },
  { imdbId: 'tt0109830', title: 'Forrest Gump', mood: 'Happy' },
  { imdbId: 'tt0367594', title: 'Charlie and the Chocolate Factory', mood: 'Happy' },

  // 2. Sad (Drama, Inspirational, Feel-Good)
  { imdbId: 'tt0111161', title: 'The Shawshank Redemption', mood: 'Sad' },
  { imdbId: 'tt0108052', title: "Schindler's List", mood: 'Sad' },
  { imdbId: 'tt0118799', title: 'Life Is Beautiful', mood: 'Sad' },
  { imdbId: 'tt0097165', title: 'Dead Poets Society', mood: 'Sad' },
  { imdbId: 'tt0119217', title: 'Good Will Hunting', mood: 'Sad' },
  { imdbId: 'tt0253474', title: 'The Pianist', mood: 'Sad' },
  { imdbId: 'tt0454921', title: 'The Pursuit of Happyness', mood: 'Sad' },
  { imdbId: 'tt0169547', title: 'American Beauty', mood: 'Sad' },
  { imdbId: 'tt0120737', title: 'The Lord of the Rings: The Fellowship of the Ring', mood: 'Sad' },
  { imdbId: 'tt0468569', title: 'The Dark Knight', mood: 'Sad' },

  // 3. Romantic (Romance, Drama, Romantic Comedy)
  { imdbId: 'tt0120338', title: 'Titanic', mood: 'Romantic' },
  { imdbId: 'tt0034583', title: 'Casablanca', mood: 'Romantic' },
  { imdbId: 'tt0112471', title: 'Before Sunrise', mood: 'Romantic' },
  { imdbId: 'tt3783958', title: 'La La Land', mood: 'Romantic' },
  { imdbId: 'tt0414387', title: 'Pride & Prejudice', mood: 'Romantic' },
  { imdbId: 'tt2194499', title: 'About Time', mood: 'Romantic' },
  { imdbId: 'tt0332280', title: 'The Notebook', mood: 'Romantic' },
  { imdbId: 'tt0338013', title: 'Eternal Sunshine of the Spotless Mind', mood: 'Romantic' },
  { imdbId: 'tt0381681', title: 'Before Sunset', mood: 'Romantic' },
  { imdbId: 'tt0112579', title: 'The Bridges of Madison County', mood: 'Romantic' },

  // 4. Angry (Action, Thriller, Adventure)
  { imdbId: 'tt0172495', title: 'Gladiator', mood: 'Angry' },
  { imdbId: 'tt1392190', title: 'Mad Max: Fury Road', mood: 'Angry' },
  { imdbId: 'tt0266697', title: 'Kill Bill: Vol. 1', mood: 'Angry' },
  { imdbId: 'tt2911666', title: 'John Wick', mood: 'Angry' },
  { imdbId: 'tt1853728', title: 'Django Unchained', mood: 'Angry' },
  { imdbId: 'tt0434409', title: 'V for Vendetta', mood: 'Angry' },
  { imdbId: 'tt0137523', title: 'Fight Club', mood: 'Angry' },
  { imdbId: 'tt0113277', title: 'Heat', mood: 'Angry' },
  { imdbId: 'tt0110413', title: 'Léon: The Professional', mood: 'Angry' },
  { imdbId: 'tt0482571', title: 'The Prestige', mood: 'Angry' },

  // 5. Excited (Action, Adventure, Sci-Fi)
  { imdbId: 'tt1375666', title: 'Inception', mood: 'Excited' },
  { imdbId: 'tt0816692', title: 'Interstellar', mood: 'Excited' },
  { imdbId: 'tt0133093', title: 'The Matrix', mood: 'Excited' },
  { imdbId: 'tt0082971', title: 'Raiders of the Lost Ark', mood: 'Excited' },
  { imdbId: 'tt4154796', title: 'Avengers: Endgame', mood: 'Excited' },
  { imdbId: 'tt4633694', title: 'Spider-Man: Into the Spider-Verse', mood: 'Excited' },
  { imdbId: 'tt0107290', title: 'Jurassic Park', mood: 'Excited' },
  { imdbId: 'tt0080684', title: 'Star Wars: Episode V - The Empire Strikes Back', mood: 'Excited' },
  { imdbId: 'tt0062622', title: '2001: A Space Odyssey', mood: 'Excited' },
  { imdbId: 'tt0103064', title: 'Terminator 2: Judgment Day', mood: 'Excited' },

  // 6. Relaxed (Comedy, Family, Animation, Light Drama)
  { imdbId: 'tt0245429', title: 'Spirited Away', mood: 'Relaxed' },
  { imdbId: 'tt0096283', title: 'My Neighbor Totoro', mood: 'Relaxed' },
  { imdbId: 'tt0382932', title: 'Ratatouille', mood: 'Relaxed' },
  { imdbId: 'tt1605783', title: 'Midnight in Paris', mood: 'Relaxed' },
  { imdbId: 'tt0093779', title: 'The Princess Bride', mood: 'Relaxed' },
  { imdbId: 'tt2883512', title: 'Chef', mood: 'Relaxed' },
  { imdbId: 'tt0118715', title: 'The Big Lebowski', mood: 'Relaxed' },
  { imdbId: 'tt0432283', title: 'Fantastic Mr. Fox', mood: 'Relaxed' },
  { imdbId: 'tt0104694', title: 'A League of Their Own', mood: 'Relaxed' },
  { imdbId: 'tt0110357', title: 'The Lion King', mood: 'Relaxed' },

  // 7. Fearful (Horror, Mystery, Thriller)
  { imdbId: 'tt0054215', title: 'Psycho', mood: 'Fearful' },
  { imdbId: 'tt0081505', title: 'The Shining', mood: 'Fearful' },
  { imdbId: 'tt0102926', title: 'The Silence of the Lambs', mood: 'Fearful' },
  { imdbId: 'tt0078748', title: 'Alien', mood: 'Fearful' },
  { imdbId: 'tt0114369', title: 'Seven', mood: 'Fearful' },
  { imdbId: 'tt5052448', title: 'Get Out', mood: 'Fearful' },
  { imdbId: 'tt6644200', title: 'A Quiet Place', mood: 'Fearful' },
  { imdbId: 'tt7784604', title: 'Hereditary', mood: 'Fearful' },
  { imdbId: 'tt0167404', title: 'The Sixth Sense', mood: 'Fearful' },
  { imdbId: 'tt1130884', title: 'Shutter Island', mood: 'Fearful' },

  // 8. Motivated (Biography, Sports, Inspirational, Drama)
  { imdbId: 'tt0075148', title: 'Rocky', mood: 'Motivated' },
  { imdbId: 'tt2582802', title: 'Whiplash', mood: 'Motivated' },
  { imdbId: 'tt0993846', title: 'The Wolf of Wall Street', mood: 'Motivated' },
  { imdbId: 'tt1285016', title: 'The Social Network', mood: 'Motivated' },
  { imdbId: 'tt0050083', title: '12 Angry Men', mood: 'Motivated' },
  { imdbId: 'tt1950186', title: 'Ford v Ferrari', mood: 'Motivated' },
  { imdbId: 'tt4846340', title: 'Hidden Figures', mood: 'Motivated' },
  { imdbId: 'tt0210945', title: 'Remember the Titans', mood: 'Motivated' },
  { imdbId: 'tt1057500', title: 'Invictus', mood: 'Motivated' },
  { imdbId: 'tt2980516', title: 'The Theory of Everything', mood: 'Motivated' },
];

module.exports = curatedMovies;

import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MovieSearchScreen from './MovieSearchScreen';
import ReviewForm from './ReviewForm';
import { getFirestore, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { handleDeleteReview } from './fireBaseUtils'; // Tuodaan apufunktio arvostelun poistamiseen

export default function HomeScreen() {
  // Tilamuuttujat komponentin tilan hallintaan
  const [selectedMovie, setSelectedMovie] = useState(null); // Valittu elokuva arvostelun kirjoittamista varten
  const [reviews, setReviews] = useState([]); // Käyttäjän arvostelut
  const [favorites, setFavorites] = useState([]); // Käyttäjän suosikit
  const [editingReview, setEditingReview] = useState(null); // Muokattavana oleva arvostelu
  const auth = getAuth(); // Firebase Authentication -instanssi
  const db = getFirestore(); // Firebase Firestore -instanssi

  // Asetetaan valittu elokuva
  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  // Palautetaan tila arvostelun lähettämisen jälkeen
  const handleReviewSubmit = () => {
    setSelectedMovie(null);
    setEditingReview(null);
  };

  // Haetaan kirjautuneen käyttäjän arvostelut Firestoresta
  const fetchUserReviews = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const reviewsRef = collection(db, 'reviews'); // Viitataan arvostelukokoelmaan
        const q = query(reviewsRef, where('userId', '==', user.uid)); // Suodatetaan käyttäjän arvostelut
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reviewsList = [];
          querySnapshot.forEach((doc) => {
            reviewsList.push({ id: doc.id, ...doc.data() }); // Tallennetaan arvostelut
          });
          setReviews(reviewsList); // Päivitetään tila
        });

        return unsubscribe; // Palautetaan lopetusfunktio
      } catch (error) {
        console.error("Error fetching user reviews: ", error);
      }
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review); // Asetetaan muokattava arvostelu, joka on valittu
    setSelectedMovie({ imdbID: review.movieId, Title: review.movieTitle, Poster: review.posterUrl }); // Asetetaan muokattava elokuva valituksi arvostelun perusteella
  };
  

  // Haetaan käyttäjän suosikit Firestoresta
  const fetchFavorites = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const favoritesRef = collection(db, 'favorites'); // Viitataan suosikkikokoelmaan
        const q = query(favoritesRef, where('userId', '==', user.uid)); // Suodatetaan käyttäjän suosikit
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const favoritesList = [];
          querySnapshot.forEach((doc) => {
            favoritesList.push(doc.data().movieId); // Lisätään elokuvan ID suosikkilistaan
          });
          setFavorites(favoritesList); // Päivitetään tila
        });

        return unsubscribe; // Palautetaan lopetusfunktio
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }
  };

  // Lisää tai poista elokuva suosikeista
  const handleToggleFavorite = async (movie) => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (favorites.includes(movie.imdbID)) {
          // Poistetaan suosikeista
          const favoritesRef = collection(db, 'favorites');
          const q = query(favoritesRef, where('userId', '==', user.uid), where('movieId', '==', movie.imdbID));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref); // Poistetaan dokumentti
          });
        } else {
          // Lisätään suosikkeihin
          await addDoc(collection(db, 'favorites'), {
            userId: user.uid,
            movieId: movie.imdbID,
            movieTitle: movie.Title,
            posterUrl: movie.Poster !== "N/A" ? movie.Poster : null,
            timestamp: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    }
  };

  // Poistetaan arvostelu ja siihen liittyvä suosikki, jos olemassa
  const handleDeleteReviewClick = async (reviewId, movieId) => {
    try {
      await handleDeleteReview(reviewId); // Poistetaan arvostelu Firestoresta
      const user = auth.currentUser;
      if (user) {
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid), where('movieId', '==', movieId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref); // Poistetaan mahdollinen suosikkimerkintä
        });
      }
    } catch (error) {
      console.error("Error deleting review or favorite:", error);
    }
  };

  // Käynnistetään arvostelujen ja suosikkien haku komponentin latautuessa
  useEffect(() => {
    const unsubscribeReviews = fetchUserReviews();
    const unsubscribeFavorites = fetchFavorites();
    return () => {
      unsubscribeReviews && unsubscribeReviews(); // Suljetaan arvostelujen tilauksen kuuntelu
      unsubscribeFavorites && unsubscribeFavorites(); // Suljetaan suosikkien tilauksen kuuntelu
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        {selectedMovie ? (
          // Näytetään arvostelulomake, jos elokuva valittu
          <ReviewForm
            selectedMovie={selectedMovie}
            onReviewSubmit={handleReviewSubmit}
            existingReview={editingReview}
          />
        ) : (
          <>
            {/* Elokuvahakukomponentti */}
            <View style={styles.movieSearchContainer}>
              <MovieSearchScreen onSelectMovie={handleMovieSelect} />
            </View>

            {/* Tyhjän tilan teksti, jos arvosteluja ei ole */}
            {reviews.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Search for a movie to get started!</Text>
              </View>
            )}
          </>
        )}

        {/* Käyttäjän arvostelut */}
        {reviews.length > 0 && !selectedMovie && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>Your Reviews:</Text>
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.reviewContainer}>
                  {/* Näytetään elokuvan juliste tai "ei julistetta" -teksti */}
                  {item.posterUrl && item.posterUrl !== "N/A" ? (
                    <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                  ) : (
                    <Text style={styles.noPoster}>No poster available</Text>
                  )}
                  <View style={styles.reviewDetails}>
                    {/* Elokuvan nimi ja arvostelutiedot */}
                    <Text style={styles.movieTitle}>
                      {item.movieTitle} - Rating: {item.rating} / 10
                    </Text>
                    <Text style={styles.reviewText}>{item.review}</Text>

                    {/* Painikkeet muokkaamiseen, poistamiseen ja suosikiksi lisäämiseen */}
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.editButton} onPress={() => handleEditReview(item)}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() =>
                          Alert.alert(
                            "Delete Review",
                            "Are you sure you want to delete this review?",
                            [
                              { text: "Cancel", style: "cancel" },
                              { text: "Delete", onPress: () => handleDeleteReviewClick(item.id, item.movieId) }
                            ]
                          )
                        }
                      >
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleToggleFavorite({
                            imdbID: item.movieId,
                            Title: item.movieTitle,
                            Poster: item.posterUrl,
                          })
                        }
                      >
                        <Text style={favorites.includes(item.movieId) ? styles.favoriteActive : styles.favorite}>
                          {favorites.includes(item.movieId) ? '❤️' : '🤍'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// Tyylit komponentille
const styles = StyleSheet.create({
  // Tyylit määritelty kullekin näkymän osalle
  container: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 10,
  },
  reviewsTitle: {
    fontSize: 20,
    color: '#FFD700',  // Keltainen väri otsikoille
    marginBottom: 10,
  },
  reviewsSection: {
    marginTop: 20,
  },
  movieSearchContainer: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 30,  // Lisää tämä, jotta elokuvahaku siirtyy alemmaksi
  },
  reviewContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  reviewDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#8B0000',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  favorite: {
    fontSize: 24,
    color: 'gray',
    marginLeft: 10,
  },
  favoriteActive: {
    fontSize: 24,
    color: 'red',
    marginLeft: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  noPoster: {
    fontSize: 16,
    color: 'gray',
  },
  movieTitle: {
    fontSize: 16,
    color: '#FFD700',
  },
  reviewText: {
    fontSize: 14,
    color: '#fff',
  },
});

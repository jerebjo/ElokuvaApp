import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import MovieSearchScreen from './MovieSearchScreen';
import ReviewForm from './ReviewForm';
import { getFirestore, collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { handleDeleteReview } from './fireBaseUtils'; // Tuodaan fireBaseUtils-tiedostosta

export default function HomeScreen() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [editingReview, setEditingReview] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  const handleReviewSubmit = () => {
    setSelectedMovie(null);
    setEditingReview(null);
  };

  const fetchUserReviews = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reviewsList = [];
          querySnapshot.forEach((doc) => {
            reviewsList.push({ id: doc.id, ...doc.data() });
          });
          setReviews(reviewsList);
        });

        return unsubscribe; // Palauta kuuntelun lopettamiseksi
      } catch (error) {
        console.error("Error fetching user reviews: ", error);
      }
    }
  };

  const fetchFavorites = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const favoritesList = [];
          querySnapshot.forEach((doc) => {
            favoritesList.push(doc.data().movieId);
          });
          setFavorites(favoritesList);
        });

        return unsubscribe; // Palauta kuuntelun lopettamiseksi
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    }
  };

  const handleToggleFavorite = async (movie) => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (favorites.includes(movie.imdbID)) {
          const favoritesRef = collection(db, 'favorites');
          const q = query(favoritesRef, where('userId', '==', user.uid), where('movieId', '==', movie.imdbID));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        } else {
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

  const handleDeleteReviewClick = async (reviewId, movieId) => {
    try {
      // First, delete the review
      await handleDeleteReview(reviewId); // Calls the existing function to delete the review
  
      // Check if the movie is in favorites and delete it if present
      const user = auth.currentUser;
      if (user) {
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid), where('movieId', '==', movieId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref); // Delete the movie from the favorites collection
        });
      }
    } catch (error) {
      console.error("Error deleting review or favorite:", error);
    }
  };

  useEffect(() => {
    const unsubscribeReviews = fetchUserReviews();
    const unsubscribeFavorites = fetchFavorites();
    return () => {
      unsubscribeReviews && unsubscribeReviews();
      unsubscribeFavorites && unsubscribeFavorites();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        {selectedMovie ? (
          <ReviewForm
            selectedMovie={selectedMovie}
            onReviewSubmit={handleReviewSubmit}
            existingReview={editingReview}
          />
        ) : (
          <>
            {/* Lisää hakuelementin tausta */}
            <View style={styles.movieSearchContainer}>
              <MovieSearchScreen onSelectMovie={handleMovieSelect} />
            </View>

            {reviews.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Search for a movie to get started</Text>
              </View>
            )}
          </>
        )}

        {reviews.length > 0 && !selectedMovie && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>Your Reviews:</Text>
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.reviewContainer}>
                  {item.posterUrl && item.posterUrl !== "N/A" ? (
                    <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                  ) : (
                    <Text style={styles.noPoster}>No poster available</Text>
                  )}
                  <View style={styles.reviewDetails}>
                    <Text style={styles.movieTitle}>
                      {item.movieTitle} - Rating: {item.rating} / 10
                    </Text>
                    <Text style={styles.reviewText}>{item.review}</Text>

                    {/* Edit and Delete Buttons */}
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
                    </View>

                    {/* Favorite Toggle */}
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
                        {favorites.includes(item.movieId) ? '❤️' : '🖤'}
                      </Text>
                    </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 10,
  },
  reviewsTitle: {
    fontSize: 20,
    color: '#fff',
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
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: 'orange',
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
  },
  favoriteActive: {
    fontSize: 24,
    color: 'red',
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
});

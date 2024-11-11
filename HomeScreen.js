import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, Image, ScrollView, Button } from 'react-native';
import MovieSearchScreen from './MovieSearchScreen';
import ReviewForm from './ReviewForm';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function HomeScreen() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
  };

  const handleReviewSubmit = () => {
    setSelectedMovie(null); // Clear selection after review submission
    fetchUserReviews(); // Fetch updated reviews after a review is submitted
  };

  const fetchUserReviews = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const reviewsList = [];
        querySnapshot.forEach((doc) => {
          reviewsList.push(doc.data());
        });
        setReviews(reviewsList);
      } catch (error) {
        console.error("Error fetching user reviews: ", error);
      }
    }
  };

  // Fetch reviews when the component mounts
  useEffect(() => {
    fetchUserReviews();
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        {selectedMovie ? (
          <ReviewForm selectedMovie={selectedMovie} onReviewSubmit={handleReviewSubmit} />
        ) : (
          <MovieSearchScreen onSelectMovie={handleMovieSelect} />
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && !selectedMovie && (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsTitle}>Your Reviews:</Text>
            <FlatList
              data={reviews}
              keyExtractor={(item) => item.movieId}
              renderItem={({ item }) => (
                <View style={styles.reviewContainer}>
                  {item.posterUrl && item.posterUrl !== "N/A" ? (
                    <Image source={{ uri: item.posterUrl }} style={styles.poster} />
                  ) : (
                    <Text style={styles.noPoster}>No poster available</Text>
                  )}
                  <Text style={styles.movieTitle}>
                    {item.movieTitle} - Rating: {item.rating} / 10
                  </Text>
                  <Text style={styles.reviewText}>{item.review}</Text>
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
  reviewContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  movieTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewText: {
    color: '#E0E0E0',
    fontSize: 14,
    marginTop: 5,
  },
  poster: {
    width: 150,
    height: 225,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  noPoster: {
    color: '#ffffff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot,getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function FilmsScreen() {
  const [reviews, setReviews] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  const fetchUserReviews = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('userId', '==', user.uid));

        // Käytä onSnapshot kuuntelua reaaliaikaisten päivitysten saamiseksi
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const reviewsList = [];
          querySnapshot.forEach((doc) => {
            reviewsList.push({ id: doc.id, ...doc.data() });
          });
          setReviews(reviewsList);
        });

        // Palauta unsubscribe kuuntelun lopettamiseksi
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      }
    }
  };

  const handleDeleteReview = async (reviewId, movieId) => {
    try {
      // First, delete the review
      await deleteDoc(doc(db, 'reviews', reviewId));
  
      // Now, check if the movie is in favorites and delete it if present
      const user = auth.currentUser;
      if (user) {
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid), where('movieId', '==', movieId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref); // Remove movie from favorites collection
        });
      }
    } catch (error) {
      console.error("Error deleting review or favorite:", error);
    }
  };
  useEffect(() => {
    const unsubscribe = fetchUserReviews(); // Aloita kuuntelu
    return () => unsubscribe && unsubscribe(); // Lopeta kuuntelu unmountissa
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Films</Text>

      {reviews.length > 0 ? (
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

                <TouchableOpacity
  style={styles.deleteButton}
  onPress={() =>
    Alert.alert(
      "Delete Review",
      "Are you sure you want to delete this review?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDeleteReview(item.id, item.movieId) }
      ]
    )
  }
>
  <Text style={styles.buttonText}>Delete</Text>
</TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.text}>No reviewed films yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 10,
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    color: '#E0E0E0',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
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
    marginLeft: 10,
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
    width: 80,
    height: 120,
    resizeMode: 'contain',
  },
  noPoster: {
    color: '#ffffff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#8B0000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

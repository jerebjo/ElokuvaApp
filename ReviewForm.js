import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Image } from 'react-native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ReviewForm({ selectedMovie, onReviewSubmit }) {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const db = getFirestore();
  const auth = getAuth();

  const submitReview = async () => {
    const user = auth.currentUser;
    if (user && selectedMovie) {
      try {
        await addDoc(collection(db, 'reviews'), {
          userId: user.uid,
          movieId: selectedMovie.imdbID,
          movieTitle: selectedMovie.Title,
          review: reviewText,
          rating: parseInt(rating),
          posterUrl: selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : null, // Only store if valid poster URL
          timestamp: serverTimestamp(),
        });
        setReviewText('');
        setRating('');
        onReviewSubmit(); // Update view after submission
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.movieTitle}>Arvostele: {selectedMovie.Title}</Text>
      {selectedMovie.Poster && selectedMovie.Poster !== "N/A" ? (
        <Image source={{ uri: selectedMovie.Poster }} style={styles.poster} />
      ) : (
        <Text style={styles.noPoster}>No poster available</Text> // Fallback text if no poster
      )}
      <TextInput
        style={styles.input}
        placeholder="Kirjoita arvostelu"
        value={reviewText}
        onChangeText={setReviewText}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Anna arvosana (1-10)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />
      <Button title="Lähetä arvostelu" onPress={submitReview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 20,
  },
  movieTitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: 'white',
    marginBottom: 10,
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

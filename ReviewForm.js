import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Image } from 'react-native';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ReviewForm({ selectedMovie, onReviewSubmit, existingReview }) {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    if (existingReview) {
      setReviewText(existingReview.review);
      setRating(existingReview.rating.toString());
    }
  }, [existingReview]);

  const submitReview = async () => {
    const user = auth.currentUser;
    if (user && selectedMovie) {
      try {
        if (existingReview) {
          // Update existing review
          const reviewDoc = doc(db, 'reviews', existingReview.id);
          await updateDoc(reviewDoc, {
            review: reviewText,
            rating: parseInt(rating),
            timestamp: serverTimestamp(),
          });
        } else {
          // Add new review
          await addDoc(collection(db, 'reviews'), {
            userId: user.uid,
            movieId: selectedMovie.imdbID,
            movieTitle: selectedMovie.Title,
            review: reviewText,
            rating: parseInt(rating),
            posterUrl: selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : null,
            timestamp: serverTimestamp(),
          });
        }
        setReviewText('');
        setRating('');
        onReviewSubmit();
      } catch (error) {
        console.error("Error submitting review:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.movieTitle}>Review: {selectedMovie.Title}</Text>
      {selectedMovie.Poster && selectedMovie.Poster !== "N/A" ? (
        <Image source={{ uri: selectedMovie.Poster }} style={styles.poster} />
      ) : (
        <Text style={styles.noPoster}>No poster available</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Write your review"
        value={reviewText}
        onChangeText={setReviewText}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (1-10)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />
      <Button title={existingReview ? "Update Review" : "Submit Review"} onPress={submitReview} />
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
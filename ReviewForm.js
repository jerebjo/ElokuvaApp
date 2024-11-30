import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Image } from 'react-native';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function ReviewForm({ selectedMovie, onReviewSubmit, existingReview }) {
  const [reviewText, setReviewText] = useState(''); // Arvostelutekstin tila
  const [rating, setRating] = useState(''); // Arvosanan tila
  const [ratingError, setRatingError] = useState(''); // Virheviesti arvosanalle
  const db = getFirestore(); // Firebase Firestore-viite
  const auth = getAuth(); // Firebase Auth-viite

  useEffect(() => {
    if (existingReview) { // Jos muokataan olemassa olevaa arvostelua
      setReviewText(existingReview.review); // Esitäytä arvosteluteksti
      setRating(existingReview.rating.toString()); // Esitäytä arvosana (merkkijonona)
    }
  }, [existingReview]); // Käynnistä esitäyttö aina kun `existingReview` muuttuu

  const submitReview = async () => {
    const user = auth.currentUser; // Tällä hetkellä kirjautunut käyttäjä
    if (user && selectedMovie) {
      // Convert rating to an integer and check if it's valid
      const numericRating = parseInt(rating);
      if (numericRating < 1 || numericRating > 10) {
        setRatingError("Rating must be between 1 and 10."); // Show error if rating is out of bounds
        return;
      }

      try {
        if (existingReview) {
          // Päivitetään olemassa oleva arvostelu
          const reviewDoc = doc(db, 'reviews', existingReview.id);
          await updateDoc(reviewDoc, {
            review: reviewText,
            rating: numericRating, // Arvosana tallennetaan numerona
            timestamp: serverTimestamp(), // Päivitetään aikaleima
          });
        } else {
          // Luodaan uusi arvostelu
          await addDoc(collection(db, 'reviews'), {
            userId: user.uid, // Käyttäjän ID
            movieId: selectedMovie.imdbID, // Elokuvan IMDb-ID
            movieTitle: selectedMovie.Title, // Elokuvan nimi
            review: reviewText, // Arvosteluteksti
            rating: numericRating, // Arvosana
            posterUrl: selectedMovie.Poster !== "N/A" ? selectedMovie.Poster : null, // Julisteen URL (jos saatavilla)
            timestamp: serverTimestamp(), // Luontiaikaleima
          });
        }
        setReviewText(''); // Tyhjennetään lomake
        setRating('');
        setRatingError(''); // Tyhjennetään virheviesti
        onReviewSubmit(); // Paluu kotinäkymään
      } catch (error) {
        console.error("Error submitting review:", error); // Virheen käsittely
      }
    }
  };

  const handleRatingChange = (text) => {
    // Update the rating state and clear any error if input is valid
    setRating(text);
    if (text < 1 || text > 10) {
      setRatingError("Rating must be between 1 and 10.");
    } else {
      setRatingError('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Elokuvan otsikko */}
      <Text style={styles.movieTitle}>Review: {selectedMovie.Title}</Text>
      
      {/* Elokuvan juliste */}
      {selectedMovie.Poster && selectedMovie.Poster !== "N/A" ? (
        <Image source={{ uri: selectedMovie.Poster }} style={styles.poster} />
      ) : (
        <Text style={styles.noPoster}>No poster available</Text>
      )}
      
      {/* Arvostelutekstin syöttö */}
      <TextInput
        style={styles.input}
        placeholder="Write your review"
        value={reviewText}
        onChangeText={setReviewText}
        multiline // Mahdollistaa usean rivin tekstin
      />
      
      {/* Arvosanan syöttö */}
      <TextInput
        style={styles.input}
        placeholder="Rating (1-10)"
        value={rating}
        onChangeText={handleRatingChange}
        keyboardType="numeric" // Näyttää vain numeronäppäimistön
      /> 
      
      {/* Arvosana virheviesti */}
      {ratingError ? <Text style={styles.errorText}>{ratingError}</Text> : null}

      {/* Tallennuspainike */}
      <Button title={existingReview ? "Update Review" : "Submit Review"} onPress={submitReview} />
      
      <View style={styles.buttonSpacing} />
      
      {/* Paluupainike */}
      <Button
        title="Back to Home"
        onPress={onReviewSubmit} // Paluu ilman tallennusta
        color="#ff6347" 
      />
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
  buttonSpacing: {
    marginTop: 10, 
  },
  errorText: {
    color: 'red', 
    marginBottom: 10,
  },
});

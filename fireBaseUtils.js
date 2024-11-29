// fireBaseUtils.js
import { getFirestore, doc, deleteDoc, collection, query, getDocs, where } from 'firebase/firestore';

const db = getFirestore();

// Funktio elokuvan poistamiseen (sisältää arvostelut ja suosikit)
export const handleDeleteMovie = async (movieId, updateFavorites) => {
    try {
      // Poistetaan arvostelu
      const reviewRef = doc(db, 'reviews', movieId);
      await deleteDoc(reviewRef);
  
      // Poistetaan suosikit
      const favoritesRef = collection(db, 'favorites');
      const q = query(favoritesRef, where('movieId', '==', movieId));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
  
      // Päivitetään state poistamisen jälkeen
      updateFavorites(movieId);  // Tämä funktio voidaan välittää komponentilta
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

// Funktio arvostelun poistamiseen
export const handleDeleteReview = async (reviewId) => {
  try {
    const reviewRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    console.error("Error deleting review:", error);
  }
};

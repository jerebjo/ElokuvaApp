import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const auth = getAuth();
  const db = getFirestore();

  // Hakee käyttäjän suosikit Firestoresta ja kuuntelee muutoksia reaaliaikaisesti
  const fetchFavorites = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const favoritesRef = collection(db, 'favorites');
        const q = query(favoritesRef, where('userId', '==', user.uid));

        // Käytetään onSnapshot-tapahtumakuuntelijaa reaaliaikaisesti
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const favoritesList = [];
          querySnapshot.forEach((docSnapshot) => {
            const favoriteData = { id: docSnapshot.id, ...docSnapshot.data() };
            favoritesList.push(favoriteData);
          });
          setFavorites(favoritesList);
        });

        return unsubscribe; // Palautetaan kuuntelija, joka voidaan peruuttaa
      } catch (error) {
        console.error("Error fetching favorites: ", error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = fetchFavorites();
    return () => unsubscribe && unsubscribe(); // Puhdistetaan kuuntelija
  }, []);

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.movieContainer}>
      {item.posterUrl ? (
        <Image source={{ uri: item.posterUrl }} style={styles.poster} />
      ) : (
        <Text style={styles.noPoster}>No poster available</Text>
      )}
      <Text style={styles.movieTitle}>{item.movieTitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorite Movies</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
        />
      ) : (
        <Text style={styles.noFavorites}>You have no favorite movies yet!</Text>
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
  movieContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 8,
    alignItems: 'center',
  },
  poster: {
    width: 80,
    height: 120,
    resizeMode: 'contain',
    marginRight: 10,
  },
  noPoster: {
    color: '#ffffff',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  movieTitle: {
    color: '#E0E0E0',
    fontSize: 16,
  },
  noFavorites: {
    color: '#E0E0E0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

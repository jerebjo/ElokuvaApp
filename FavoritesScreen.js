import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]); // Tallentaa käyttäjän suosikit
  const auth = getAuth(); // Firebase Authentication -instanssi
  const db = getFirestore(); // Firestore-tietokanta

  // Hakee käyttäjän suosikit Firestoresta ja asettaa reaaliaikaisen kuuntelun
  const fetchFavorites = () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const favoritesRef = collection(db, 'favorites'); // Viittaus 'favorites'-kokoelmaan
        const q = query(favoritesRef, where('userId', '==', user.uid)); // Kysely käyttäjän suosikeille

        // Käytetään onSnapshot kuunteluun reaaliaikaisia muutoksia varten
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const favoritesList = [];
          querySnapshot.forEach((docSnapshot) => {
            const favoriteData = { id: docSnapshot.id, ...docSnapshot.data() }; // Tallenna dokumentti
            favoritesList.push(favoriteData);
          });
          setFavorites(favoritesList); // Päivitä tila
        });

        return unsubscribe; // Palautetaan kuuntelija, joka voidaan peruuttaa
      } catch (error) {
        console.error("Error fetching favorites: ", error); // Virheen lokitus
      }
    }
  };

  // Komponentin mount/unmount
  useEffect(() => {
    const unsubscribe = fetchFavorites(); // Aloita kuuntelu
    return () => unsubscribe && unsubscribe(); // Lopeta kuuntelu unmountissa
  }, []);

  // Suosikkien yksittäisen rivin renderöinti
  const renderFavoriteItem = ({ item }) => (
    <View style={styles.movieContainer}>
      {item.posterUrl ? (
        // Näytetään juliste, jos saatavilla
        <Image source={{ uri: item.posterUrl }} style={styles.poster} />
      ) : (
        <Text style={styles.noPoster}>No poster available</Text> // Ilmoitus julisteen puuttuessa
      )}
      <Text style={styles.movieTitle}>{item.movieTitle}</Text> {/* Elokuvan nimi */}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorite Movies</Text>
      {favorites.length > 0 ? (
        // Näytetään suosikit FlatList-komponentilla
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id} // Avain listan riveille
          renderItem={renderFavoriteItem} // Renders elokuvat
        />
      ) : (
        <Text style={styles.noFavorites}>You have no favorite movies yet!</Text> // Viesti, jos ei suosikkeja
      )}
    </View>
  );
}

// Tyylit
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

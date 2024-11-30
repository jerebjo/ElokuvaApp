import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Button } from 'react-native';

const api = process.env.EXPO_PUBLIC_API_KEY; // Ympäristömuuttuja API-avaimelle

export default function MovieSearchScreen({ onSelectMovie }) {
  const [query, setQuery] = useState(''); // Hakukentän tilan hallinta
  const [movies, setMovies] = useState([]); // Hakutulosten tilan hallinta

  const searchMovies = async (text) => {
    setQuery(text); // Päivitetään hakukentän tila
    if (text.length > 2) { // Varmistetaan, että hakusana on riittävän pitkä
      try {
        const response = await fetch(`https://www.omdbapi.com/?s=${text}&type=movie&apikey=${api}`);
        const data = await response.json(); // Parsitaan API:n vastaus
        console.log(data); // Lokitetaan API:n vastaus debuggausta varten
        if (data.Response === "True") {
          setMovies(data.Search); // Päivitetään elokuvat, jos API palautti tuloksia
        } else {
          setMovies([]); // Tyhjennetään lista, jos tuloksia ei löydy
        }
      } catch (error) {
        console.error("Error fetching movies:", error); // Virheen käsittely
      }
    } else {
      setMovies([]); // Hakukentän tyhjennyksen jälkeen tyhjennetään lista
    }
  };

  const handleSearchButtonPress = () => {
    searchMovies(query); // Suorittaa haun TextInputista saadulla hakusanalla
  };

  const handleMovieSelect = (movie) => {
    onSelectMovie(movie); // Siirretään valittu elokuva HomeScreen-komponentille
  };

  return (
    <View style={styles.container}>
      {/* Hakukenttä */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search for a movie..."
        value={query}
        onChangeText={searchMovies}
      />
      {/* Haku-painike */}
      <Button title="Hae" onPress={handleSearchButtonPress} />

      {/* Hakutulosten lista */}
      <FlatList
        data={movies} // Näytettävä data
        keyExtractor={(item) => item.imdbID} // Avain elokuvan IMDb-ID:stä
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMovieSelect(item)}> {/* Valinta-napautus */}
            <Text style={styles.movieTitle}>{item.Title} ({item.Year})</Text> {/* Elokuvan otsikko */}
          </TouchableOpacity>
        )}
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
  searchInput: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    backgroundColor: 'white', 
    marginBottom: 10,
  },
  movieTitle: {
    color: '#ffffff', 
    paddingVertical: 10,
    borderBottomWidth: 1, 
    borderBottomColor: '#444444',
  },
});

import React, {  useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Button } from 'react-native';


const api = process.env.EXPO_PUBLIC_API_KEY;

export default function MovieSearchScreen({ onSelectMovie }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);

 
  
  const searchMovies = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await fetch(`https://www.omdbapi.com/?s=${text}&type=movie&apikey=${api}`);
        const data = await response.json();
        console.log(data); // Lisää lokitus API:n vastaukselle
        if (data.Response === "True") {
          setMovies(data.Search);
        } else {
          setMovies([]);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    } else {
      setMovies([]);
    }
  };
  

  const handleSearchButtonPress = () => {
    searchMovies(query); // Suorittaa haun TextInputista saadulla hakusanalla
  };

 // Tässä varmistetaan, että valitun elokuvan jälkeen siirrytään arvostelulomakkeelle
const handleMovieSelect = (movie) => {
    onSelectMovie(movie); // Siirrytään HomeScreen:iin ja näytetään ReviewForm
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Etsi elokuvaa..."
        value={query}
        onChangeText={searchMovies}
      />
      <Button title="Hae" onPress={handleSearchButtonPress} />
      <FlatList
        data={movies}
        keyExtractor={(item) => item.imdbID}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleMovieSelect(item)}>
            <Text style={styles.movieTitle}>{item.Title} ({item.Year})</Text>
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

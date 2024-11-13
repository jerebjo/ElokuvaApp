import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        displayName: user.displayName || 'Anonymous',
        email: user.email,
        photoURL: user.photoURL || 'https://via.placeholder.com/100', // Placeholder if no photo
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Error signing out: ", error));
  };

  return (
    <View style={styles.container}>
      {userData && (
        <View style={styles.userInfo}>
          <Image source={{ uri: userData.photoURL }} style={styles.profilePic} />
          <Text style={styles.displayName}>{userData.displayName}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      )}

      {/* Navigation Links */}
      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('FavoritesScreen')}>
          <Text style={styles.linkText}>Go to Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('FilmsScreen')}>
          <Text style={styles.linkText}>View Reviewed Films</Text>
        </TouchableOpacity>
      </View>

      {/* Account Management */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333', // Match HomeScreen background color
    padding: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  displayName: {
    fontSize: 20,
    color: '#FFD700', // Match title yellow color
    fontWeight: 'bold',
    marginVertical: 5,
  },
  email: {
    color: '#E0E0E0',
  },
  linksContainer: {
    marginTop: 20,
  },
  linkButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  linkText: {
    color: '#FFD700', // Match link color with yellow
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#8B0000', // Dark red sign-out button
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null); // Käyttäjän tiedot (näyttönimi ja sähköposti)
  const [editingName, setEditingName] = useState(false); // Onko näyttönimen muokkaustila päällä
  const [newDisplayName, setNewDisplayName] = useState(''); // Uusi näyttönimi
  const auth = getAuth(); // Firebase Authentication -instanssi
  const db = getFirestore(); // Firestore-instanssi
  const navigation = useNavigation(); // Navigointiobjekti

  // Hakee käyttäjän tiedot Firebase Authenticationista
  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        displayName: user.displayName || 'Anonymous', // Näyttönimi (tai oletus)
        email: user.email, // Sähköposti
      });
      setNewDisplayName(user.displayName || ''); // Asettaa syötekenttään nykyisen nimen
    }
  };

  // Suoritetaan komponentin alussa
  useEffect(() => {
    fetchUserData();
  }, []);

  // Uloskirjautuminen
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Error signing out: ", error));
  };

  // Näyttönimen päivittäminen Firebaseen
  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (!user) return; // Lopeta, jos käyttäjää ei ole

    try {
      // Päivitetään käyttäjän tiedot Firebase Authenticationiin
      await updateProfile(user, {
        displayName: newDisplayName || user.displayName,
      });

      // Päivitetään Firestore-tietokantaan
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: newDisplayName || user.displayName,
      }, { merge: true }); // Sulautetaan olemassa olevaan dataan

      // Päivityksen jälkeen lopetetaan muokkaustila
      setEditingName(false);
      fetchUserData(); // Päivitetään käyttöliittymän tiedot

      Alert.alert('Profile updated successfully'); // Vahvistusviesti
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error updating profile'); // Virheilmoitus
    }
  };

  return (
    <View style={styles.container}>
      {userData && (
        <View style={styles.userInfo}>
          {/* Näyttönimi ja muokkaus */}
          <View style={styles.displayNameContainer}>
            {editingName ? (
              <TextInput
                style={styles.input}
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                autoFocus // Avaa näppäimistön automaattisesti
              />
            ) : (
              <Text style={styles.displayName}>{userData.displayName}</Text>
            )}
            <TouchableOpacity onPress={() => setEditingName(!editingName)}>
              <Ionicons name="create-outline" size={20} color="#FFD700" style={styles.editIcon} />
            </TouchableOpacity>
          </View>

          {/* Sähköposti */}
          <Text style={styles.email}>{userData.email}</Text>
        </View>
      )}

      {/* Navigointilinkit */}
      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('FavoritesScreen')}>
          <Text style={styles.linkText}>Go to Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('FilmsScreen')}>
          <Text style={styles.linkText}>View Reviewed Films</Text>
        </TouchableOpacity>
      </View>

      {/* Tallennuspainike muokkauksen aikana */}
      {editingName && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Uloskirjautumispainike */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Tyylit
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333', // Tumma tausta
    padding: 20,
    paddingTop: 50,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  displayNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  displayName: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  email: {
    color: '#E0E0E0',
  },
  input: {
    backgroundColor: '#444',
    color: '#FFD700',
    padding: 10,
    borderRadius: 5,
    width: 200,
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 10,
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
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actions: {
    marginTop: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  signOutButton: {
    backgroundColor: '#8B0000',
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

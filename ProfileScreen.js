import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation();

  // Fetch user data from Firebase Auth
  const fetchUserData = () => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        displayName: user.displayName || 'Anonymous',
        email: user.email,
      });
      setNewDisplayName(user.displayName || ''); // Set initial value for name input
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle sign-out
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error("Error signing out: ", error));
  };

  // Handle updating profile data
  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Update Firebase Auth user profile
      await updateProfile(user, {
        displayName: newDisplayName || user.displayName,
      });

      // Also update Firestore with the new info
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName: newDisplayName || user.displayName,
      }, { merge: true });

      // After update, reset editing state
      setEditingName(false);
      fetchUserData(); // Refresh user data

      Alert.alert('Profile updated successfully');
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert('Error updating profile');
    }
  };

  return (
    <View style={styles.container}>
      {userData && (
        <View style={styles.userInfo}>
          {/* Display Name */}
          <View style={styles.displayNameContainer}>
            {editingName ? (
              <TextInput
                style={styles.input}
                value={newDisplayName}
                onChangeText={setNewDisplayName}
                autoFocus
              />
            ) : (
              <Text style={styles.displayName}>{userData.displayName}</Text>
            )}
            <TouchableOpacity onPress={() => setEditingName(!editingName)}>
              <Ionicons name="create-outline" size={20} color="#FFD700" style={styles.editIcon} />
            </TouchableOpacity>
          </View>

          {/* Email */}
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

      {/* Profile Update Action */}
      {editingName && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sign Out */}
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
    backgroundColor: '#333333',
    padding: 20,
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
    marginVertical: 5,
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

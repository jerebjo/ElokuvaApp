// React Native -komponentit ja tarvittavat kirjastot
import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import { FIREBASE_AUTH } from './Firebaseconfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import FavoritesScreen from './FavoritesScreen';
import FilmsScreen from './FilmsScreen';
import Ionicons from '@expo/vector-icons/Ionicons';

// Alustetaan välilehtinavigointi ja pino-navigointi
const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();

// Kirjautumis- ja rekisteröitymissivun komponentti
const AuthScreen = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication }) => {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.authHeader}>{isLogin ? 'Sign in' : 'Sign up'}</Text>

      {/* Sähköpostin syöttökenttä */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      {/* Salasanan syöttökenttä */}
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#ccc"
      />

      {/* Kirjautumis- tai rekisteröitymispainike */}
      <TouchableOpacity style={styles.authButton} onPress={handleAuthentication}>
        <Text style={styles.authButtonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      {/* Vaihto kirjautumisen ja rekisteröitymisen välillä */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Text>
      </View>
    </View>
  );
};

// Profiilisivun pino-navigointi, johon kuuluu linkit suosikit- ja elokuvasivuihin
const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ title: 'Favorites' }} />
      <ProfileStack.Screen name="FilmsScreen" component={FilmsScreen} options={{ title: 'Reviewed Films' }} />
    </ProfileStack.Navigator>
  );
};

// Käyttäjän kirjautunut näkymä, jossa käytössä on välilehtinavigointi
const AuthenticatedScreen = ({ user, handleLogout }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#2a2a2a',
            borderTopWidth: 0,
          },
        })}
      >
        {/* Kotisivu välilehdellä */}
        <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        {/* Profiilisivu välilehdellä */}
        <Tab.Screen name="Profile" component={ProfileStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

// Sovelluksen pääkomponentti
export default App = () => {
  // Tilamuuttujat kirjautumista ja käyttäjän tietoja varten
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  const auth = FIREBASE_AUTH;

  // Tarkkailee käyttäjän kirjautumistilaa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  // Käsittelee kirjautumisen ja rekisteröitymisen
  const handleAuthentication = async () => {
    try {
      if (user) {
        console.log('User logged out successfully!');
        await signOut(auth);
      } else {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
          console.log('User signed in successfully!');
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('User created successfully!');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  // Käsittelee käyttäjän uloskirjautumisen
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); // Nollaa käyttäjätiedot
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      {/* Näyttää joko kirjautumisnäkymän tai autentikoidun näkymän */}
      {user ? (
        <AuthenticatedScreen user={user} handleLogout={handleLogout} />
      ) : (
        <AuthScreen
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          handleAuthentication={handleAuthentication}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333', // App background color
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#333333', // Dark background for the login screen
  },
  authHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // Light text for the header
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: '#555555', // Input background color
    color: 'white', // Text color in input fields
    borderRadius: 5,
    fontSize: 16,
  },
  authButton: {
    width: '100%',
    padding: 15,
    backgroundColor: '#3498db', // Button background color
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  authButtonText: {
    color: '#fff', // Button text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    marginTop: 10,
  },
  toggleText: {
    color: '#bbb', // Lighter text for the toggle
    textAlign: 'center',
  },
});

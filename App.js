import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { FIREBASE_AUTH } from './Firebaseconfig'; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import Ionicons from '@expo/vector-icons/Ionicons'; 



const Tab = createBottomTabNavigator();

const AuthScreen = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication }) => {
  return (
    <View >
      <Text >{isLogin ? 'Sign in' : 'Sign up'}</Text>

      <TextInput
       
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
      />

      <TextInput
        
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <View >
        <Button title={isLogin ? 'Sign In' : 'Sign Up'} onPress={handleAuthentication} color="#3498db" />
      </View>

      <View >
        <Text onPress={() => setIsLogin(!isLogin)}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
        </Text>
      </View>
    </View>
  );
};

const AuthenticatedScreen = ({ user, handleLogout }) => {
  return (
    <NavigationContainer>
      <Tab.Navigator
    screenOptions={({ route }) => ({  // Navigator can be customized using screenOptions
          tabBarIcon: ({ focused, color, size }) => { 
            // Function tabBarIcon is given the focused state,
	    // color and size params
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }

            return <Ionicons name={iconName} size={size} color={color} />;   //it returns an icon component
          },
        })}>
  <Tab.Screen options={{headerShown: false}}name="Home" component={HomeScreen} />
  <Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>

    </NavigationContainer>
  );
};

export default App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); 
  const [isLogin, setIsLogin] = useState(true);

  const auth = FIREBASE_AUTH;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

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

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null); // Reset user after logging out
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
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
    marginTop: 100,
    paddingHorizontal: 20,
  },
});

# ElokuvApp

ElokuvApp on React Native -sovellus, joka yhdistää käyttäjät elokuvien katseluun, arviointiin ja suosikkeihin. Sovelluksen avulla käyttäjät voivat arvioida elokuvia, tallentaa suosikkielokuviaan ja tarkastella omia arvostelujaan. Sovellus käyttää Firebasea käyttäjätunnistukseen, tietokannan hallintaan ja reaaliaikaisiin päivityksiin.

## Käytetyt teknologiat

### 1. **React Native**
React Native on JavaScript-kirjasto, joka mahdollistaa natiivien mobiilisovellusten rakentamisen iOS- ja Android-alustoille yhdellä koodikannalla. Sovelluksen käyttöliittymä on rakennettu React Native -komponenteilla, ja se tarjoaa saumattoman käyttäjäkokemuksen molemmilla alustoilla.

- [React Native](https://reactnative.dev/)
  
### 2. **Firebase**
Firebase on Googlen tarjoama pilvipalvelu, joka tarjoaa reaaliaikaisia tietokantoja, käyttäjien autentikointipalveluja ja paljon muuta. ElokuvApp käyttää seuraavia Firebase-tuotteita:

- **Firebase Authentication**: Käyttäjien rekisteröinti ja sisäänkirjautuminen.
- **Cloud Firestore**: Reaaliaikainen NoSQL-tietokanta, jossa tallennetaan elokuvien arvostelut ja suosikit.
- **Firebase SDK**: Integraatio Firebase-palveluiden kanssa React Native -sovelluksessa.

- [Firebase](https://firebase.google.com/)

### 3. **Expo**
Expo on avoimen lähdekoodin työkalu, joka helpottaa React Native -sovellusten kehittämistä ja käyttöönottoa. Expo tarjoaa valmiiksi määriteltyjä työkaluja ja kirjastoja, jotka auttavat kehittäjää keskittymään itse sovelluksen logiikkaan ilman, että tarvitsee huolehtia natiivien koodin kirjoittamisesta.

- [Expo](https://expo.dev/)

### 4. **React Navigation**
React Navigation on kirjasto, joka tarjoaa komponentteja ja työkaluja mobiilisovellusten navigointiin. Se mahdollistaa siirtymisen eri näkymien välillä sovelluksessa, kuten "Profiili", "Arvostelut" ja "Suosikit" -sivut.

- [React Navigation](https://reactnavigation.org/)

### 5. **Ionicons**
Ionicons on ikonikirjasto, joka tarjoaa kauniita ja helposti integroitavia kuvakkeita React Native -sovelluksille. ElokuvApp käyttää Ioniconsia käyttöliittymäelementeissä, kuten muokkaus- ja poistopainikkeissa.

- [Ionicons](https://ionicframework.com/ionicons)

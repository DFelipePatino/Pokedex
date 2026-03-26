import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Landing from "./landing";
import { TextInput } from "react-native";
import { AnimationController } from "./AnimationController";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

interface Pokemon {
  name: string;
  image: string;
  imageBack: string;
  types: PokemonType[];
}

const LIMIT = 20;

export default function Index() {

  const anim = useRef(new AnimationController()).current;

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showMain, setShowMain] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [showButtonFlag, setShowButtonFlag] = useState(false);
  const [searchedPokemon, setSearchedPokemon] = useState<Pokemon[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // keep class in sync with React state
  anim.showButton = showButton;
  anim.showButtonFlag = showButtonFlag;

  const opacityTransition = (index: number) => {
    anim.opacityTransition(index, () => setIsDark(prev => !prev));
  };

  const handleScroll = ({ nativeEvent }: any) => {
    anim.handleScroll(
      nativeEvent,
      () => setPage(prev => prev + 1),
      loading,
      setShowButton,
      setShowButtonFlag,
    );
  };

  const getButtonStyle = () => {
    if (isDark) return styles.buttonSlateSubtleDark;
    return styles.buttonSlateInfo;
  };

  useEffect(() => {
    AsyncStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    fetchPokemons();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(false);
      setShowMain(true);
    }, 1000);

    const t1 = setTimeout(() => opacityTransition(0), 2800);
    const t2 = setTimeout(() => opacityTransition(4), 3600);

    return () => {
      clearTimeout(timer);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (showMain) {
      anim.startEntryAnimation();
    }
  }, [showMain]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 2000);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchData(debouncedQuery);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (query.length === 0) {
      setSearchedPokemon([]);
      setError(false);
    }
  }, [query]);

  async function fetchPokemons() {
    if (loading) return;
    try {
      setLoading(true);
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${page * LIMIT}`
      );
      const data = await response.json();
      const detailedPokemons: Pokemon[] = await Promise.all(
        data.results.map(async (pokemon: any) => {
          const res = await fetch(pokemon.url);
          const details = await res.json();
          return {
            name: pokemon.name,
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            types: details.types,
          };
        })
      );
      setPokemons(prev => {
        const existingNames = new Set(prev.map(p => p.name));
        const filtered = detailedPokemons.filter(p => !existingNames.has(p.name));
        return [...prev, ...filtered];
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  const fetchData = async (searchText: string) => {
    if (loading) return;
    try {
      setLoading(true);
      setError(false);
      opacityTransition(5);
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${searchText}`
      );
      const data = await response.json();
      const found: Pokemon = {
        name: data.name,
        image: data.sprites.front_default,
        imageBack: data.sprites.back_default,
        types: data.types,
      };
      setSearchedPokemon([found]);
      setError(false);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const buttons = [
    { label: "Master", icon: "medal", action: () => router.push("/about"), color: '#4fd1c5' },
    { label: "Create", icon: "plus-circle", action: () => router.push("/yourPokemon"), color: '#ed8936' },
    { label: "Pokédex", icon: "book-open-variant", action: () => router.push("/savedPokemon"), color: '#63b3ed' },
    {
      label: isDark ? "Light" : "Dark",
      icon: isDark ? "weather-sunny" : "weather-night",
      action: () => opacityTransition(0),
      color: '#a0aec0'
    },
  ];

  return (
    <>
      {!showLanding && (
        <View style={{ flex: 1, height: '100vh' }}>
          <Animated.View style={{ opacity: anim.opacitys[0], flex: 1 }}>

            {showButton && (
              <Animated.View style={[
                isDark ? styles.navContainerDark : styles.navContainer,
                { transform: [{ scale: anim.scales[5] }] }
              ]}>
                {buttons.map((btn, index) => (
                  <Animated.View
                    key={index}
                    style={{
                      opacity: anim.opacitys[index + 1],
                      transform: [{ scale: anim.scales[index + 1] }],
                    }}
                  >
                    <Pressable
                      onPress={btn.action}
                      style={({ pressed }) => [
                        styles.navButton,
                        {
                          backgroundColor: isDark ? '#2d3748' : '#ffffff',
                          transform: [{ scale: pressed ? 0.95 : 1 }]
                        } // Haptic feel
                      ]}
                    >
                      <MaterialCommunityIcons name={btn.icon} size={22} color={btn.color} />
                      <Text style={[styles.navText, { color: isDark ? '#e2e8f0' : '#2d3748' }]}>
                        {btn.label}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            <View style={{
              padding: 20,
              backgroundColor: isDark ? "rgba(26, 26, 26, 0.7)" : "rgba(228, 228, 228, 0.7)",
            }}>
              <TextInput
                placeholder="Search Pokemon by name or number..."
                value={query}
                onChangeText={setQuery}
                placeholderTextColor={isDark ? "#f1f1f1" : "#232323ff"}
                style={{
                  height: 40,
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  backgroundColor: isDark ? "rgba(35, 35, 35, 0.6)" : "rgba(241, 241, 241, 0.6)",
                  color: isDark ? "#f1f1f1" : "#232323ff",
                }}
              />
            </View>

            <ScrollView
              key={1}
              contentContainerStyle={isDark ? styles.containerDark : styles.container}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            >
              {searchedPokemon.length === 0 && query.length === 0 ? (
                pokemons.map((pokemon) => {
                  const mainType = pokemon.types[0].type.name;
                  return (
                    <Animated.View
                      key={pokemon.name}
                      style={{
                        opacity: anim.opacitys[0],
                        flexGrow: 1,
                        transform: [{ scale: anim.scales[0] }],
                      }}
                    >
                      <Link href={{ pathname: "/details", params: { name: pokemon.name } }}>
                        <View style={[styles.card, { backgroundColor: colorsByType[mainType] + "55" }]}>
                          <Text style={styles.name}>{pokemon.name}</Text>
                          <Text style={styles.type}>{mainType}</Text>
                          <View style={styles.imagesRow}>
                            <Image source={{ uri: pokemon.image }} style={styles.image} />
                            <Image source={{ uri: pokemon.imageBack }} style={styles.image} />
                          </View>
                        </View>
                      </Link>
                    </Animated.View>
                  );
                })
              ) : error ? (
                <Text style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: isDark ? "#f1f1f1" : "#232323ff",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 20,
                  flexGrow: 1,
                  alignSelf: "center",
                  minHeight: 650,
                }}>
                  No Pokémon found 😢
                </Text>
              ) : (
                searchedPokemon.map((pokemon) => {
                  const mainType = pokemon.types[0].type.name;
                  return (
                    <Animated.View
                      key={pokemon.name}
                      style={{
                        opacity: anim.opacitys[5],
                        flexGrow: 1,
                        transform: [{ scale: anim.scales[5] }],
                        flex: 1,
                        minHeight: 650,
                      }}
                    >
                      <Link href={{ pathname: "/details", params: { name: pokemon.name } }}>
                        <View style={[styles.card, { backgroundColor: colorsByType[mainType] + "55" }]}>
                          <Text style={styles.name}>{pokemon.name}</Text>
                          <Text style={styles.type}>{mainType}</Text>
                          <View style={styles.imagesRow}>
                            <Image source={{ uri: pokemon.image }} style={styles.image} />
                            <Image source={{ uri: pokemon.imageBack }} style={styles.image} />
                          </View>
                        </View>
                      </Link>
                    </Animated.View>
                  );
                })
              )}

              {loading && (
                <ActivityIndicator
                  size="large"
                  style={{
                    marginVertical: 24,
                    flex: 1,
                    alignSelf: "center",
                    minHeight: 650,
                  }}
                />
              )}
            </ScrollView>

          </Animated.View>
        </View>
      )}

      {showLanding && <Landing />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  containerDark: {
    padding: 16,
    gap: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#232323ff",
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainerDark: {
    backgroundColor: "#232323ff",
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTealAction: {
    backgroundColor: "#A98FF3",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTealActionDark: {
    backgroundColor: "#1e4343ff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBrownSubtle: {
    backgroundColor: "#F7D02C",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonBrownDeepDark: {
    backgroundColor: "#2B211A",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonSlateInfo: {
    backgroundColor: "#705746",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.8,
  },
  buttonSlateInfo2: {
    backgroundColor: "#C22E28",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.8,
  },
  buttonSlateSubtleDark: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.7,
  },
  buttonSlateSubtleDark2: {
    backgroundColor: "#f955865a",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.7,
  },
  textLight: {
    color: "black",
    textAlign: "center",
  },
  textDark: {
    color: "white",
    textAlign: "center",
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    textAlign: "center",
  },
  type: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
    marginBottom: 8,
    textTransform: "capitalize",
    textAlign: "center",
  },
  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  image: {
    width: 150,
    height: 150,
  },
  input: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f1f1f1",
  },

  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glass effect
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 5,
  },
  navContainerDark: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#1a202c',
    borderWidth: 1,
    borderColor: '#2d3748',
  },

  //  backgroundColor: "#232323ff",
  // flexDirection: 'row',
  // flexWrap: 'wrap',
  // gap: 10,
  // alignItems: 'center',
  // justifyContent: 'center',


  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 75,
  },
  navText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

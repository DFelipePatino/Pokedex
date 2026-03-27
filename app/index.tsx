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
      opacityTransition(7);
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
    { label: "Master", icon: "pokemon-go", action: () => router.push("/about"), color: '#4fd1c5' },
    { label: "Create", icon: "pokeball", action: () => router.push("/yourPokemon"), color: '#ed8936' },
    { label: "Pokédex", icon: "format-list-bulleted", action: () => router.push("/savedPokemon"), color: '#63b3ed' },
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

            <Animated.View style={{ transform: [{ scale: anim.scales[6] }] }}>
              <View style={[styles.searchWrapper, isDark ? styles.searchWrapperDark : styles.searchWrapperLight]}>
                <View style={[styles.searchInner, isDark ? styles.searchInnerDark : styles.searchInnerLight]}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    placeholder="Search Pokemon by name or number..."
                    value={query}
                    onChangeText={setQuery}
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
                    selectionColor={isDark ? "#4fd1c5" : "#319795"} // Teal accent color
                    style={[styles.searchInput, { color: isDark ? "#fff" : "#232323" }]}
                  />
                  {query.length > 0 && (
                    <Pressable onPress={() => setQuery('')}>
                      <MaterialCommunityIcons name="close-circle" size={18} color={isDark ? "#fff" : "#888"} />
                    </Pressable>
                  )}
                </View>
              </View>
            </Animated.View>

            <ScrollView
              key={1}
              // Use the new gradient-ready styles
              contentContainerStyle={isDark ? styles.containerDark : styles.container}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={{ flex: 1 }}
            >
              <View style={styles.cardGrid}>
                {(searchedPokemon.length === 0 && query.length === 0 ? pokemons : searchedPokemon)
                  .map((pokemon, index) => {
                    const mainType = pokemon.types[0].type.name;
                    // Logic for unique animation delays if needed
                    const animIndex = query.length === 0 ? 0 : 5;

                    return (
                      <Animated.View
                        key={pokemon.id || pokemon.name}
                        style={{
                          opacity: anim.opacitys[animIndex],
                          transform: [{ scale: anim.scales[animIndex] }],
                          width: '100%', // Cards look better full-width with a slight margin
                        }}
                      >
                        <Link href={{ pathname: "/details", params: { name: pokemon.name } }} asChild>
                          <Pressable>
                            <View style={[
                              styles.card,
                              { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)' },
                              { borderColor: colorsByType[mainType] + "80" }
                            ]}>
                              {/* Glass Highlight Overlay */}
                              <View style={[styles.typeHighlight, { backgroundColor: colorsByType[mainType] }]} />

                              <View style={[styles.cardContent, { backgroundColor: isDark ? colorsByType[mainType] + "80" : colorsByType[mainType] + "55" }]}>
                                <View>
                                  <Text style={[styles.name, { color: isDark ? '#fff' : '#232323' }]}>
                                    {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                                  </Text>
                                  <View style={[styles.typeBadge, { backgroundColor: colorsByType[mainType] }]}>
                                    <Text style={styles.typeText}>{mainType.toUpperCase()}</Text>
                                  </View>
                                </View>

                                <View style={styles.imagesRow}>
                                  <Image source={{ uri: pokemon.image }} style={styles.image} />
                                  <Image source={{ uri: pokemon.imageBack }} style={styles.imageSmall} />
                                </View>
                              </View>
                            </View>
                          </Pressable>
                        </Link>
                      </Animated.View>
                    );
                  })}
              </View>

              {error && query.length > 0 && (
                <View style={styles.centerBox}>
                  <Text style={[styles.errorText, { color: isDark ? "#f1f1f1" : "#232323ff" }]}>
                    No Pokémon found 😢
                  </Text>
                </View>
              )}

              {loading && (
                <ActivityIndicator size="large" color="#ee1515" style={styles.loader} />
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
  // containerDark: {
  //   padding: 16,
  //   gap: 16,
  //   display: "flex",
  //   flexDirection: "column",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#4b0c0cff",
  // },
  containerDark: {
    backgroundColor: "#4b0c0cff",
    padding: 16,
    paddingBottom: 100, // Extra space for bottom nav if exists
    flex: 1,
  },
  cardGrid: {
    gap: 16,
    width: '100%',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    // backgroundColor: "#4b0c0cff",
  },
  typeHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6, // Colorful strip on the left side
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  image: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },
  imageSmall: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginLeft: -20, // Overlap effect
    opacity: 0.8,
  },
  centerBox: {
    minHeight: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 40,
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


  textLight: {
    color: "black",
    textAlign: "center",
  },
  textDark: {
    color: "white",
    textAlign: "center",
  },
  // card: {
  //   padding: 20,
  //   borderRadius: 20,
  // },
  // name: {
  //   fontSize: 28,
  //   fontWeight: "bold",
  //   textTransform: "capitalize",
  //   textAlign: "center",
  // },
  type: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
    marginBottom: 8,
    textTransform: "capitalize",
    textAlign: "center",
  },
  // imagesRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  // },
  // image: {
  //   width: 150,
  //   height: 150,
  // },
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


  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    // This creates the "floating" feel over your background
  },
  searchWrapperDark: {
    backgroundColor: '#232323ff',
  },
  searchWrapperLight: {
    backgroundColor: 'transparent',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50, // Slightly taller for a more premium feel
    borderRadius: 25, // Pill shape
    paddingHorizontal: 15,
    borderWidth: 1,
    // Glassmorphism Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInnerDark: {
    backgroundColor: "rgba(45, 55, 72, 0.8)", // Dark slate glass
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchInnerLight: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Pure white glass
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    height: '100%',
  },
});

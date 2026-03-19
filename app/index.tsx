import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Landing from "./landing";

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
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isHighligted, setIsHighligted] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showMain, setShowMain] = useState(false);

  useEffect(() => {
    fetchPokemons();
  }, [page]);

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

        const filtered = detailedPokemons.filter(
          p => !existingNames.has(p.name)
        );

        return [...prev, ...filtered];
      });

    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  function handleScroll({ nativeEvent }: any) {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - 200;

    if (isCloseToBottom && !loading) {
      setPage(prev => prev + 1);
    }

    const currentY = contentOffset.y;

    if (currentY > lastScrollY && currentY > 50) {
      // scrolling down
      setShowButton(false);
    } else {
      // scrolling up
      setShowButton(true);
    }

    setLastScrollY(currentY);
  }

  const [showButton, setShowButton] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    AsyncStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLanding(false);
      setShowMain(true);
    }, 1000);

    setTimeout(() => {
      opacityTransition();
    }, 2800);

    setTimeout(() => {
      setIsHighligted(true);
    }, 3200);

    setTimeout(() => {
      setIsHighligted(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const scales = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    if (showMain) {
      Animated.stagger(
        200,
        scales.map(scale =>
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [showMain]);


  const getButtonStyle = () => {
    if (isDark && !isHighligted) return styles.buttonSlateSubtleDark;
    if (!isDark && !isHighligted) return styles.buttonSlateInfo;
    // if (!isHighligted) return styles.buttonSlateSubtleDark;
    if (isHighligted && isDark) return styles.buttonSlateSubtleDarkHighligted;
    if (isHighligted && !isDark) return styles.buttonBrownDeepDark;

  };

  const opacityTransition = () => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setIsDark(!isDark);
  };

  const opacity = useRef(new Animated.Value(1)).current;

  const buttons = [
    { label: "Pokemon Master", action: () => router.push("/about"), style: isDark ? styles.buttonTealActionDark : styles.buttonTealAction },
    { label: "Create Your Pokemon", action: () => router.push("/yourPokemon"), style: isDark ? styles.buttonBrownDeepDark : styles.buttonBrownSubtle },
    { label: "My Pokédex", action: () => router.push("/savedPokemon"), style: isDark ? styles.buttonSlateSubtleDark2 : styles.buttonSlateInfo2 },
    {
      label: isDark ? "Light Mode" : "Dark Mode", action: () => { opacityTransition() }
      , style: getButtonStyle(),


    },
  ];


  return (

    <>

      {showButton && !showLanding && (

        <View style={isDark ? styles.buttonsContainerDark : styles.buttonsContainer}>



          {buttons.map((btn, index) => (
            <Animated.View
              key={index}
              style={{ opacity: opacity, flexGrow: 1, transform: [{ scale: scales[index + 1] }] }}
            >
              <Pressable
                style={btn.style}
                onPress={btn.action}
              >
                <Text style={isDark ? styles.textDark : styles.textLight}>
                  {btn.label}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

      )}


      {showLanding ? (
        <>
          <Landing />
        </>
      ) : null}

      {!showLanding ? (

        <ScrollView key={1}
          contentContainerStyle={!isDark ? styles.container : styles.containerDark}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {pokemons.map((pokemon) => {
            const mainType = pokemon.types[0].type.name;

            return (
              <Animated.View key={pokemon.name} style={{ opacity: opacity, flexGrow: 1, transform: [{ scale: scales[0] }] }}>
                <Link
                  href={{
                    pathname: "/details",
                    params: { name: pokemon.name },
                  }}
                >
                  <View
                    style={[
                      styles.card,
                      { backgroundColor: colorsByType[mainType] + "55" },
                    ]}
                  >
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
          })}

          {loading && (
            <ActivityIndicator
              size="large"
              style={{ marginVertical: 24 }}
            />
          )}
        </ScrollView>

      ) : null}



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
    // borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBrownSubtle: {
    backgroundColor: "#F7D02C",
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

  buttonTealActionDark: {
    backgroundColor: "#1e4343ff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonBrownDeepDark: {
    backgroundColor: "#2B211A", // Dark, rich brown base
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    // color: "#E0C8C1" // Much lighter, warmer brown for text
  },
  buttonSlateSubtleDarkHighligted: {
    backgroundColor: "#333", // Dark grey background
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.7,
    borderWidth: 2,
    borderColor: "#87A0BC",
  },
  buttonSlateSubtleDark: {
    backgroundColor: "#333", // Dark grey background
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.7, // Muted presence
    // color: "#87A0BC" // Lighter slate blue for text
  },
  buttonSlateSubtleDark2: {
    backgroundColor: "#f955865a", // Dark grey background
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    opacity: 0.7, // Muted presence
    // color: "#87A0BC" // Lighter slate blue for text
  },

  textLight: {
    color: "black",
    textAlign: "center"
  },

  textDark: {
    color: "white",
    textAlign: "center"
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
});

import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Button,
  Pressable,
} from "react-native";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [isDark, setIsDark] = useState(true);

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


  return (
    <>
      {showButton && (
        <View style={isDark ? styles.buttonsContainerDark : styles.buttonsContainer}>
          <Button color={isDark ? "white" : "black"} title="Pokemon Master" onPress={() => router.push("/about")} />
          <Button color={isDark ? "white" : "black"} title={isDark ? "Light Mode" : "Dark Mode"} onPress={() => setIsDark(!isDark)} />
        </View>
      )}




      <ScrollView
        contentContainerStyle={!isDark ? styles.container : styles.containerDark}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {pokemons.map((pokemon) => {
          const mainType = pokemon.types[0].type.name;

          return (
            <Link
              key={pokemon.name}
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
          );
        })}

        {loading && (
          <ActivityIndicator
            size="large"
            style={{ marginVertical: 24 }}
          />
        )}
      </ScrollView>

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
    gap: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonsContainerDark: {
    backgroundColor: "#232323ff",
    flexDirection: 'row',
    gap: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenButtonsDark: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 80,
    alignItems: 'center',
    justifyContent: 'center',
    color: "white",
    backgroundColor: "#232323ff",
    borderRadius: 20,
    padding: 10,
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

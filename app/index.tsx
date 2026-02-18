import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { colorsByType } from "../constants/colors";

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

      setPokemons(prev => [...prev, ...detailedPokemons]);
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
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
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
                {
                  backgroundColor:
                    colorsByType[mainType] + "55",
                },
              ]}
            >
              <Text style={styles.name}>{pokemon.name}</Text>
              <Text style={styles.type}>{mainType}</Text>

              <View style={styles.imagesRow}>
                <Image
                  source={{ uri: pokemon.image }}
                  style={styles.image}
                />
                <Image
                  source={{ uri: pokemon.imageBack }}
                  style={styles.image}
                />
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
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
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

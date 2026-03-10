import { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Pressable, Modal } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PokemonType {
    type: {
        name: string;
    };
}

interface PokemonMove {
    move: {
        name: string;
        url: string;
    };
}

interface PokemonAbility {
    ability: {
        name: string;
        url: string;
    };
}

interface PokemonLocationAreaEncounters {
    location_area: {
        name: string;
        url: string;
    };
}

interface Pokemon {
    id: number;
    name: string;
    sprites: {
        other: {
            "official-artwork": {
                front_default: string | null;
                front_shiny: string | null;
            };
        };
    };
    types: PokemonType[];
    moves: PokemonMove[];
    abilities: PokemonAbility[];
}

export default function Details() {
    const params = useLocalSearchParams<{ name: string }>();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [locationAreaEncounters, setLocationAreaEncounters] = useState<PokemonLocationAreaEncounters[] | null>(null);
    const [imageVisible, setImageVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (params.name) {
            fetchPokemonByName(params.name);
        }
    }, [params.name]);

    useEffect(() => {
        if (pokemon?.id) {
            fetchLocationAreaEncounters(pokemon.id);
        }
    }, [pokemon?.id]);

    async function fetchPokemonByName(name: string) {
        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${name}`
            );
            const data = await response.json();
            // console.log(data);
            setPokemon(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);

    // console.log(pokemon?.id, 'pokemon id');

    async function fetchLocationAreaEncounters(id: number) {
        try {
            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${id}/encounters`
            );
            const data = await response.json();
            setLocationAreaEncounters(data);
        } catch (error) {
            console.log(error);
        }
    }

    if (!pokemon) {
        return <Text style={{ padding: 16 }}>Loading...</Text>;
    }

    const mainType = pokemon.types[0].type.name;
    const backgroundColor =
        colorsByType[mainType] + 50;

    return (
        <>
            <Stack.Screen
            // options={{
            //     title: pokemon.name,
            // }}
            />

            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: isDark ? "#232323ff" : backgroundColor + "33" }, // soft tint
                ]}
            >
                <View
                    style={[
                        styles.card,
                        { backgroundColor },
                    ]}
                >
                    <Text style={styles.name}>
                        {pokemon.name}
                    </Text>

                    <Text style={styles.type}>
                        {pokemon.types
                            .map(t => t.type.name)
                            .join(", ")}
                    </Text>

                    <View style={styles.imagesRow}>
                        <Pressable onPress={() => setImageVisible(true)}>
                            <Image
                                source={{
                                    uri: pokemon.sprites.other["official-artwork"].front_default ?? undefined,
                                }}
                                style={styles.image}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionTitle}>Where to be found</Text>

                        <View style={styles.infoList}>
                            {locationAreaEncounters === null ? (
                                <Text style={styles.move}>Loading location areas...</Text>
                            ) : locationAreaEncounters.length === 0 ? (
                                <Text style={styles.move}>No location area encounters</Text>
                            ) : (
                                locationAreaEncounters.map((item) => (
                                    <Text
                                        key={item.location_area.name}
                                        style={styles.move}
                                    >
                                        {item.location_area.name.replace("-", " ")}
                                    </Text>
                                ))
                            )}
                        </View>

                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionTitle}>Abilities</Text>

                        <View style={styles.infoList}>
                            {pokemon.abilities.map((item) => (
                                <Text
                                    key={item.ability.name}
                                    style={styles.move}
                                >
                                    {item.ability.name.replace("-", " ")}
                                </Text>
                            ))}
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionTitle}>Moves</Text>

                        <View style={styles.infoList}>
                            {pokemon.moves.map((item) => (
                                <Text
                                    key={item.move.name}
                                    style={styles.move}
                                >
                                    {item.move.name.replace("-", " ")}
                                </Text>
                            ))}
                        </View>
                    </View>

                </View>
            </ScrollView>
            <Modal visible={imageVisible} transparent animationType="fade">
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => setImageVisible(false)}
                >
                    <Image
                        source={{
                            uri: pokemon.sprites.other["official-artwork"].front_default ?? undefined,
                        }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </Pressable>
            </Modal>
        </>
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
        textTransform: "capitalize",
        textAlign: "center",
    },
    imagesRow: {
        // flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
    },
    image: {
        width: 150,
        height: 150,
    },
    infoContainer: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },
    infoList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    move: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.6)",
        textTransform: "capitalize",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.9)",
        justifyContent: "center",
        alignItems: "center",
    },

    fullImage: {
        width: "100%",
        height: "100%",
    },

});

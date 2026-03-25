

import { useEffect, useRef, useState } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function SearchBar() {


    const [searchedPokemon, setSearchedPokemon] = useState([]);
    console.log(searchedPokemon, 'searched pokemon');
    const [query, setQuery] = useState("");
    console.log(query, 'query');
    const [error, setError] = useState(false);
    console.log(error, 'error');
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Runs every time user types
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 2000); // 2 seconds delay

        return () => clearTimeout(timer); // cleanup if user keeps typing
    }, [query]);

    // Runs ONLY after user stops typing for 2 seconds
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


    useEffect(() => {
        if (query.length !== 0) {
            setError(false);
            setLoading(true);
        }
    }, []);

    const fetchData = async (searchText) => {
        if (loading) return;
        try {
            setLoading(true);
            setError(false);
            console.log("Calling API with:", searchText);

            const response = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${searchText}`
            );
            const data = await response.json();
            const searchedPokemon = {
                name: data.name,
                image: data.sprites.front_default,
                imageBack: data.sprites.back_default,
                types: data.types,
            };
            setSearchedPokemon([searchedPokemon]);
            console.log(searchedPokemon, 'searched pokemon');
            setError(false);
        } catch (error) {
            console.error(error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    return (

        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Search..."
                value={query}
                onChangeText={setQuery}
                style={{
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: "#eee",
                    paddingHorizontal: 10,
                }}
            />
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url(wallpaper.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundBlendMode: "overlay",
    },
    input: {
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: "#f1f1f1",
    },
});

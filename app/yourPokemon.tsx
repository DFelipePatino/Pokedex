import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    Modal,
    Keyboard,
    Alert,
} from "react-native";
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import { router, Stack } from "expo-router";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { savePokemonToDB } from "../utils/database";


// The static list of locations you provided
const LOCATION_LIST = [
    "berry forest-area", "bond bridge-area", "cerulean city-area", "five isle-meadow-area",
    "kanto route-1-area", "kanto route-2-north-towards-pewter-city", "kanto route-2-south-towards-viridian-city",
    "kanto route-3-area", "kanto route-4-area", "kanto route-5-area", "kanto route-6-area",
    "kanto route-7-area", "kanto route-8-area", "kanto route-9-area", "kanto route-10-area",
    "kanto route-11-area", "kanto route-12-area", "kanto route-13-area", "kanto route-14-area",
    "kanto route-15-area", "kanto route-16-area", "kanto route-17-area", "kanto route-18-area",
    "kanto route-22-area", "kanto route-23-area", "kanto route-24-area", "kanto route-25-area",
    "kanto route-26-area", "kanto route-27-area", "kanto sea-route-19-area", "kanto sea-route-20-area",
    "kanto sea-route-21-area", "pallet town-area", "pattern bush-area", "viridian forest-area",
    "azalea town-area", "ilex forest-area", "johto route-29-area", "johto route-30-area",
    "johto route-31-area", "johto route-32-area", "johto route-34-area", "johto route-35-area",
    "johto route-36-area", "johto route-37-area", "johto route-38-area", "johto route-39-area",
    "johto safari-zone-zone-forest", "lake of-rage-area", "national park-area", "eterna forest-area",
    "sinnoh route-204-north-towards-floaroma-town", "sinnoh route-204-south-towards-jubilife-city",
    "sinnoh route-229-area", "kalos route-2-area", "kalos route-3-area", "lumiose city-area",
    "santalune forest-area", "alola route-1-east", "alola route-1-south", "alola route-1-west",
    "alola route-2-main", "alola route-5-area", "lush jungle-north", "lush jungle-south",
    "lush jungle-west", "melemele meadow-area", "unknown all-bugs-area"
];


export default function YourPokemon() {
    const [imageVisible, setImageVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [newPokemon, setNewPokemon] = useState({
        name: "",
        type: "",
        whereToFind: [] as any[],
        abilities: [] as any[],
        moves: [] as any[],
    });
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const selectedType = newPokemon.type
        ? newPokemon.type.toLowerCase()
        : 'water';

    const backgroundColor = colorsByType[selectedType] || colorsByType['water'];

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);

    useEffect(() => {
        const { name, type, whereToFind, abilities, moves } = newPokemon;

        // Format the arrays correctly into comma-separated strings for the prompt
        const abilitiesStr = Array.isArray(abilities)
            ? abilities.map((a: any) => typeof a === 'object' ? a.name : a).join(", ")
            : abilities;
        const movesStr = Array.isArray(moves) ? moves.join(", ") : moves;
        const locationsStr = Array.isArray(whereToFind) ? whereToFind.join(", ") : whereToFind;

        // Ensure we actually have content for the AI to generate from
        if (name && type && locationsStr.length > 0 && abilitiesStr.length > 0 && movesStr.length > 0) {
            setPrompt(`${name} is a ${type} pokemon that has the abilities ${abilitiesStr} and moves ${movesStr} in the style of pokemon official artwork`);
        }
    }, [newPokemon]);

    const generateImage = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        if (Keyboard) Keyboard.dismiss();

        const seed = Math.floor(Math.random() * 1000000);
        const myApiKey = process.env.EXPO_PUBLIC_POLLINATIONS_API_KEY || "";
        const models = ["dirtberry", "flux-2-dev", "flux"];
        const randomModel = models[Math.floor(Math.random() * models.length)];

        const url = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=${randomModel}&width=1024&height=1024&seed=${seed}&nologo=true&key=${myApiKey}`;
        setImageUrl(url);
    };


    const [showSuccess, setShowSuccess] = useState(false);

    const handleSavePokemon = async () => {
        const response = await savePokemonToDB({
            name: newPokemon.name,
            type: newPokemon.type,
            whereToFind: newPokemon.whereToFind.map((a: any) => a.name).join(', '),
            abilities: newPokemon.abilities.map((a: any) => a.name).join(', '),
            moves: newPokemon.moves.map((a: any) => a.name).join(', '),
            imageUrl: imageUrl || '',
        });

        if (response.success) {
            setShowSuccess(true);
        } else if (response.duplicate) {
            Alert.alert("Already Saved", "This exact Pokémon is already in your Pokédex!");
        } else {
            Alert.alert("Error", "Could not save to Pokédex.");
        }
    };


    const [formData, setFormData] = useState({
        types: [],
        abilities: [],
        moves: [],
        locations: []
    });

    // console.log(newPokemon, 'new pokemon');

    useEffect(() => {
        const fetchPokemonData = async () => {
            try {
                // 1. Fetch from the 3 endpoints
                // We use limit=1000 for moves/abilities to get everything
                const [typesRes, abilitiesRes, movesRes] = await Promise.all([
                    fetch("https://pokeapi.co/api/v2/type/").then(res => res.json()),
                    fetch("https://pokeapi.co/api/v2/ability/?limit=500").then(res => res.json()),
                    fetch("https://pokeapi.co/api/v2/move/?limit=1000").then(res => res.json())
                ]);

                // 2. Helper function to format API results for dropdowns
                const formatData = (data) => data.results.map(item => ({
                    label: item.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    value: item.name
                }));

                // 3. Format the static location list
                const formattedLocations = LOCATION_LIST.map(loc => ({
                    label: loc.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: loc
                }));

                // 4. Update the state
                setFormData({
                    types: formatData(typesRes),
                    abilities: formatData(abilitiesRes),
                    moves: formatData(movesRes),
                    locations: formattedLocations
                });

            } catch (error) {
                console.error("Error fetching form data:", error);
            }
        };

        fetchPokemonData();
    }, []);


    return (
        <>
            <Stack.Screen options={{ title: imageUrl ? newPokemon.name : "Create" }} />

            <ScrollView
                contentContainerStyle={[
                    styles.aiSection,
                    {
                        backgroundColor: isDark
                            ? backgroundColor
                            : backgroundColor + "33"
                    }
                ]}
            >
                {!imageUrl && !loading ? (
                    /* --- Input Section: Only shows when no image is generated --- */
                    <View style={styles.aiSection}>
                        <Text style={[styles.aiTitle, { color: isDark ? '#fff' : '#000' }]}>
                            Create Your Own Pokemon
                        </Text>

                        {/* NAME - Remains a TextInput */}
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor="#666"
                            value={newPokemon.name}
                            onChangeText={(text) => setNewPokemon({ ...newPokemon, name: text })}
                        />

                        {/* TYPE DROPDOWN */}
                        <Dropdown
                            style={styles.dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            inputSearchStyle={styles.inputSearchStyle}
                            data={formData.types}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Type"
                            searchPlaceholder="Search type..."
                            value={newPokemon.type}
                            onChange={item => setNewPokemon({ ...newPokemon, type: item.value })}
                        />

                        {/* LOCATION DROPDOWN */}
                        <MultiSelect
                            style={styles.dropdown}
                            data={formData.locations}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Location"
                            search
                            value={newPokemon.whereToFind.map((obj: any) => obj.name)}
                            onChange={(selectedStrings: any[]) => {
                                const objectArray = selectedStrings.map(str => ({ name: str }));
                                setNewPokemon({ ...newPokemon, whereToFind: objectArray });
                            }}
                            renderSelectedItem={(item, unSelect) => (
                                <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                                    <View style={styles.selectedStyle}>
                                        <Text style={styles.textSelectedStyle}>{item.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />

                        {/* ABILITIES DROPDOWN */}
                        <MultiSelect
                            style={styles.dropdown}
                            data={formData.abilities}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Abilities"
                            search
                            // 1. IMPORTANT: The value prop needs the raw strings to "highlight" items in the list
                            value={newPokemon.abilities.map(obj => obj.name)}

                            // 2. The onChange transforms the strings into your object structure
                            onChange={selectedStrings => {
                                const objectArray = selectedStrings.map(str => ({
                                    name: str
                                }));
                                setNewPokemon({ ...newPokemon, abilities: objectArray });
                            }}

                            renderSelectedItem={(item, unSelect) => (
                                <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                                    <View style={styles.selectedStyle}>
                                        {/* 3. Dropdown library uses 'label' for the chip display */}
                                        <Text style={styles.textSelectedStyle}>{item.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />

                        {/* MOVES DROPDOWN */}
                        <MultiSelect
                            style={styles.dropdown}
                            data={formData.moves}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Moves"
                            search
                            value={newPokemon.moves.map((obj: any) => obj.name)}
                            onChange={(selectedStrings: any[]) => {
                                const objectArray = selectedStrings.map(str => ({ name: str }));
                                setNewPokemon({ ...newPokemon, moves: objectArray });
                            }}
                            renderSelectedItem={(item, unSelect) => (
                                <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
                                    <View style={styles.selectedStyle}>
                                        <Text style={styles.textSelectedStyle}>{item.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            style={[styles.button, (!prompt || loading) && styles.buttonDisabled]}
                            onPress={generateImage}
                            disabled={loading || !prompt}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Generating..." : "Generate Pokemon"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* --- Result Section: Follows your exact structure --- */
                    <View style={[styles.card, { backgroundColor }]}>
                        <Text style={styles.name}>{newPokemon.name}</Text>
                        <Text style={styles.typeText}>{newPokemon.type}</Text>

                        <View style={styles.imagesRow}>
                            <Pressable onPress={() => setImageVisible(true)} style={styles.imageContainer}>
                                {loading && (
                                    <View style={styles.loaderContainer}>
                                        <ActivityIndicator size="large" color="#fff" />
                                    </View>
                                )}
                                <Image
                                    source={{ uri: imageUrl }}
                                    style={styles.generatedImage}
                                    onLoadEnd={() => setLoading(false)}
                                />
                            </Pressable>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.sectionTitle}>Where to be found</Text>
                            <View style={styles.infoList}>
                                <Text style={styles.moveText}>{newPokemon.whereToFind.map((a: any) => a.name).join(', ')}</Text>
                            </View>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.sectionTitle}>Abilities</Text>
                            <View style={styles.infoList}>
                                <Text style={styles.moveText}>{newPokemon.abilities.map((a: any) => a.name).join(', ')}</Text>
                            </View>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.sectionTitle}>Moves</Text>
                            <View style={styles.infoList}>
                                <Text style={styles.moveText}>{newPokemon.moves.map((a: any) => a.name).join(', ')}</Text>
                            </View>
                        </View>

                        {loading === false ?
                            <TouchableOpacity
                                style={[styles.button, { marginTop: 20, backgroundColor: 'rgba(0,0,0,0.3)' }]}
                                onPress={() => setImageUrl(null)}
                            >
                                <Text style={styles.buttonText}>Create Another</Text>
                            </TouchableOpacity>
                            : null}


                        {loading === false ?
                            <TouchableOpacity
                                style={[styles.button, { marginTop: 10, backgroundColor: '#4CAF50' }]}
                                onPress={handleSavePokemon}
                            >
                                <Text style={styles.buttonText}>Catch Pokemon</Text>
                            </TouchableOpacity>
                            : null}
                    </View>

                )}
            </ScrollView>

            {/* Full Screen Image Modal */}
            <Modal visible={imageVisible} transparent animationType="fade">
                <Pressable style={styles.modalContainer} onPress={() => setImageVisible(false)}>
                    <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
                </Pressable>
            </Modal>

            <Modal
                transparent={true}
                visible={showSuccess}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Image
                            source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                            style={styles.pokeBallIcon}
                        />
                        <Text style={styles.successTitle}>Success!</Text>
                        <Text style={styles.successMessage}>
                            {newPokemon.name} was securely logged into your Pokédex.
                        </Text>
                        <Text style={styles.catchphrase}>Gotta catch 'em all!</Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setShowSuccess(false);
                                router.push("/savedPokemon");
                            }}
                        >
                            <Text style={styles.closeButtonText}>My Pokédex</Text>
                        </TouchableOpacity>


                    </View>
                </View>
            </Modal >
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, flexGrow: 1, justifyContent: 'center' },
    card: { padding: 20, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    name: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: '#fff', textTransform: 'capitalize' },
    typeText: { fontSize: 18, fontWeight: "bold", color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 10, textTransform: 'capitalize' },
    imagesRow: { alignItems: "center", marginVertical: 10 },

    aiSection: { padding: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    aiTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, fontSize: 16 },
    button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#aaa' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    imageContainer: {
        width: 250,
        height: 250,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 125,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    generatedImage: { width: '100%', height: '100%' },
    loaderContainer: { position: 'absolute', zIndex: 2 },

    infoContainer: { marginTop: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: '#fff', marginBottom: 5 },
    infoList: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 15 },
    moveText: { fontSize: 16, color: '#fff' },

    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
    fullImage: { width: "100%", height: "100%" },
    dropdown: {
        height: 50,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#666',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: 'black',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        borderRadius: 8,
    },
    selectedStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: 'white',
        shadowColor: '#000',
        marginTop: 8,
        marginRight: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    textSelectedStyle: {
        marginRight: 5,
        fontSize: 16,
        color: 'black',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Dim the background
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    pokeBallIcon: {
        width: 80,
        height: 80,
        marginBottom: 15,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    successMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 5,
    },
    catchphrase: {
        fontSize: 18,
        fontWeight: '600',
        fontStyle: 'italic',
        color: '#FF0000', // Classic Pokémon Red
        marginVertical: 15,
    },
    closeButton: {
        backgroundColor: '#3B4CCA', // Pokémon Blue
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
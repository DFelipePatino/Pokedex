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

const LOCATION_LIST = [
    // --- Kanto & Sevii Islands ---
    "Viridian Forest",
    "Cerulean City Waterfront",
    "Seafoam Islands (Ice Grotto)",
    "Silph Co. Headquarters",
    "Victory Road (Kanto)",
    "Berry Forest",
    "Bond Bridge Cliffs",
    "Five Isle Meadow",
    "Pattern Bush",
    "Mt. Ember Peak",
    "Pallet Town Lagoon",

    // --- Johto ---
    "Azalea Town (Slowpoke Well)",
    "Ilex Forest Shrine",
    "Lake of Rage",
    "National Park (Bug Contest)",
    "Goldenrod Radio Tower",
    "Johto Safari Zone (Wetlands)",
    "Mt. Silver Foothills",
    "Dragon's Den",

    // --- Sinnoh ---
    "Eterna Forest (Old Chateau)",
    "Floaroma Meadow",
    "Mt. Coronet Summit",
    "Spear Pillar",
    "Sinnoh Route 229 (Tropical Resort)",
    "Sendoff Spring",

    // --- Kalos ---
    "Santalune Forest",
    "Lumiose City Badlands",
    "Tower of Mastery",
    "Azure Bay",
    "Kalos Route 2 (Avance Trail)",

    // --- Alola ---
    "Melemele Meadow",
    "Lush Jungle (Deep Canopy)",
    "Mount Lanakila",
    "Aether Paradise",
    "Exeggutor Island",
    "Hano Grand Resort",

    // --- Special/Rare ---
    "Distortion World Border",
    "Digital Glitch Zone",
    "Unknown Ancient Ruins"
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
        : 'steel';

    const backgroundColor = colorsByType[selectedType] || colorsByType['steel'];

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);

    useEffect(() => {
        const { name, type, whereToFind, abilities, moves } = newPokemon;

        const abilitiesStr = Array.isArray(abilities)
            ? abilities.map((a: any) => typeof a === 'object' ? a.name : a).join(", ")
            : abilities;
        const movesStr = Array.isArray(moves) ? moves.join(", ") : moves;
        const locationsStr = Array.isArray(whereToFind) ? whereToFind.join(", ") : whereToFind;

        if (name && type && locationsStr.length > 0 && abilitiesStr.length > 0 && movesStr.length > 0) {
            setPrompt(`${name} is a ${type} pokemon that is found in ${locationsStr} and has the abilities ${abilitiesStr} and moves ${movesStr}. Create a unique pokemon never seen before in the style of pokemon official artwork located in ${locationsStr}`);
        }
    }, [newPokemon]);

    const randomizePokemon = () => {
        // Wait for formData to be loaded first
        if (!formData.types.length || !formData.abilities.length || !formData.moves.length) return;

        // Random type
        const randomType = formData.types[Math.floor(Math.random() * formData.types.length)];

        // Random locations (1-3)
        const locationCount = Math.floor(Math.random() * 3) + 1;
        const shuffledLocations = [...LOCATION_LIST].sort(() => Math.random() - 0.5);
        const randomLocations = shuffledLocations.slice(0, locationCount).map(loc => ({ name: loc }));

        // Random abilities (1-2)
        const abilityCount = Math.floor(Math.random() * 2) + 1;
        const shuffledAbilities = [...formData.abilities].sort(() => Math.random() - 0.5);
        const randomAbilities = shuffledAbilities.slice(0, abilityCount).map(a => ({ name: a.value }));

        // Random moves (2-4)
        const moveCount = Math.floor(Math.random() * 3) + 2;
        const shuffledMoves = [...formData.moves].sort(() => Math.random() - 0.5);
        const randomMoves = shuffledMoves.slice(0, moveCount).map(m => ({ name: m.value }));

        // Random name from type + random suffix
        const suffixes = ["saur", "zard", "rtle", "puff", "chu", "dex", "vee", "ryu", "gon", "eon"];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomName = randomType.value.charAt(0).toUpperCase() + randomType.value.slice(1) + randomSuffix;

        setNewPokemon({
            name: randomName,
            type: randomType.value,
            whereToFind: randomLocations,
            abilities: randomAbilities,
            moves: randomMoves,
        });
    };


    const generateImage = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        if (Keyboard) Keyboard.dismiss();

        const seed = Math.floor(Math.random() * 1000000);
        const myApiKey = process.env.EXPO_PUBLIC_POLLINATIONS_API_KEY || "";
        const models = ["zimage", "flux"];
        // const randomModel = models[Math.floor(Math.random() * models.length)];
        const randomModel = models[1];

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
                const [typesRes, abilitiesRes, movesRes] = await Promise.all([
                    fetch("https://pokeapi.co/api/v2/type/").then(res => res.json()),
                    fetch("https://pokeapi.co/api/v2/ability/?limit=500").then(res => res.json()),
                    fetch("https://pokeapi.co/api/v2/move/?limit=1000").then(res => res.json())
                ]);


                const formatData = (data) => data.results.map(item => ({
                    label: item.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                    value: item.name
                }));


                const formattedLocations = LOCATION_LIST.map(loc => ({
                    label: loc.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: loc
                }));


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

                    <View style={styles.aiSection}>
                        <Text style={[styles.aiTitle, { color: isDark ? '#fff' : '#000' }]}>
                            Create Your Own Pokemon
                        </Text>


                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor="#666"
                            value={newPokemon.name}
                            onChangeText={(text) => setNewPokemon({ ...newPokemon, name: text })}
                        />


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


                        <MultiSelect
                            style={styles.dropdown}
                            data={formData.abilities}
                            labelField="label"
                            valueField="value"
                            placeholder="Select Abilities"
                            search

                            value={newPokemon.abilities.map(obj => obj.name)}


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
                            style={[styles.button, (loading) && styles.buttonDisabled]}
                            onPress={randomizePokemon}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                Randomize Pokemon
                            </Text>
                        </TouchableOpacity>
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

    aiSection: { padding: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, flex: 1, marginBottom: 300 },
    aiTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, fontSize: 16 },
    button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
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
        marginBottom: 10,
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
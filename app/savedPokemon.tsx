import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Pressable,
    Modal,
    FlatList
} from "react-native";
import { Stack, router } from "expo-router";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedPokemon, deletePokemonFromDB } from "../utils/database";
import { Swipeable } from 'react-native-gesture-handler';

export default function SavedPokemon() {
    const [isDark, setIsDark] = useState(false);
    const [savedList, setSavedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
    const [imageVisible, setImageVisible] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);

    useEffect(() => {
        const fetchSaved = async () => {
            const data = await getSavedPokemon();
            setSavedList(data);
            setLoading(false);
        };
        fetchSaved();
    }, []);

    const renderPokemonItem = ({ item }: { item: any }) => {
        const itemType = item.type ? item.type.toLowerCase() : 'water';
        const cardColor = colorsByType[itemType] || colorsByType['water'];

        return (
            <Swipeable
                renderRightActions={() => (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={async () => {
                            const success = await deletePokemonFromDB(item.id);
                            if (success) {
                                setSavedList(prev => prev.filter(p => p.id !== item.id));
                            }
                        }}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                )}
            >
                <TouchableOpacity
                    style={[styles.listItem, { backgroundColor: cardColor + "44" }]}
                    onPress={() => setSelectedPokemon(item)}
                >
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                    <View style={styles.listTextContainer}>
                        <Text style={styles.listName}>{item.name}</Text>
                        <Text style={styles.listType}>{item.type}</Text>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    const renderSelectedPokemon = () => {
        if (!selectedPokemon) return null;

        const selectedType = selectedPokemon.type ? selectedPokemon.type.toLowerCase() : 'water';
        const backgroundColor = colorsByType[selectedType] || colorsByType['water'];

        return (
            <Modal visible={!!selectedPokemon} animationType="slide">
                <View style={[styles.modalOverlay, { backgroundColor: backgroundColor + "33" }]}>
                    <ScrollView contentContainerStyle={styles.scrollModalContent}>
                        <View style={[styles.card, { backgroundColor: backgroundColor + "33" }]}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setSelectedPokemon(null)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>

                            <Text style={styles.name}>{selectedPokemon.name}</Text>
                            <Text style={styles.typeText}>{selectedPokemon.type}</Text>

                            <View style={styles.imagesRow}>
                                <Pressable onPress={() => setImageVisible(true)} style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: selectedPokemon.imageUrl }}
                                        style={styles.generatedImage}
                                    />
                                </Pressable>
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.sectionTitle}>Where to be found</Text>
                                <View style={styles.infoList}>
                                    <Text style={styles.moveText}>{selectedPokemon.whereToFind}</Text>
                                </View>
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.sectionTitle}>Abilities</Text>
                                <View style={styles.infoList}>
                                    <Text style={styles.moveText}>{selectedPokemon.abilities}</Text>
                                </View>
                            </View>

                            <View style={styles.infoContainer}>
                                <Text style={styles.sectionTitle}>Moves</Text>
                                <View style={styles.infoList}>
                                    <Text style={styles.moveText}>{selectedPokemon.moves}</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>
                <Modal visible={imageVisible} transparent animationType="fade">
                    <Pressable style={styles.modalContainer} onPress={() => setImageVisible(false)}>
                        <Image
                            source={{ uri: selectedPokemon.imageUrl }}
                            style={styles.generatedImage}
                            resizeMode="contain"
                        />
                    </Pressable>
                </Modal>
            </Modal>


        );
    };

    return (
        <>
            <Stack.Screen options={{ title: "My Pokédex" }} />
            <View style={[styles.container, { backgroundColor: isDark ? "#232323" : "#f0f0f0" }]}>
                {loading ? (
                    <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
                ) : savedList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
                            You haven't saved any Pokémon yet!
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push("/yourPokemon")}
                        >
                            <Text style={styles.createButtonText}>Go Create One</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={savedList}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderPokemonItem}
                        contentContainerStyle={styles.listContainer}
                    />
                )}
            </View>

            {renderSelectedPokemon()}

            {/* Full Screen Image Modal */}
            <Modal visible={imageVisible} transparent animationType="fade">
                <Pressable style={styles.fullScreenModal} onPress={() => setImageVisible(false)}>
                    <Image source={{ uri: selectedPokemon?.imageUrl }} style={styles.fullImage} resizeMode="contain" />
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    listContainer: { padding: 16 },
    listItem: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 15,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    thumbnail: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)' },
    listTextContainer: { marginLeft: 15, justifyContent: 'center' },
    listName: { fontSize: 22, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' },
    listType: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' },
    deleteButton: {
        backgroundColor: '#ff3b30',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 15,
        marginBottom: 12,
        marginLeft: 10,
    },
    deleteButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
    createButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
    createButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center' },
    scrollModalContent: { padding: 20, flexGrow: 1, justifyContent: 'center' },

    card: { padding: 20, borderRadius: 25, elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15, position: 'relative' },
    closeButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.2)', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    closeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

    name: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: '#fff', textTransform: 'capitalize', marginTop: 10 },
    typeText: { fontSize: 18, fontWeight: "bold", color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 10, textTransform: 'capitalize' },
    imagesRow: { alignItems: "center", marginVertical: 10 },
    imageContainer: {
        width: 250,
        height: 250,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 125,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    generatedImage: {
        width: "100%",
        height: "100%",
    },
    infoContainer: { marginTop: 20 },
    sectionTitle: { fontSize: 20, fontWeight: "bold", color: '#fff', marginBottom: 5 },
    infoList: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 15 },
    moveText: { fontSize: 16, color: '#fff' },

    fullScreenModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
    fullImage: { width: "100%", height: "100%" },

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
});

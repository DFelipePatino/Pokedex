import React, { useEffect, useState } from "react";
import {
    ActivityIndicator, Image, ScrollView, StyleSheet, Text,
    TouchableOpacity, View, Pressable, Modal, FlatList
} from "react-native";
import { Stack, router } from "expo-router";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedPokemon, deletePokemonFromDB } from "../utils/database";
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

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
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        const data = await getSavedPokemon();
        setSavedList(data);
        setLoading(false);
    };

    const renderPokemonItem = ({ item }: { item: any }) => {
        const itemType = item.type ? item.type.toLowerCase() : 'water';
        const typeColor = colorsByType[itemType] || colorsByType['water'];

        return (
            <Swipeable
                renderRightActions={() => (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={async () => {
                            const success = await deletePokemonFromDB(item.id);
                            if (success) setSavedList(prev => prev.filter(p => p.id !== item.id));
                        }}
                    >
                        <Text style={styles.deleteButtonText}>RELEASE</Text>
                    </TouchableOpacity>
                )}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                        styles.listItem,
                        { backgroundColor: isDark ? typeColor + "80" : typeColor + "55" },
                        { borderColor: typeColor + "55" }
                    ]}
                    onPress={() => setSelectedPokemon(item)}
                >
                    <View style={[styles.typeHighlight, { backgroundColor: typeColor }]} />
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                    <View style={styles.listTextContainer}>
                        <Text style={[styles.listName, { color: isDark ? '#fff' : '#232323' }]}>{item.name}</Text>
                        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                            <Text style={styles.typeBadgeText}>{item.type}</Text>
                        </View>
                    </View>
                    <Text style={{ color: isDark ? '#666' : '#ccc', fontSize: 20 }}>›</Text>
                </TouchableOpacity>
            </Swipeable>
        );
    };

    const renderSelectedPokemon = () => {
        if (!selectedPokemon) return null;
        const typeColor = colorsByType[selectedPokemon.type?.toLowerCase()] || colorsByType['water'];

        return (
            <Modal visible={!!selectedPokemon} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <LinearGradient
                        colors={isDark ? [typeColor, typeColor + "98"] : [typeColor, typeColor + "10"]}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHandle} />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedPokemon(null)}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={[styles.modalName, { color: isDark ? '#fff' : '#232323' }]}>{selectedPokemon.name}</Text>
                            <View style={[styles.typeBadge, { backgroundColor: typeColor, alignSelf: 'center', marginBottom: 20 }]}>
                                <Text style={styles.typeBadgeText}>{selectedPokemon.type}</Text>
                            </View>

                            <Pressable onPress={() => setImageVisible(true)} style={styles.imageContainer}>
                                <View style={[styles.imageCircle, { backgroundColor: typeColor + '20' }]} />
                                <Image
                                    source={{ uri: selectedPokemon.imageUrl }}
                                    style={styles.modalImage}
                                    pointerEvents="none"
                                />
                            </Pressable>

                            {[
                                { title: "Habitat", value: selectedPokemon.whereToFind },
                                { title: "Abilities", value: selectedPokemon.abilities },
                                { title: "Moves", value: selectedPokemon.moves }
                            ].map((section, idx) => (
                                <View key={idx} style={styles.infoSection}>
                                    <Text style={[styles.sectionTitle, { color: typeColor }]}>{section.title}</Text>
                                    <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}>
                                        <Text style={[styles.infoText, { color: isDark ? '#ddd' : '#444' }]}>{section.value || "Not found"}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        <Modal visible={imageVisible} transparent animationType="fade">
                            <Pressable style={styles.fullScreenOverlay} onPress={() => setImageVisible(false)}>
                                <Image
                                    source={{ uri: selectedPokemon.imageUrl }}
                                    style={styles.fullImage}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        </Modal>

                    </LinearGradient>
                </View>
            </Modal>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ title: "My Pokédex" }} />
            <LinearGradient
                colors={isDark ? ['#6e0d0d', '#121212'] : ['#f0f0f0', '#ffffff']}
                style={StyleSheet.absoluteFill}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#ee1515" style={{ marginTop: 50 }} />
            ) : savedList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#666' }]}>Your PC Storage is empty!</Text>
                    <TouchableOpacity style={styles.createButton} onPress={() => router.push("/yourPokemon")}>
                        <Text style={styles.createButtonText}>Start Exploring</Text>
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

            {renderSelectedPokemon()}
        </View>
    );
}

const styles = StyleSheet.create({
    listContainer: { padding: 16, paddingBottom: 40 },
    listItem: {
        flexDirection: 'row',
        borderRadius: 20,
        marginBottom: 16,
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    typeHighlight: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
    thumbnail: { width: 70, height: 70, resizeMode: 'contain', borderRadius: 15 },
    listTextContainer: { flex: 1, marginLeft: 15 },
    listName: { fontSize: 20, fontWeight: '900', textTransform: 'capitalize' },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
    typeBadgeText: { fontSize: 11, color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' },
    deleteButton: { backgroundColor: '#ff3b30', justifyContent: 'center', alignItems: 'center', width: 90, borderRadius: 20, marginBottom: 16, marginLeft: 10 },
    deleteButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
    createButton: { backgroundColor: '#ee1515', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
    createButtonText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { height: '85%', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 20 },
    modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(150,150,150,0.4)', borderRadius: 2, alignSelf: 'center', marginBottom: 10 },
    closeButton: { position: 'absolute', top: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.1)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    closeButtonText: { color: '#888', fontWeight: 'bold' },
    modalName: { fontSize: 30, fontWeight: '900', textAlign: 'center', textTransform: 'capitalize', marginTop: 10 },
    imageContainer: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center' },
    imageCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90 },
    modalImage: { width: 200, height: 200, borderRadius: 70 },
    infoSection: { marginTop: 15 },
    sectionTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginBottom: 5, marginLeft: 5 },
    infoBox: { padding: 15, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    infoText: { fontSize: 15, lineHeight: 22 },
    fullScreenOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
    fullImage: { width: '90%', height: '70%' }
});
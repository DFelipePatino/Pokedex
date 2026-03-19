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
} from "react-native";
import { router, Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from "react-native";


export default function ImageGenerator() {
    const [imageVisible, setImageVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);



    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);



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

    const backgroundColor = "#000000";



    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [hasAccess, setHasAccess] = useState(false);
    const userName = process.env.EXPO_PUBLIC_SECRET_USERNAME;
    const userPassword = process.env.EXPO_PUBLIC_SECRET_PASSWORD;

    const handleLogin = () => {
        if (username === userName && password === userPassword) {
            setHasAccess(true);
        }
    }



    const openLink = () => {
        const url = "https://enter.pollinations.ai/?stripe_success=true&session_id=cs_live_b1uPXSLWNPRcTy2MEbcPzPZQOBnmVBsMfyhgNqeYNNL7CZykGpdSWNjF5d";
        Linking.openURL(url);
    };

    return (
        <>
            <Stack.Screen options={{ title: "Create" }} />

            <ScrollView
                contentContainerStyle={[
                    styles.aiSection,
                    {
                        backgroundColor: backgroundColor + "33"
                    }
                ]}
            >

                {hasAccess ? null : (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.name}>Login</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                <Text style={styles.buttonText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </>

                )}




                <>


                    {hasAccess ? (
                        <>
                            {!imageUrl && !loading ? (
                                <View style={styles.aiSection}>
                                    <Text style={[styles.aiTitle, { color: isDark ? '#fff' : '#000' }]}>
                                        Create Your Own Image
                                    </Text>

                                    <TextInput
                                        style={styles.input}
                                        placeholder="Prompt"
                                        placeholderTextColor="#666"
                                        value={prompt}
                                        onChangeText={(text) => setPrompt(text)}
                                    />


                                    <TouchableOpacity
                                        style={[styles.button, (!prompt || loading) && styles.buttonDisabled]}
                                        onPress={generateImage}
                                        disabled={loading || !prompt}
                                    >
                                        <Text style={styles.buttonText}>
                                            {loading ? "Generating..." : "Generate Image"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                /* --- Result Section: Follows your exact structure --- */
                                <View style={[styles.card, { backgroundColor }]}>

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
                                            style={styles.buttonText}
                                            onPress={openLink}
                                        >
                                            <Text style={styles.buttonText}>Check your pollen</Text>
                                        </TouchableOpacity>
                                        : null}

                                </View>

                            )}
                        </>
                    ) : (
                        null
                    )}

                </>


            </ScrollView>

            {/* Full Screen Image Modal */}
            <Modal visible={imageVisible} transparent animationType="fade">
                <Pressable style={styles.modalContainer} onPress={() => setImageVisible(false)}>
                    <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
                </Pressable>
            </Modal>


        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, flexGrow: 1, justifyContent: 'center' },
    card: { padding: 20, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, alignItems: 'center' },
    name: { fontSize: 32, fontWeight: "bold", textAlign: "center", color: '#fff', textTransform: 'capitalize', width: '100%' },
    typeText: { fontSize: 18, fontWeight: "bold", color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 10, textTransform: 'capitalize' },
    imagesRow: { alignItems: "center", marginVertical: 10 },

    aiSection: { padding: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
    aiTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, fontSize: 16, width: '100%', marginTop: 10 },
    button: { backgroundColor: '#007AFF', padding: 2, borderRadius: 12, alignItems: 'center', width: '100%', marginTop: 10 },
    buttonDisabled: { backgroundColor: '#aaa' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 10, marginBottom: 10, padding: 10 },

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

});
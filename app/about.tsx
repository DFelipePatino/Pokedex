import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Pressable,
    Modal,
} from "react-native";
import { Stack } from "expo-router";
import { colorsByType } from "../constants/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function About() {
    const author = {
        name: "Daniel Felipe Patino",
        role: "Software Developer",
        image: require("../public/about-pic.png"),
        linkedin: "https://www.linkedin.com/in/daniel-patino-207156208/",
        github: "https://github.com/DFelipePatino",
        portfolio: "https://danielpatinoportfolio.onrender.com/",
        description: "I'm a Full Stack Developer with expertise in JavaScript, React, Redux, WordPress, PHP, HTML, CSS, Django, Express, and AWS services. I specialize in creating modern, responsive UIs with Material UI and leveraging AWS for scalable and reliable applications. With a strong commitment to continuous learning and agile methodologies like SCRUM, I excel in both individual and team environments, delivering high-quality solutions efficiently. Let's connect and explore how I can bring value to your next project!",
    };

    const [imageVisible, setImageVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const mainType = 'water';
    const backgroundColor = colorsByType[mainType] + 50;

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);



    return (
        <>
            <Stack.Screen options={{ title: "About" }} />

            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: isDark ? "#232323" : backgroundColor + "33" },
                ]}
            >
                <View style={[styles.card, { backgroundColor }]}>
                    <Text style={styles.name}>{author.name}</Text>
                    <Text style={styles.type}>{author.role}</Text>

                    <View style={styles.imagesRow}>
                        <Pressable onPress={() => setImageVisible(true)}>
                            <Image source={author.image} style={styles.profileImage} />
                        </Pressable>
                    </View>


                    {/* --- Personal Info Sections --- */}
                    <View style={styles.infoContainer}>
                        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Where to be found</Text>
                        <View style={styles.infoList}>
                            <Pressable onPress={() => Linking.openURL(author.linkedin)} style={styles.chip}>
                                <Text style={styles.chipText}>LinkedIn</Text>
                            </Pressable>
                            <Pressable onPress={() => Linking.openURL(author.github)} style={styles.chip}>
                                <Text style={styles.chipText}>GitHub</Text>
                            </Pressable>
                            <Pressable onPress={() => Linking.openURL(author.portfolio)} style={styles.chip}>
                                <Text style={styles.chipText}>Portfolio</Text>
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Abilities</Text>
                        <View style={styles.infoList}>
                            <Text style={{ color: isDark ? '#ddd' : '#333', lineHeight: 22 }}>
                                {author.description}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={imageVisible} transparent animationType="fade">
                <Pressable style={styles.modalContainer} onPress={() => setImageVisible(false)}>
                    <Image source={author.image} style={styles.fullImage} resizeMode="contain" />
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: { padding: 20, borderRadius: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    name: { fontSize: 28, fontWeight: "bold", textAlign: "center" },
    type: { fontSize: 18, fontWeight: "bold", color: "#555", textAlign: "center", padding: 10 },
    imagesRow: { alignItems: "center", marginVertical: 10 },
    profileImage: { width: 150, height: 150, borderRadius: 75 },

    aiSection: { marginTop: 25, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', paddingTop: 20 },
    aiTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#ccc', marginBottom: 10, color: '#000' },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonDisabled: { backgroundColor: '#aaa' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    imageContainer: {
        marginTop: 20,
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)'
    },
    generatedImage: {
        width: '100%',
        height: '100%',
    },
    loaderContainer: {
        position: 'absolute',
        zIndex: 2,
    },

    infoContainer: { marginTop: 24 },
    sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    infoList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.7)" },
    chipText: { fontWeight: '600', color: '#000' },
    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
    fullImage: { width: "100%", height: "100%" },
});
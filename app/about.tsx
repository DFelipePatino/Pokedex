import { useEffect, useState } from "react";
import {
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Pressable, Modal } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
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
    }

    const [imageVisible, setImageVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const mainType = 'water';
    const backgroundColor =
        colorsByType[mainType] + 50;

    useEffect(() => {
        AsyncStorage.getItem('theme').then((value) => {
            setIsDark(value === 'dark');
        });
    }, []);

    return (
        <>
            <Stack.Screen />

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
                        {author.name}
                    </Text>

                    <Text style={styles.type}>
                        {author.role}
                    </Text>

                    <View style={styles.imagesRow}>
                        <Pressable onPress={() => setImageVisible(true)}>
                            <Image
                                source={author.image}
                                style={styles.image}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionTitle}>Where to be found</Text>

                        <View style={styles.infoList}>
                            <Pressable onPress={() => Linking.openURL(author.linkedin)}>
                                <Text style={styles.move}>LinkedIn</Text>
                            </Pressable>
                            <Pressable onPress={() => Linking.openURL(author.github)}>
                                <Text style={styles.move}>GitHub</Text>
                            </Pressable>
                            <Pressable onPress={() => Linking.openURL(author.portfolio)}>
                                <Text style={styles.move}>Portfolio</Text>
                            </Pressable>
                        </View>
                    </View>


                    <View style={styles.infoContainer}>
                        <Text style={styles.sectionTitle}>Abilities</Text>

                        <View style={styles.infoList}>

                            <Text

                            >
                                {author.description}
                            </Text>

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
                        source={author.image}
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
        padding: 16,
    },
    imagesRow: {
        // flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "center",
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 100,
    },
    infoContainer: {
        marginTop: 24,
        // padding: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
        padding: 16,
    },
    infoList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        paddingLeft: 16,
        textAlign: "center",
    },
    move: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.6)",
        textTransform: "capitalize",
        textAlign: "center",
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

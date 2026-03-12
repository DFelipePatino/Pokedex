import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';



export default function Landing() {
    const [isDark, setIsDark] = useState(true);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         router.replace("/");
    //     }, 2000);

    //     return () => clearTimeout(timer);
    // }, []);


    return (
        <>
            <Stack.Screen />

            <ScrollView
                contentContainerStyle={[
                    styles.container,
                    {
                        flexGrow: 1,
                        backgroundColor: isDark ? "#232323ff" : backgroundColor + "33",
                    },
                ]}
            >
                <View

                >
                    <Text style={styles.name}>
                        Welcom to the Pokedex
                    </Text>


                </View>

            </ScrollView>

        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        fontSize: 28,
        fontWeight: "bold",
        textTransform: "capitalize",
        textAlign: "center",
        color: "white",
    },
});

import React from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Landing = () => {
    // Mocking the 'scale' value since it was in your snippet. 
    // If you are using a real animation, this would come from a useRef or prop.
    const scale = new Animated.Value(1);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.animatedContainer, { transform: [{ scale }] }]}>
                <LinearGradient
                    // Pokémon Theme: Classic Red, White, and Blue
                    colors={['#6e0d0d', '#121212']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.textWrapper}>
                            <Text style={styles.name}>Welcome to the Pokedex App</Text>
                            <Image
                                source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png' }}
                                style={styles.pokeBallIcon}
                            />
                            <Text style={styles.subText}>Gotta catch 'em all!</Text>
                        </View>
                    </ScrollView>
                </LinearGradient>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FF0000', // Fallback color
    },
    animatedContainer: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    textWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        // Helps text stand out against the background colors
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: 30,
        borderRadius: 20,
    },
    name: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFDE00',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
    divider: {
        height: 4,
        width: 60,
        backgroundColor: '#FFDE00', // Classic Pokemon Yellow
        marginVertical: 15,
        borderRadius: 2,
    },
    subText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFDE00',
        fontStyle: 'italic',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    pokeBallIcon: {
        width: 80,
        height: 80,
        marginBottom: 15,
    },
});

export default Landing;
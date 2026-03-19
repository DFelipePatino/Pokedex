// utils/database.web.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'generated_pokemon_web_db';

// MUST be a named export to match (export const initDB)
export const initDB = async () => {
    console.log("Web: Storage Initialized via AsyncStorage");
    return true;
};

export const savePokemonToDB = async (pokemon: any) => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        const list = data ? JSON.parse(data) : [];

        // Match your mobile duplicate logic
        const isDuplicate = list.some((p: any) =>
            p.name === pokemon.name && p.imageUrl === pokemon.imageUrl
        );

        if (isDuplicate) return { success: false, duplicate: true };

        const newEntry = {
            ...pokemon,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };

        list.unshift(newEntry);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        return { success: true };
    } catch (error) {
        return { success: false, error: "Web Storage Error" };
    }
};

export const getSavedPokemon = async () => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
};

export const deletePokemonFromDB = async (id: number | string) => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        const list = data ? JSON.parse(data) : [];
        const filtered = list.filter((p: any) => p.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (e) {
        return false;
    }
};
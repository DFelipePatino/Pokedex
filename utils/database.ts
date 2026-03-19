import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('pokedex.db');
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS generated_pokemon (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                whereToFind TEXT,
                abilities TEXT,
                moves TEXT,
                imageUrl TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully!");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export const savePokemonToDB = async (pokemon: {
    name: string, type: string, whereToFind: string, abilities: string, moves: string, imageUrl: string
}) => {
    if (!db) await initDB();
    if (!db) return { success: false, error: "Database not initialized" };
    
    try {
        const existing = await db.getFirstAsync<{id: number}>(
            `SELECT id FROM generated_pokemon WHERE name = ? AND type = ? AND abilities = ? AND moves = ? AND imageUrl = ?`,
            [pokemon.name, pokemon.type, pokemon.abilities, pokemon.moves, pokemon.imageUrl]
        );
        if (existing) {
            return { success: false, duplicate: true };
        }

        const result = await db.runAsync(
            `INSERT INTO generated_pokemon (name, type, whereToFind, abilities, moves, imageUrl) VALUES (?, ?, ?, ?, ?, ?)`,
            [pokemon.name, pokemon.type, pokemon.whereToFind, pokemon.abilities, pokemon.moves, pokemon.imageUrl]
        );
        console.log("Pokemon saved with ID:", result?.lastInsertRowId);
        return { success: true };
    } catch (error) {
        console.error("Error saving Pokemon to DB:", error);
        return { success: false, error: "Database error" };
    }
};

export const getSavedPokemon = async () => {
    if (!db) await initDB();
    if (!db) return [];
    
    try {
        const allRows = await db.getAllAsync(`SELECT * FROM generated_pokemon ORDER BY createdAt DESC`);
        return allRows;
    } catch (error) {
        console.error("Error getting saved Pokemon from DB:", error);
        return [];
    }
};

export const deletePokemonFromDB = async (id: number) => {
    if (!db) await initDB();
    if (!db) return false;
    
    try {
        await db.runAsync(`DELETE FROM generated_pokemon WHERE id = ?`, [id]);
        return true;
    } catch (error) {
        console.error("Error deleting Pokemon from DB:", error);
        return false;
    }
};

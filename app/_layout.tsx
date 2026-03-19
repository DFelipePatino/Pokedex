import { Button } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from "react";
import { initDB } from "../utils/database";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    initDB();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack initialRouteName="landing">
        <Stack.Screen
          name="landing"
          options={{ title: "Landing" }}
        />

        <Stack.Screen
          name="index"
          options={{
            title: "All Pokemons",
            headerStyle: {
              backgroundColor: isDark ? "#232323ff" : "#fff",
            },
            headerTitleStyle: {
              color: "#fff",
            },
          }}
        />

        <Stack.Screen
          name="about"
          options={{
            title: "About",
            headerBackButtonDisplayMode: "minimal",
            presentation: "formSheet",
            sheetAllowedDetents: [0.5, 0.90],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="details"
          options={{
            title: "Details",
            headerBackButtonDisplayMode: "minimal",
            presentation: "formSheet",
            sheetAllowedDetents: [0.5, 1],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="yourPokemon"
          options={{
            title: "Your Pokemon",
            headerStyle: {
              backgroundColor: isDark ? "#232323ff" : "#fff",
            },
            headerTitleStyle: {
              color: "#fff",
            },
            headerBackButtonDisplayMode: "minimal",
            presentation: "formSheet",
            sheetAllowedDetents: [0.5, 1],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="savedPokemon"
          options={{
            title: "My Pokédex",
            headerStyle: {
              backgroundColor: isDark ? "#232323ff" : "#fff",
            },
            headerTitleStyle: {
              color: "#fff",
            },
            headerBackButtonDisplayMode: "minimal",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

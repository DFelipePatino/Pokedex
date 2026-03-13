import { Button } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from "react";



export default function RootLayout() {

  const [isDark, setIsDark] = useState(true);
  // console.log(isDark);

  // useEffect(() => {
  //   AsyncStorage.getItem('theme').then((value) => {
  //     setIsDark(value === 'dark');
  //   });
  // }, [isDark]);






  return (
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
    </Stack>
  );
}

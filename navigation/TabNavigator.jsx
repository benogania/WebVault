import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AllSitesScreen from "../screens/AllSitesScreen";
import DiscoverScreen from "../screens/DiscoverScreen";
import OfflineViewerScreen from "../screens/OfflineViewerScreen";
import OfflineScreen from "../screens/OfflineScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0B0D17",
          borderTopWidth: 0,
          elevation: 0,
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#d946ef",
        tabBarInactiveTintColor: "#64748b",
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home")
            iconName = focused ? "home" : "home-outline";
          else if (route.name === "Discover")
            iconName = focused ? "sparkles" : "sparkles-outline";
          else if (route.name === "Offline Pages")
            iconName = focused ? "document" : "document-outline";
          else if (route.name === "Settings")
            iconName = focused ? "settings" : "settings-outline";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Offline Pages" component={OfflineScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

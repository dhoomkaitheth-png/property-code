import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import AddPropertyScreen from '../screens/AddPropertyScreen';
import SearchScreen from '../screens/SearchScreen';
import AuthScreen from '../screens/AuthScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatConversationScreen from '../screens/ChatConversationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import { COLORS, FONTS } from '../constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon component
const TabIcon = ({ label, focused }) => {
  const icons = {
    'Home': '🏠',
    'Search': '🔍',
    'Favorites': '❤️',
    'Chat': '💬',
    'Notifications': '🔔',
    'Profile': '👤',
    'Add': '➕',
    'Admin': '⚙️',
  };
  return (
    <View style={tabStyles.iconContainer}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconFocused]}>
        {icons[label] || '📄'}
      </Text>
    </View>
  );
};

// Home Tab Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
    <Stack.Screen name="Search" component={SearchScreen} />
    <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
  </Stack.Navigator>
);

// Search Tab Stack
const SearchStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
  </Stack.Navigator>
);

// Favorites Stack
const FavoritesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FavoritesMain" component={FavoritesScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
  </Stack.Navigator>
);

// Chat Stack
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatMain" component={ChatScreen} />
    <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
  </Stack.Navigator>
);

// Notifications Stack
const NotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NotificationsMain" component={NotificationsScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="Auth" component={AuthScreen} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
    <Stack.Screen name="AddProperty" component={AddPropertyScreen} />
  </Stack.Navigator>
);

// Add Property Tab Stack
const AddStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AddPropertyMain" component={AddPropertyScreen} />
  </Stack.Navigator>
);

// Admin Tab Stack
const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminMain" component={AdminScreen} />
  </Stack.Navigator>
);

// Main App Navigator (Splash -> Main Tabs)
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
        <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main Bottom Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.grey,
      tabBarStyle: tabStyles.tabBar,
      tabBarLabelStyle: tabStyles.tabLabel,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} />
    <Tab.Screen name="Search" component={SearchStack} />
    <Tab.Screen name="Favorites" component={FavoritesStack} />
    <Tab.Screen name="Chat" component={ChatStack} />
    <Tab.Screen 
      name="Add" 
      component={AddStack} 
      options={{
        tabBarLabel: 'Add',
        tabBarIcon: ({ focused }) => (
          <View style={tabStyles.addIconContainer}>
            <Text style={tabStyles.addIcon}>+</Text>
          </View>
        ),
      }}
    />
    <Tab.Screen name="Notifications" component={NotificationsStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
    <Tab.Screen name="Admin" component={AdminStack} />
  </Tab.Navigator>
);

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 65,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
  addIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  addIcon: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: '300',
    marginTop: -2,
  },
});

export default AppNavigator;
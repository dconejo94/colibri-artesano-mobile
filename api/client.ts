import axios from "axios";
import { Platform } from "react-native";

// Detect Android emulator vs iOS simulator automatically
const defaultHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${defaultHost}:8000`;

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
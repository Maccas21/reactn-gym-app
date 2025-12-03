import { supabase } from "@/services/supabase";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Button,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { useAuth } from "../(providers)/AuthProvider";

export default function Login() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<"login" | "signup">("login");
	const { session, loading: authLoading } = useAuth();

	// Still restoring session? loader
	if (authLoading) {
		return (
			<View style={styles.loadingOverlay}>
				<ActivityIndicator size={60} color="#007AFF" />
			</View>
		);
	}

	// Already logged in? redirect to home page
	if (session) {
		return <Redirect href="/home" />;
	}

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter both email and password.");
			return;
		}

		setLoading(true);
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		setLoading(false);

		if (error) {
			console.log("Login Error:", error);
			Alert.alert("Login Failed", error.message);
		} else {
			// Redirect immediately after successful login
			router.replace("/(tabs)/home");
		}
	};

	const handleSignUp = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please enter email and password.");
			return;
		}

		setLoading(true);
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});
		setLoading(false);

		if (error) {
			console.log("Signup Error:", error);
			Alert.alert("Sign Up Failed", error.message);
			return;
		}

		Alert.alert("Success", "Account created");
		resetFields();
		setMode("login"); // switch to login
	};

	const handleAnonymousLogin = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signInAnonymously();
			setLoading(false);

			if (error) {
				console.log("Anon Login Error:", error);
				Alert.alert("Error", error.message);
				return;
			}

			router.replace("/(tabs)/home");
		} catch (err) {
			console.log("Unexpected error:", err);
			Alert.alert("Error", "Something went wrong");
			setLoading(false);
		}
	};

	const handleResetPassword = async () => {
		console.log("Reset password button");
		router.push("/resetpassword");
	};

	const resetFields = () => {
		setEmail("");
		setPassword("");
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				{mode === "login" ? "Login" : "Create Account"}
			</Text>

			{/* Toggle Tabs */}
			<View style={styles.toggleContainer}>
				<TouchableOpacity
					style={[
						styles.toggleButton,
						mode === "login" && styles.activeToggle,
					]}
					onPress={() => {
						setMode("login");
						resetFields();
					}}
				>
					<Text
						style={[
							styles.toggleText,
							mode === "login" && styles.activeToggleText,
						]}
					>
						Login
					</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.toggleButton,
						mode === "signup" && styles.activeToggle,
					]}
					onPress={() => {
						setMode("signup");
						resetFields();
					}}
				>
					<Text
						style={[
							styles.toggleText,
							mode === "signup" && styles.activeToggleText,
						]}
					>
						Sign Up
					</Text>
				</TouchableOpacity>
			</View>

			<TextInput
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				style={styles.input}
			/>
			<TextInput
				placeholder="Password"
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				style={styles.input}
			/>

			<Button
				color="#007AFF"
				title={
					loading
						? mode === "login"
							? "Logging in..."
							: "Creating account..."
						: mode === "login"
						? "Login"
						: "Sign Up"
				}
				onPress={mode === "login" ? handleLogin : handleSignUp}
				disabled={loading}
			/>

			<View style={{ marginTop: 10, alignItems: "center" }}>
				<TouchableOpacity onPress={handleResetPassword}>
					<Text style={styles.link}>Forgot Password?</Text>
				</TouchableOpacity>

				<TouchableOpacity onPress={handleAnonymousLogin}>
					<Text style={styles.link}>Use Without Account</Text>
				</TouchableOpacity>
			</View>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size={60} color="#007AFF" />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: "#fff",
	},

	// Toggle container
	toggleContainer: {
		flexDirection: "row",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		overflow: "hidden",
		marginBottom: 20,
	},
	toggleButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		backgroundColor: "#f0f0f0",
	},
	activeToggle: {
		backgroundColor: "#007AFF",
	},
	toggleText: {
		fontSize: 16,
		color: "#333",
	},
	activeToggleText: {
		color: "#fff",
		fontWeight: "bold",
	},

	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.2)", // optional semi-transparent overlay
		justifyContent: "center",
		alignItems: "center",
	},

	title: {
		fontSize: 32,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		marginBottom: 15,
	},
	link: {
		color: "#007AFF",
		textAlign: "center",
		marginTop: 10,
		fontSize: 14,
	},
});

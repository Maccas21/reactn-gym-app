import { useAuth } from "@/src/providers/AuthProvider";
import { useMessage } from "@/src/providers/MessageProvider";
import { supabase } from "@/src/services/supabase";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
	ActivityIndicator,
	Button,
	SegmentedButtons,
	Text,
	TextInput,
	useTheme,
} from "react-native-paper";

export default function Login() {
	const { session, loading: authLoading } = useAuth();
	const router = useRouter();
	const theme = useTheme();
	const { showMessage } = useMessage();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<"login" | "signup">("login");

	// Still restoring session? show loader
	if (authLoading) {
		return (
			<View style={styles.loadingOverlay}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	// Already logged in? redirect
	if (session) {
		return <Redirect href="/home" />;
	}

	const handleLogin = async () => {
		if (!email || !password) {
			showMessage({
				type: "dialog",
				title: "Error",
				message: "Please enter both email and password.",
			});
			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});
		setLoading(false);

		if (error) {
			console.log("Login Error:", error);
			showMessage({
				type: "dialog",
				title: "Login Failed",
				message: error.message,
			});
			return;
		}

		resetFields();
		router.replace("/(tabs)/home");
	};

	const handleSignUp = async () => {
		if (!email || !password) {
			showMessage({
				type: "dialog",
				title: "Error",
				message: "Please enter both email and password",
			});
			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signUp({ email, password });
		setLoading(false);

		if (error) {
			console.log("Signup Error:", error);
			showMessage({
				type: "dialog",
				title: "Sign Up Failed",
				message: error.message,
			});
			return;
		}

		showMessage({
			type: "snackbar",
			message: "Sucess: Account Created",
		});
		resetFields();
	};

	const handleAnonymousLogin = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase.auth.signInAnonymously();
			setLoading(false);

			if (error) {
				console.log("Anon Login Error:", error);
				showMessage({
					type: "dialog",
					title: "Anon Login Error",
					message: error.message,
				});
				return;
			}

			resetFields();
			router.replace("/(tabs)/home");
		} catch (err) {
			console.log("Unexpected error:", err);
			showMessage({
				type: "dialog",
				title: "Unexpected Error",
				message: "Something went wrong",
			});
			resetFields();
			setLoading(false);
		}
	};

	const handleResetPassword = async () => {
		resetFields();
		router.push("/resetpassword");
	};

	const resetFields = () => {
		setEmail("");
		setPassword("");
		setMode("login");
	};

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: theme.colors.background },
			]}
		>
			<Text variant="headlineMedium" style={styles.title}>
				{mode === "login" ? "Login" : "Create Account"}
			</Text>

			{/* Paper Segmented Toggle */}
			<SegmentedButtons
				value={mode}
				onValueChange={(value) => setMode(value as "login" | "signup")}
				buttons={[
					{
						value: "login",
						label: "Login",
					},
					{
						value: "signup",
						label: "Sign Up",
					},
				]}
			/>

			{/* Email */}
			<TextInput
				label="Email"
				value={email}
				onChangeText={setEmail}
				mode="outlined"
				autoCapitalize="none"
				keyboardType="email-address"
			/>

			{/* Password */}
			<TextInput
				label="Password"
				value={password}
				onChangeText={setPassword}
				mode="outlined"
				secureTextEntry
			/>

			{/* Main button */}
			<Button
				mode="contained"
				onPress={mode === "login" ? handleLogin : handleSignUp}
				loading={loading}
				disabled={loading}
			>
				{mode === "login" ? "Login" : "Sign Up"}
			</Button>

			{/* Links */}
			<View>
				<Button
					mode="text"
					onPress={handleResetPassword}
					style={styles.linkButton}
				>
					Forgot Password?
				</Button>

				<Button
					mode="text"
					onPress={handleAnonymousLogin}
					style={styles.linkButton}
				>
					Use Without Account
				</Button>
			</View>

			{/* Loading overlay */}
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 10,
		justifyContent: "center",
	},
	title: {
		textAlign: "center",
	},
	loadingOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.15)",
	},
	linkButton: {
		alignSelf: "center", // removes whitespace on the sides
	},
});

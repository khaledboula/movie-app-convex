import React from "react";
import { View, Text, Input, Button, Pressable, SafeAreaView, ScrollView } from "@/components/ui";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { api } from "@/convex/_generated/api";
import { useAction, useMutation } from "convex/react";
import * as Animatable from "react-native-animatable";
import { useAuth } from "@/hooks/use-auth";
import { Alert, Platform } from "react-native";
import { Logo } from "@/components/logo";

export default function AuthScreen() {
  const router = useRouter();
  const { login: setAuthSession } = useAuth();
  const registerMutation = useMutation(api.users.register);
  const loginMutation = useMutation(api.users.login);
  const sendAuthNotification = useAction(api.notifications.sendAuthNotification);
  
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      (globalThis as any).alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAuth = async () => {
    if (!email || !password || (mode === "register" && !username)) {
      showAlert("Missing Information", "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      let userId;
      const normalizedEmail = email.trim().toLowerCase();
      
      if (mode === "register") {
        userId = await registerMutation({ 
          email: normalizedEmail, 
          username: username.trim(), 
          password 
        });
        showAlert("Success", "Account created successfully!");
      } else {
        userId = await loginMutation({ 
          email: normalizedEmail, 
          password 
        });
      }
      
      if (userId) {
        await setAuthSession(userId);
        
        // Notify admin (Public Action) - Don't await to avoid hanging the UI
        sendAuthNotification({
          type: mode,
          email: normalizedEmail,
          username: mode === "register" ? username.trim() : null,
        }).catch(e => console.warn("Notification skipped", e));
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const msg = error.message || "An error occurred during authentication.";
      showAlert("Authentication Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#050505]">
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80" }}
        className="absolute inset-0 opacity-40"
        contentFit="cover"
      />
      <LinearGradient
        colors={["rgba(5,5,5,0.2)", "rgba(5,5,5,0.8)", "#050505"]}
        className="absolute inset-0"
      />
      
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="px-6 pt-12 pb-20" showsVerticalScrollIndicator={false}>
          <Animatable.View animation="fadeInDown" duration={1000} className="items-center mb-12">
            <Logo size="lg" className="mb-4" />
            <Text className="text-white text-3xl font-bold tracking-tight mb-2">
              {mode === "login" ? "Sign In" : "Register"}
            </Text>
            <Text className="text-white/40 text-sm font-medium">
              Join the Cineverse+ community
            </Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={200} duration={800} className="bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl">
            <View className="gap-4">
              <View>
                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Email</Text>
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Mail size={18} color="#666" />
                  </View>
                  <Input
                    placeholder="email@example.com"
                    value={email}
                    onChangeText={setEmail}
                    className="bg-white text-black border-white/10 h-14 rounded-2xl pl-12 pr-4"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {mode === "register" && (
                <View>
                  <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Username</Text>
                  <View className="relative">
                    <View className="absolute left-4 top-4 z-10">
                      <User size={18} color="#666" />
                    </View>
                    <Input
                      placeholder="username"
                      value={username}
                      onChangeText={setUsername}
                      className="bg-white text-black border-white/10 h-14 rounded-2xl pl-12 pr-4"
                      autoCapitalize="none"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              )}

              <View>
                <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Password</Text>
                <View className="relative">
                  <View className="absolute left-4 top-4 z-10">
                    <Lock size={18} color="#666" />
                  </View>
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    className="bg-white text-black border-white/10 h-14 rounded-2xl pl-12 pr-12"
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="#666" />
                    ) : (
                      <Eye size={18} color="#666" />
                    )}
                  </Pressable>
                </View>
              </View>

              <Button 
                onPress={handleAuth}
                disabled={loading}
                className="bg-primary h-14 rounded-2xl mt-4 flex-row items-center justify-center active:scale-[0.98]"
              >
                <Text className="text-white font-bold text-base mr-2">
                  {loading ? "Processing..." : mode === "login" ? "Sign In" : "Register"}
                </Text>
                {!loading && <ArrowRight size={18} color="white" />}
              </Button>
            </View>

            <Pressable 
              onPress={() => setMode(mode === "login" ? "register" : "login")}
              className="mt-8 self-center"
            >
              <Text className="text-white/40 text-sm">
                {mode === "login" ? "New here? " : "Joined already? "}
                <Text className="text-primary font-bold">{mode === "login" ? "Create Account" : "Sign In"}</Text>
              </Text>
            </Pressable>
          </Animatable.View>

          <View className="mt-12 items-center opacity-20">
            <Text className="text-white text-[10px] font-bold tracking-[6px]">Cineverse+ SECURE</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

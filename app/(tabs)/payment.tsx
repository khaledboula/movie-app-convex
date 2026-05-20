import React from "react";
import { SafeAreaView, ScrollView, View, Text, Button, Card, CardContent, Pressable, Spinner } from "@/components/ui";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, Zap, Shield, Crown } from "lucide-react-native";
import { Image } from "expo-image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Alert, Platform } from "react-native";

const PAYPAL_LOGO = "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg";

export default function PaymentPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const upgrade = useMutation(api.users.upgradeSubscription);
  const [loading, setLoading] = React.useState<string | null>(null);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      (globalThis as any).alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePayment = async (plan: any) => {
    if (!userId) {
      showAlert("Auth Required", "Please sign in to subscribe.");
      return;
    }

    setLoading(plan.id);
    try {
      // Simulate PayPal processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const months = plan.id === "bronze" ? 1 : (plan.id === "silver" ? 6 : 12);
      await upgrade({
        userId,
        plan: plan.id,
        months
      });
      
      showAlert("Success", `You are now a ${plan.name} member!`);
      router.replace("/(tabs)/settings");
    } catch (error) {
      console.error(error);
      showAlert("Error", "Payment failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "bronze",
      name: "Bronze",
      price: "$10",
      period: "per month",
      description: "Basic premium features for casual viewers.",
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      features: ["Ad-free streaming", "HD quality", "1 device at a time"],
      color: "border-amber-700/50",
      bg: "bg-amber-950/20",
      buttonBg: "bg-amber-700"
    },
    {
      id: "silver",
      name: "Silver",
      price: "$25",
      period: "for 6 months",
      description: "Best value for consistent movie lovers.",
      icon: <Shield className="w-8 h-8 text-slate-300" />,
      features: ["Ad-free streaming", "4K quality", "3 devices at a time", "Offline downloads"],
      color: "border-slate-400/50",
      bg: "bg-slate-800/20",
      buttonBg: "bg-slate-500",
      popular: true
    },
    {
      id: "gold",
      name: "Gold",
      price: "$35",
      period: "per year",
      description: "Ultimate experience with maximum benefits.",
      icon: <Crown className="w-8 h-8 text-yellow-400" />,
      features: ["Ad-free streaming", "4K+ HDR quality", "5 devices at a time", "Priority support", "Exclusive content"],
      color: "border-yellow-500/50",
      bg: "bg-yellow-900/20",
      buttonBg: "bg-yellow-600"
    }
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      <View className="flex-row items-center px-6 py-4">
        <Pressable 
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-4"
        >
          <ChevronLeft className="text-white w-6 h-6" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Choose Your Plan</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-4" contentContainerClassName="pb-10">
        <View className="mb-8">
          <Text className="text-gray-400 text-base mb-2">
            Free streaming is limited to 20 minutes. Upgrade now to enjoy unlimited movies and TV shows!
          </Text>
        </View>

        {plans.map((plan) => (
          <Card key={plan.id} className={`mb-6 border-2 ${plan.color} ${plan.bg} overflow-hidden`}>
            {plan.popular && (
              <View className="bg-primary absolute top-0 right-0 px-4 py-1 rounded-bl-xl">
                <Text className="text-white text-[10px] font-bold uppercase">Most Popular</Text>
              </View>
            )}
            <CardContent className="p-6">
              <View className="flex-row items-center mb-4">
                <View className="p-3 rounded-2xl bg-black/40 mr-4">
                  {plan.icon}
                </View>
                <View>
                  <Text className="text-white text-2xl font-black italic uppercase tracking-tighter">{plan.name}</Text>
                  <Text className="text-gray-400 text-sm">{plan.description}</Text>
                </View>
              </View>

              <View className="flex-row items-baseline mb-6">
                <Text className="text-white text-4xl font-black tracking-tighter">{plan.price}</Text>
                <Text className="text-gray-400 ml-2 font-medium">{plan.period}</Text>
              </View>

              <View className="gap-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <View key={idx} className="flex-row items-center">
                    <Check className="w-4 h-4 text-primary mr-3" />
                    <Text className="text-gray-200 text-sm font-medium">{feature}</Text>
                  </View>
                ))}
              </View>

              <Button 
                variant={plan.popular ? "default" : "secondary"}
                className={`h-14 rounded-2xl flex-row items-center justify-center gap-3 ${!plan.popular ? plan.buttonBg : ''}`}
                onPress={() => handlePayment(plan)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <Spinner color="white" />
                ) : (
                  <>
                    <Image 
                      source={{ uri: PAYPAL_LOGO }}
                      contentFit="contain"
                      className="w-20 h-6"
                    />
                    <Text className="text-white font-bold text-base">Pay Now</Text>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}

        <View className="items-center mt-4">
          <Text className="text-gray-500 text-xs text-center">
            By subscribing, you agree to our Terms of Service and Privacy Policy. Your subscription will renew automatically unless cancelled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


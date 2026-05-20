import React from "react";
import { SafeAreaView, View, Text, Pressable, ScrollView, Switch, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui";
import { Image } from "expo-image";
import { LogOut, User, Globe, Heart, Bookmark, ChevronRight, Bell, Trash2, AlertTriangle, Share2, X } from "lucide-react-native";
import { useLanguage } from "@/hooks/use-language";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { Alert, Platform, Share } from "react-native";
import { Logo } from "@/components/logo";

export default function SettingsScreen() {
  const { user, logout, deleteAccount } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [notifications, setNotifications] = React.useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const router = useRouter();

  const showToastMsg = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleShareApp = async () => {
    try {
      const shareUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : 'https://cineverse.plus';
      
      if (Platform.OS === 'web' && navigator.share) {
        try {
          await navigator.share({
            message: `Check out Cineverse+ for the best streaming experience! ${shareUrl}`,
            url: shareUrl,
            title: 'Cineverse+',
          });
          return;
        } catch (err: any) {
          console.log("Navigator share failed", err);
          if (err.name === 'AbortError') return;
        }
      }

      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(shareUrl);
        showToastMsg("Link copied to clipboard!");
      } else {
        await Share.share({
          message: `Check out Cineverse+ for the best streaming experience! ${shareUrl}`,
          url: shareUrl,
          title: 'Cineverse+',
        });
      }
    } catch (error: any) {
      console.error(error);
    }
  };

  const isPremiumUser = user?.email === "sarashowslife@gmail.com";
  const isSubscribed = user?.subscriptionStatus && user.subscriptionStatus !== "none";
  const hasPremium = isPremiumUser || isSubscribed;

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "Français" },
    { code: "ar", name: "العربية" },
  ];

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      router.replace("/auth");
    } catch (error) {
      console.error(error);
      if (Platform.OS === 'web') {
        (globalThis as any).alert("Failed to delete account");
      } else {
        Alert.alert("Error", "Failed to delete account");
      }
    }
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-black">
      {/* Custom Toast Notification */}
      {showToast && (
        <View className="absolute top-10 left-6 right-6 z-[100] bg-red-600 px-6 py-4 rounded-2xl flex-row items-center shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <Text className="text-white font-black italic uppercase tracking-tighter flex-1">{toastMessage}</Text>
          <Pressable onPress={() => setShowToast(false)}>
            <X className="text-white w-5 h-5 ml-4" />
          </Pressable>
        </View>
      )}

      <ScrollView className="flex-1 px-6">
        <Logo size="lg" className="mt-4 mb-8" />
        
        {/* Profile Card */}
        <View className="flex-row items-center mb-8 bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl">
          <View className="w-20 h-20 rounded-full bg-red-600 items-center justify-center mr-4 overflow-hidden border-2 border-red-600/50 p-1">
            <View className="bg-black w-full h-full rounded-full items-center justify-center">
              {user?.image ? (
                <Image source={{ uri: user.image }} className="w-full h-full rounded-full" />
              ) : (
                <User size={32} color="white" />
              )}
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-black italic uppercase tracking-tight">{user?.username || "Explorer"}</Text>
            <Text className="text-gray-500 text-sm font-medium">{user?.email || "premium@cineverse.plus"}</Text>
            <View className={`${hasPremium ? 'bg-red-600/20 border-red-600/30' : 'bg-gray-600/20 border-gray-600/30'} self-start px-3 py-1 rounded-full mt-2 border`}>
              <Text className={`text-[10px] ${hasPremium ? 'text-red-500' : 'text-gray-500'} font-black uppercase tracking-widest`}>
                {hasPremium ? (isPremiumUser ? 'Lifetime Premium' : `${user?.subscriptionStatus} Member`) : 'Free Member'}
              </Text>
            </View>
          </View>
        </View>

        {!hasPremium && (
          <View className="mb-8">
            <Pressable 
              onPress={() => router.push("/(tabs)/payment")}
              className="bg-primary h-16 rounded-[24px] flex-row items-center justify-center shadow-xl shadow-primary/20 active:scale-95 transition-transform"
            >
              <Text className="text-white text-lg font-black uppercase tracking-widest italic">Upgrade to Premium</Text>
            </Pressable>
          </View>
        )}

        {/* Section: App Settings */}
        <Text className="text-red-600 uppercase text-[10px] font-black tracking-[4px] mb-4 ml-1">Configuration</Text>
        
        <View className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden mb-8 shadow-xl">
          <View className="flex-row items-center justify-between p-6 border-b border-white/5">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-blue-600/10 items-center justify-center mr-4 border border-blue-600/20">
                <Bell size={22} color="#2563eb" />
              </View>
              <Text className="text-white font-bold text-lg">Notifications</Text>
            </View>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </View>

          <View className="p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-2xl bg-purple-600/10 items-center justify-center mr-4 border border-purple-600/20">
                <Globe size={22} color="#9333ea" />
              </View>
              <Text className="text-white font-bold text-lg">{t("language")}</Text>
            </View>
            <View className="flex-row gap-2">
              {languages.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => setLocale(lang.code as any)}
                  className={`flex-1 py-3 rounded-2xl border items-center transition-all ${
                    locale === lang.code 
                      ? "bg-red-600 border-red-600 shadow-lg shadow-red-600/20" 
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <Text className={`font-black uppercase tracking-tighter text-xs ${locale === lang.code ? "text-white" : "text-gray-500"}`}>
                    {lang.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Section: Content */}
        <Text className="text-red-600 uppercase text-[10px] font-black tracking-[4px] mb-4 ml-1">Collections</Text>
        <View className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden mb-8 shadow-xl">
          <Pressable className="flex-row items-center justify-between p-6 border-b border-white/5 active:bg-white/10">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-red-600/10 items-center justify-center mr-4 border border-red-600/20">
                <Heart size={22} color="#dc2626" />
              </View>
              <Text className="text-white font-bold text-lg">{t("favorites")}</Text>
            </View>
            <ChevronRight size={20} color="#333" />
          </Pressable>
          <Pressable 
            onPress={handleShareApp}
            className="flex-row items-center justify-between p-6 border-b border-white/5 active:bg-white/10"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-green-600/10 items-center justify-center mr-4 border border-green-600/20">
                <Share2 size={22} color="#16a34a" />
              </View>
              <Text className="text-white font-bold text-lg">Share with Friends</Text>
            </View>
            <ChevronRight size={20} color="#333" />
          </Pressable>
          <Pressable className="flex-row items-center justify-between p-6 active:bg-white/10">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-yellow-600/10 items-center justify-center mr-4 border border-yellow-600/20">
                <Bookmark size={22} color="#ca8a04" />
              </View>
              <Text className="text-white font-bold text-lg">{t("watchlist")}</Text>
            </View>
            <ChevronRight size={20} color="#333" />
          </Pressable>
        </View>

        {/* Section: Danger Zone */}
        <Text className="text-red-600 uppercase text-[10px] font-black tracking-[4px] mb-4 ml-1">Danger Zone</Text>
        <View className="bg-red-600/5 rounded-[32px] border border-red-600/10 overflow-hidden mb-12 shadow-xl">
          <Pressable 
            onPress={() => logout()}
            className="flex-row items-center justify-between p-6 border-b border-red-600/10 active:bg-red-600/10"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center mr-4 border border-white/10">
                <LogOut size={22} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Sign Out</Text>
            </View>
          </Pressable>
          <Pressable 
            onPress={() => setShowDeleteConfirm(true)}
            className="flex-row items-center justify-between p-6 active:bg-red-600/20"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-red-600/20 items-center justify-center mr-4 border border-red-600/30">
                <Trash2 size={22} color="#dc2626" />
              </View>
              <Text className="text-red-600 font-bold text-lg">Delete Account</Text>
            </View>
          </Pressable>
        </View>

        <View className="items-center opacity-20 mb-20">
          <Text className="text-white text-[10px] font-black tracking-[6px] italic">Cineverse+ SECURE</Text>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-black border border-white/10 rounded-[40px] p-8 max-w-[90%] self-center">
          <DialogHeader className="items-center">
            <View className="w-20 h-20 bg-red-600/20 rounded-full items-center justify-center mb-6 border border-red-600/30">
              <AlertTriangle size={40} color="#dc2626" />
            </View>
            <DialogTitle className="text-white text-3xl font-black italic uppercase tracking-tighter text-center">
              Wait, Explorer!
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-center text-base font-medium mt-4 leading-relaxed">
              Are you sure you want to delete your Cineverse+ account? This will permanently erase your watchlist, history, and favorites. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-3 mt-8">
            <Button 
              onPress={handleDeleteAccount}
              className="bg-red-600 h-14 rounded-2xl w-full flex-row items-center justify-center"
            >
              <Text className="text-white font-black uppercase tracking-widest">Delete Permanently</Text>
            </Button>
            <Button 
              variant="outline" 
              onPress={() => setShowDeleteConfirm(false)}
              className="bg-white/5 border-white/10 h-14 rounded-2xl w-full"
            >
              <Text className="text-white font-black uppercase tracking-widest">Keep My Account</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SafeAreaView>
  );
}

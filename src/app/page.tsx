"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  Utensils, 
  XCircle, 
  Info,
  Activity, 
  Apple, 
  Fish, 
  Wheat, 
  Clock,
  Droplets,
  Heart,
  AlertTriangle,
  Coffee,
  Sun,
  Moon,
  Sunset,
  Check,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  History,
  Share2,
  TrendingUp,
  Save,
  LogIn,
  LogOut,
  User,
  Loader2
} from "lucide-react";

interface MealCategory {
  name: string;
  items: string;
  options: string[];
}

interface MealSuggestion {
  timeRange: string;
  title: string;
  icon: React.ReactNode;
  categories: MealCategory[];
}

interface TrackerRecord {
  id: string;
  date: string;
  time: string;
  context: string;
  value: string;
  timestamp: number;
}

const mealData: Record<string, MealSuggestion> = {
  very_early: {
    timeRange: "খুব সকালে (ঘুম থেকে ওঠার পর)",
    title: "ডিটক্স পানি",
    icon: <Droplets className="h-6 w-6 text-blue-400" />,
    categories: [
      { name: "পানীয়", items: "১ গ্লাস হালকা কুসুম গরম পানি।", options: ["কুসুম গরম পানি", "মেথি-ভেজানো পানি", "দারুচিনি পানি", "চিয়া সিড পানি"] }
    ]
  },
  breakfast: {
    timeRange: "সকাল (৮:০০ - ৮:৩০)",
    title: "সকালের নাস্তা",
    icon: <Sun className="h-6 w-6 text-orange-400" />,
    categories: [
      { name: "শর্করা", items: "লাল আটার পাতলা রুটি বা ডালিয়া।", options: ["২টি লাল আটার রুটি", "ওটস (চিনি ছাড়া)", "ডালিয়া খিচুড়ি", "যবের ছাতু"] },
      { name: "সবজি", items: "অল্প তেলে রান্না করা মিক্সড সবজি।", options: ["লাউ ভাজি", "পেঁপে ভাজি", "কাঁকরোল ভাজি", "পটল ভাজি", "করলা ভাজি", "ঝিঙে সবজি"] },
      { name: "প্রোটিন", items: "ডিমের সাদা অংশ বা পনির (অল্প)।", options: ["১টি ডিমের সাদা অংশ", "২টি ডিমের সাদা অংশ", "অল্প পনির (লো-ফ্যাট)"] }
    ]
  },
  mid_morning: {
    timeRange: "মধ্য দুপুর (১১:০০ - ১১:৩০)",
    title: "হালকা খাবার (মিস করবেন না)",
    icon: <Apple className="h-6 w-6 text-green-400" />,
    categories: [
      { name: "ফল", items: "টক জাতীয় বা কম মিষ্টির ফল।", options: ["পেয়ারা", "আমড়া", "বাতাবি লেবু", "আপেল", "নাশপাতি", "ড্রাগন ফল", "মাল্টা"] },
      { name: "বিকল্প", items: "সুগার ফ্রি বিস্কুট বা মুড়ি।", options: ["মেরি বিস্কুট (সুগার ফ্রী)", "এক মুষ্টি মুড়ি", "শসা"] }
    ]
  },
  lunch: {
    timeRange: "দুপুর (১:৩০ - ২:০০)",
    title: "দুপুরের খাবার",
    icon: <Utensils className="h-6 w-6 text-emerald-500" />,
    categories: [
      { name: "শর্করা", items: "লাল চালের ভাত (পরিমাণমতো)।", options: ["১ কাপ লাল চালের ভাত", "১.৫ কাপ লাল চালের ভাত"] },
      { name: "সবজি", items: "প্রচুর পরিমাণে শাক ও সবজি।", options: ["লাল শাক", "পালং শাক", "কলমি শাক", "পটল", "কাঁকরোল", "ঝিঙে", "শসা-টমেটো সালাদ"] },
      { name: "প্রোটিন", items: "মাছ বা চামড়া ছাড়া মুরগির মাংস।", options: ["মাছ (১ টুকরো)", "মুরগির মাংস (২ টুকরো)", "সামুদ্রিক মাছ"] },
      { name: "ডাল", items: "১ কাপ পাতলা ডাল।", options: ["পাতলা ডাল (১ কাপ)", "মুগ ডাল (অল্প)"] }
    ]
  },
  evening: {
    timeRange: "বিকাল (৫:০০ - ৫:৩০)",
    title: "বিকালের নাস্তা",
    icon: <Sunset className="h-6 w-6 text-orange-500" />,
    categories: [
      { name: "পানীয়", items: "চিনি ছাড়া চা বা তোকমা পানি।", options: ["রঙ চা (চিনি ছাড়া)", "দুধ চা (চিনি ছাড়া)", "তোকমা দানা পানি"] },
      { name: "স্ন্যাকস", items: "বাদাম বা সিদ্ধ ছোলা।", options: ["ভাজা ছোলা", "কাঠবাদাম", "আখরোট", "সিদ্ধ ছোলা", "মরিচ-মুড়ি (অল্প)"] }
    ]
  },
  dinner: {
    timeRange: "রাত (৮:৩০ - ৯:০০)",
    title: "রাতের খাবার",
    icon: <Moon className="h-6 w-6 text-indigo-400" />,
    categories: [
      { name: "শর্করা", items: "লাল আটার রুটি (ভাতের বদলে)।", options: ["২টি লাল আটার রুটি", "অল্প ভাত"] },
      { name: "সবজি", items: "সবজি বা সজনে ডাটা।", options: ["করলা ভাজি", "ঝিঙে ভাজি", "পেঁপে ভাজি", "সজনে ডাটা সবজি", "চাল কুমড়ো", "ধুন্দল"] },
      { name: "প্রোটিন", items: "১ টুকরো মাছ।", options: ["মাছ (১ টুকরো)", "মুরগির মাংস (১ টুকরো)"] }
    ]
  },
  before_sleep: {
    timeRange: "ঘুমানোর আগে (১০:৩০ - ১১:০০)",
    title: "জরুরি স্ন্যাকস (ইনসুলিন নিলে এটি জরুরি)",
    icon: <Coffee className="h-6 w-6 text-purple-400" />,
    categories: [
      { name: "পানীয়/স্ন্যাকস", items: "ফ্যাট-ফ্রি দুধ বা অল্প বিস্কুট।", options: ["হাফ কাপ দুধ", "১-২টি বিস্কুট", "২টি আখরোট"] }
    ]
  }
};

const getInsight = (value: number, context: string) => {
  const isFasting = context === "খালি পেটে";
  
  if (isFasting) {
    if (value < 4.0) return { status: "low", label: "নিম্ন", color: "text-amber-600", bg: "bg-amber-50", advice: "দ্রুত ১ চামচ চিনি বা গ্লুকোজ খান। খাবার গ্রহণ করুন।" };
    if (value <= 6.1) return { status: "good", label: "সঠিক", color: "text-emerald-600", bg: "bg-emerald-50", advice: "আপনার সুগার লেভেল নিয়ন্ত্রণে আছে। নিয়মিত ডায়েট অনুসরণ করুন।" };
    if (value <= 6.9) return { status: "warning", label: "প্রি-ডায়াবেটিস", color: "text-orange-600", bg: "bg-orange-50", advice: "মিষ্টি জাতীয় খাবার এড়িয়ে চলুন এবং ৩০ মিনিট হাঁটুন।" };
    return { status: "bad", label: "উচ্চ", color: "text-red-600", bg: "bg-red-50", advice: "প্রচুর পানি পান করুন এবং শর্করা জাতীয় খাবার এড়িয়ে চলুন। চিকিৎসকের পরামর্শ নিন।" };
  } else {
    if (value < 4.4) return { status: "low", label: "নিম্ন", color: "text-amber-600", bg: "bg-amber-50", advice: "সুগার অনেক কমে গেছে। দ্রুত কিছু খেয়ে নিন।" };
    if (value <= 7.8) return { status: "good", label: "সঠিক", color: "text-emerald-600", bg: "bg-emerald-50", advice: "খাবার পরবর্তী সুগার লেভেল ঠিক আছে। সচল থাকুন।" };
    if (value <= 11.0) return { status: "warning", label: "সতর্কতা", color: "text-orange-600", bg: "bg-orange-50", advice: "পরের বেলা খাবারে ভাতের পরিমাণ কমিয়ে দিন। ২০ মিনিট হাঁটুন।" };
    return { status: "bad", label: "অত্যধিক উচ্চ", color: "text-red-600", bg: "bg-red-50", advice: "অতিরিক্ত শর্করা পরিহার করুন। প্রয়োজনে চিকিৎসকের সাথে যোগাযোগ করুন।" };
  }
};

export default function DiabeticDietApp() {
  const [time, setTime] = useState<Date | null>(null);
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedRoutineKey, setExpandedRoutineKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"diet" | "tracker" | "info">("diet");
  const [graphRange, setGraphRange] = useState<"day" | "week" | "month">("day");
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingAge, setOnboardingAge] = useState("");

  // Tracker State
  const [records, setRecords] = useState<TrackerRecord[]>([]);
  const [newValue, setNewValue] = useState("");
  const [newContext, setNewContext] = useState("খালি পেটে");
  const [newDate, setNewDate] = useState("");
  const [mounted, setMounted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setTime(now);
    setNewDate(now.toISOString().split('T')[0]);
    const timer = setInterval(() => setTime(new Date()), 60000);
    
    // Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setRecords([]);
        setLoading(false);
      }
    });

    return () => {
      clearInterval(timer);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) setProfile(data);
      fetchRecords(userId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (userId: string) => {
    const { data, error } = await supabase
      .from('sugar_records')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });

    if (data) {
      const formatted: TrackerRecord[] = data.map(r => ({
        id: r.id,
        date: new Date(r.recorded_at).toLocaleDateString("bn-BD"),
        time: new Date(r.recorded_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
        context: r.context,
        value: r.value.toString(),
        timestamp: new Date(r.recorded_at).getTime()
      }));
      setRecords(formatted);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        toast.success("লগইন সফল হয়েছে!");
        setShowAuth(false);
      }
    } catch (e: any) {
      toast.error(e.message || "ভুল হয়েছে!");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboarding = async () => {
    if (!onboardingName || !onboardingAge) {
      toast.error("সব তথ্য পূরণ করুন");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          name: onboardingName, 
          age: parseInt(onboardingAge) 
        });
      if (error) throw error;
      setProfile({ id: user.id, name: onboardingName, age: parseInt(onboardingAge) });
      toast.success("প্রোফাইল সেভ হয়েছে!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info("লগ আউট করা হয়েছে");
  };

  const chartData = useMemo(() => {
    const sortedRecords = [...records].sort((a, b) => a.timestamp - b.timestamp);
    const now = new Date();
    
    if (graphRange === "day") {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const filtered = sortedRecords.filter(r => r.timestamp >= todayStart);
      const displayData = filtered.length > 0 ? filtered : sortedRecords.slice(-10);
      return displayData.map(r => ({
        name: r.time,
        value: parseFloat(r.value),
        date: r.date,
        context: r.context
      }));
    } else {
      const days = graphRange === "week" ? 7 : 30;
      const cutoff = now.getTime() - (days * 24 * 60 * 60 * 1000);
      const filtered = sortedRecords.filter(r => r.timestamp >= cutoff);
      
      const groupedByDay: Record<string, { sum: number; count: number; dateStr: string }> = {};
      
      filtered.forEach(r => {
        const dateKey = new Date(r.timestamp).toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
        if (!groupedByDay[dateKey]) {
          groupedByDay[dateKey] = { sum: 0, count: 0, dateStr: dateKey };
        }
        groupedByDay[dateKey].sum += parseFloat(r.value);
        groupedByDay[dateKey].count += 1;
      });
      
      return Object.values(groupedByDay).map(d => ({
        name: d.dateStr,
        value: parseFloat((d.sum / d.count).toFixed(1)),
        date: d.dateStr,
        context: "গড়"
      }));
    }
  }, [records, graphRange]);

  const stats = useMemo(() => {
    const now = new Date();
    let filteredRecords = records;
    
    if (graphRange === "week") {
      const cutoff = now.getTime() - (7 * 24 * 60 * 60 * 1000);
      filteredRecords = records.filter(r => r.timestamp >= cutoff);
    } else if (graphRange === "month") {
      const cutoff = now.getTime() - (30 * 24 * 60 * 60 * 1000);
      filteredRecords = records.filter(r => r.timestamp >= cutoff);
    } else {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      filteredRecords = records.filter(r => r.timestamp >= todayStart);
      if (filteredRecords.length === 0) filteredRecords = records.slice(0, 10);
    }

    if (filteredRecords.length === 0) return { avg: 0, max: 0, min: 0 };
    const values = filteredRecords.map(r => parseFloat(r.value)).filter(v => !isNaN(v));
    if (values.length === 0) return { avg: 0, max: 0, min: 0 };
    return {
      avg: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)),
      max: Math.max(...values),
      min: Math.min(...values)
    };
  }, [records, graphRange]);

  const addRecord = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    const numericValue = parseFloat(newValue);
    if (!newValue || isNaN(numericValue)) {
      toast.error("অনুগ্রহ করে সঠিক সুগারের পরিমাণ লিখুন");
      return;
    }
    
    const selected = new Date(newDate || new Date().toISOString().split('T')[0]);
    const now = new Date();
    const finalDate = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate(),
      now.getHours(),
      now.getMinutes()
    );

    try {
      const { data, error } = await supabase
        .from('sugar_records')
        .insert({
          user_id: user.id,
          value: numericValue,
          context: newContext,
          recorded_at: finalDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      const record: TrackerRecord = {
        id: data.id,
        date: finalDate.toLocaleDateString("bn-BD"),
        time: now.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
        context: newContext,
        value: newValue,
        timestamp: finalDate.getTime()
      };
      setRecords([record, ...records]);
      setNewValue("");
      toast.success("রেকর্ড সফলভাবে সেভ করা হয়েছে!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase.from('sugar_records').delete().eq('id', id);
      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
      setConfirmDeleteId(null);
      toast.info("রেকর্ড মুছে ফেলা হয়েছে");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const shareRecords = () => {
    if (records.length === 0) {
      toast.error("শেয়ার করার জন্য কোনো রেকর্ড নেই");
      return;
    }
    const text = records.map(r => `${r.date} (${r.time}) - ${r.context}: ${r.value} mmol/L`).join("\n");
    const shareText = `${profile?.name ? profile.name + "-র" : "মা-র"} ডায়াবেটিস রিপোর্ট:\n\n${text}\n\nগড় সুগার: ${stats.avg} mmol/L`;
    
    if (navigator.share) {
      navigator.share({ title: "ডায়াবেটিস রিপোর্ট", text: shareText }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("রিপোর্ট কপি করা হয়েছে!");
    }
  };

  const toggleItem = (categoryName: string, option: string) => {
    setSelectedItems(prev => {
      const current = prev[categoryName] || [];
      if (current.includes(option)) {
        return { ...prev, [categoryName]: current.filter(i => i !== option) };
      } else {
        return { ...prev, [categoryName]: [...current, option] };
      }
    });
  };

  const getCurrentMealKey = () => {
    if (!time) return "breakfast";
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const currentTimeVal = hours * 100 + minutes;

    if (currentTimeVal >= 500 && currentTimeVal < 800) return "very_early";
    if (currentTimeVal >= 800 && currentTimeVal < 1100) return "breakfast";
    if (currentTimeVal >= 1100 && currentTimeVal < 1330) return "mid_morning";
    if (currentTimeVal >= 1330 && currentTimeVal < 1700) return "lunch";
    if (currentTimeVal >= 1700 && currentTimeVal < 2030) return "evening";
    if (currentTimeVal >= 2030 && currentTimeVal < 2230) return "dinner";
    return "before_sleep";
  };

  const currentMeal = mealData[getCurrentMealKey()];

  const formatTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  if (!mounted || !time) {
    return <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center"><Loader2 className="h-8 w-8 text-emerald-600 animate-spin" /></div>;
  }

  // Onboarding UI
  if (user && !profile && !loading) {
    return (
      <div className="min-h-screen bg-emerald-50/30 p-6 flex items-center justify-center font-sans">
        <Card className="w-full max-w-md rounded-3xl border-2 border-emerald-100 shadow-xl overflow-hidden">
          <CardHeader className="bg-emerald-600 text-white p-6 text-center">
            <User className="h-12 w-12 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold">স্বাগতম!</CardTitle>
            <p className="text-emerald-100 text-sm mt-2">অ্যাপটি শুরু করার আগে আপনার তথ্য দিন</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">নাম (উদা: মা)</label>
                <input 
                  value={onboardingName} 
                  onChange={(e) => setOnboardingName(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-emerald-500 font-bold"
                  placeholder="আপনার নাম লিখুন"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">বয়স</label>
                <input 
                  type="number"
                  value={onboardingAge} 
                  onChange={(e) => setOnboardingAge(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-emerald-500 font-bold"
                  placeholder="আপনার বয়স লিখুন"
                />
              </div>
            </div>
            <button 
              onClick={handleOnboarding}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "শুরু করুন"}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-24 font-sans antialiased">
      {/* Auth Modal Overlay */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-md rounded-3xl border-none shadow-2xl overflow-hidden">
            <div className="bg-emerald-600 p-8 text-white text-center">
              <LogIn className="h-10 w-10 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">{isSignUp ? "নতুন অ্যাকাউন্ট" : "লগইন করুন"}</h2>
              <p className="text-emerald-100 text-xs mt-2">আপনার ডাটা নিরাপদে সেভ রাখতে লগইন প্রয়োজন</p>
            </div>
            <CardContent className="p-8 space-y-4">
              <input 
                type="email" 
                placeholder="ইমেইল" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-emerald-500 font-bold"
              />
              <input 
                type="password" 
                placeholder="পাসওয়ার্ড" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-emerald-500 font-bold"
              />
              <button 
                onClick={handleAuth}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? "সাইন আপ" : "লগইন")}
              </button>
              <div className="text-center">
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm text-emerald-600 font-bold hover:underline"
                >
                  {isSignUp ? "পুরানো অ্যাকাউন্ট আছে? লগইন করুন" : "অ্যাকাউন্ট নেই? নতুন খুলুন"}
                </button>
              </div>
              <button onClick={() => setShowAuth(false)} className="w-full text-zinc-400 text-xs font-bold pt-2">পরে করব</button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-emerald-600 px-6 py-8 text-white shadow-lg rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">সুস্থ {profile?.name || "মা"}</h1>
            <p className="text-sm font-light text-emerald-100 opacity-90">ডায়াবেটিক ডায়েট গাইড (বাংলাদেশ)</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="text-xs font-bold">{formatTime(time)}</span>
            </div>
            <div className="flex gap-2">
              {user ? (
                <button onClick={handleSignOut} className="bg-white/20 p-2 rounded-xl backdrop-blur-sm text-emerald-100 hover:bg-white/30">
                  <LogOut className="h-5 w-5" />
                </button>
              ) : (
                <button onClick={() => setShowAuth(true)} className="bg-white text-emerald-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">লগইন</button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-8 p-6 -mt-6">
        {activeTab === "diet" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Current Meal Suggestion */}
            <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-emerald-600 text-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    {currentMeal.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">{currentMeal.timeRange}</span>
                </div>
                <CardTitle className="text-2xl font-bold">{currentMeal.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {currentMeal.categories.map((cat, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{cat.name}</h4>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-zinc-800 font-medium leading-relaxed mb-3">{cat.items}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => toggleItem(cat.name, opt)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              (selectedItems[cat.name] || []).includes(opt)
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                : "bg-white text-zinc-500 border-zinc-200 hover:border-emerald-200"
                            }`}
                          >
                            {(selectedItems[cat.name] || []).includes(opt) && <Check className="inline-block h-3 w-3 mr-1" />}
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

              {/* Daily Routine Summary */}
              <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm space-y-6">
                <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  সারাদিনের খাবারের রুটিন
                </h3>
                <div className="space-y-6">
                  {(Object.keys(mealData) as Array<keyof typeof mealData>).map((key) => {
                    const meal = mealData[key];
                    const colors: Record<string, string> = {
                      very_early: "bg-blue-400",
                      breakfast: "bg-orange-400",
                      mid_morning: "bg-green-400",
                      lunch: "bg-emerald-500",
                      evening: "bg-orange-500",
                      dinner: "bg-indigo-400",
                      before_sleep: "bg-purple-400"
                    };
                    const summaries: Record<string, string> = {
                      very_early: "১ গ্লাস কুসুম গরম পানি বা মেথি/দারুচিনি পানি (সুগার নিয়ন্ত্রণে সাহায্য করে)।",
                      breakfast: "লাল আটার রুটি বা ডালিয়া, মিক্সড সবজি এবং ১টি ডিমের সাদা অংশ (সেদ্ধ বা ভাজি)।",
                      mid_morning: "যেকোনো ১টি টক ফল (পেয়ারা/আপেল/নাশপাতি) অথবা সুগার ফ্রি বিস্কুট / মুড়ি।",
                      lunch: "পরিমাণমতো লাল চালের ভাত, প্রচুর শাক-সবজি, মাছ বা মুরগি এবং পাতলা ডাল।",
                      evening: "চিনি ছাড়া চা সাথে অল্প ভাজা ছোলা বা কাঠবাদাম/আখরোট। তেলে ভাজা খাবার বর্জনীয়।",
                      dinner: "লাল আটার রুটি, করলা ভাজি বা সজনে ডাটা সবজি এবং ১ টুকরো মাছ।",
                      before_sleep: "হাফ কাপ ফ্যাট-ফ্রি দুধ অথবা ১-২টি বিস্কুট (রাতে সুগার কমে যাওয়া রোধে জরুরি)।"
                    };
                    
                    return (
                      <MealRow 
                        key={key}
                        time={meal.timeRange}
                        title={meal.title}
                        items={summaries[key]}
                        color={colors[key]}
                        isActive={expandedRoutineKey === key}
                        onClick={() => setExpandedRoutineKey(expandedRoutineKey === key ? null : key)}
                        categories={meal.categories}
                        selectedItems={selectedItems}
                        onToggleItem={toggleItem}
                      />
                    );
                  })}
                </div>
              </div>

            <section>
              <Tabs defaultValue="safe" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-zinc-100/80 p-1.5 rounded-2xl h-14 border border-zinc-200 shadow-inner">
                  <TabsTrigger value="safe" className="rounded-xl text-md data-[state=active]:bg-white data-[state=active]:text-emerald-700">উপকারী খাবার</TabsTrigger>
                  <TabsTrigger value="avoid" className="rounded-xl text-md data-[state=active]:bg-white data-[state=active]:text-red-600">বর্জনীয় খাবার</TabsTrigger>
                </TabsList>
                <TabsContent value="safe" className="mt-6 space-y-4">
                  <FoodItem icon={<Wheat className="text-emerald-600" />} title="শর্করা" description="লাল চাল, লাল আটা, ওটস, ডালিয়া, যব, বার্লি।" />
                  <FoodItem icon={<Activity className="text-emerald-600" />} title="সবজি" description="লাউ, পেঁপে, ফুলকপি, করলা, ঝিঙে, পটল, কাঁকরোল, চাল কুমড়ো, ধুন্দল।" />
                  <FoodItem icon={<Apple className="text-emerald-600" />} title="আঁশযুক্ত ও ফল" description="ঢেঁড়স, সজনে ডাটা, পেয়ারা, আমড়া, বাতাবি লেবু, আপেল, নাশপাতি, ড্রাগন ফল।" />
                  <FoodItem icon={<Fish className="text-emerald-600" />} title="প্রোটিন" description="মাছ, চামড়া ছাড়া মুরগি, ডিমের সাদা অংশ, বাদাম, লো-ফ্যাট দুধ।" />
                </TabsContent>
                <TabsContent value="avoid" className="mt-6 space-y-4">
                  <FoodItem icon={<XCircle className="text-red-500" />} title="মিষ্টি ও ফ্যাট" description="চিনি, গুড়, মধু, গ্লুকোজ, মিষ্টি, ঘি, মাখন, ডালডা, ডালডা-জাত খাবার।" />
                  <FoodItem icon={<XCircle className="text-red-500" />} title="উচ্চ চর্বি আমিষ" description="গরু-খাসির মাংস, হাঁসের মাংস, কলিজা, মগজ, ডিমের কুসুম, বড় চিংড়ি।" />
                  <FoodItem icon={<XCircle className="text-red-500" />} title="উচ্চ শর্করা ও ভাজা" description="সাদা চাল, ময়দা, আলু, মিষ্টি আলু, গাজর, পরোটা, ভাজাপোড়া (সিঙ্গারা, পুরি), কোমল পানীয়।" />
                </TabsContent>
              </Tabs>
            </section>
          </div>
        )}

        {activeTab === "tracker" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Range Selector */}
            <div className="flex bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200 shadow-inner">
              {(["day", "week", "month"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setGraphRange(range)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                    graphRange === range 
                      ? "bg-white text-emerald-700 shadow-sm" 
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {range === "day" ? "দিন" : range === "week" ? "সপ্তাহ" : "মাস"}
                </button>
              ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="গড়" value={stats.avg} icon={<Activity className="h-4 w-4 text-emerald-600" />} />
              <StatCard label="সর্বোচ্চ" value={stats.max} icon={<TrendingUp className="h-4 w-4 text-red-500" />} />
              <StatCard label="সর্বনিম্ন" value={stats.min} icon={<Droplets className="h-4 w-4 text-blue-500" />} />
            </div>

            {/* Chart */}
            {records.length > 1 && (
              <Card className="rounded-3xl border-none shadow-lg overflow-hidden bg-white p-4">
                <div className="h-64 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: "700", fill: "#64748b" }}
                        dy={10}
                        interval={graphRange === "month" ? 5 : 0}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fontWeight: "700", fill: "#94a3b8" }}
                        domain={[0, 'dataMax + 2']}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: "1.25rem", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
                        labelStyle={{ color: "#64748b", fontWeight: "bold", marginBottom: "4px" }}
                        formatter={(value: any) => [`${value} mmol/L`, "সুগার"]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#059669" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Input Section */}
            <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-zinc-900 text-white p-6">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Save className="h-5 w-5 text-emerald-400" />
                  নতুন রিপোর্ট যোগ করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">তারিখ</label>
                    <input 
                      type="date" 
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-100 focus:outline-none focus:border-emerald-500 font-bold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">সময়/অবস্থা</label>
                    <select 
                      value={newContext}
                      onChange={(e) => setNewContext(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-100 focus:outline-none focus:border-emerald-500 font-bold text-sm appearance-none"
                    >
                      <option>খালি পেটে</option>
                      <option>নাস্তার পর</option>
                      <option>দুপুরের পর</option>
                      <option>রাতের পর</option>
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="সুগারের পরিমাণ (mmol/L)" 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full p-4 pr-20 rounded-2xl bg-zinc-50 border-2 border-zinc-100 focus:outline-none focus:border-emerald-500 font-black text-xl placeholder:text-zinc-300 placeholder:font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400 text-xs">mmol/L</span>
                </div>
                <button 
                  onClick={addRecord}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  সেভ করুন
                </button>
              </CardContent>
            </Card>

            {/* History List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                  <History className="h-4 w-4 text-emerald-600" />
                  পুরানো রিপোর্ট
                </h3>
                <button onClick={shareRecords} className="text-emerald-600 font-bold text-sm flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <Share2 className="h-3.5 w-3.5" />
                  শেয়ার
                </button>
              </div>
              
              <div className="space-y-3">
                {records.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-zinc-100">
                    <Activity className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
                    <p className="text-zinc-400 font-medium text-sm">কোনো রিপোর্ট পাওয়া যায়নি</p>
                  </div>
                ) : (
                  records.map((record) => (
                    <div key={record.id} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg ${
                          getInsight(parseFloat(record.value), record.context).bg} ${getInsight(parseFloat(record.value), record.context).color}`}>
                          {record.value}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-zinc-300 uppercase">{record.date}</span>
                            <span className="h-1 w-1 rounded-full bg-zinc-200" />
                            <span className="text-[10px] font-black text-zinc-300 uppercase">{record.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-zinc-800">{record.context}</h4>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase border border-current ${getInsight(parseFloat(record.value), record.context).color}`}>
                              {getInsight(parseFloat(record.value), record.context).label}
                            </span>
                          </div>
                        </div>
                      </div>
                      {confirmDeleteId === record.id ? (
                        <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
                          <button 
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-zinc-100 text-zinc-500"
                          >
                            না
                          </button>
                          <button 
                            onClick={() => deleteRecord(record.id)}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-red-600 text-white shadow-sm"
                          >
                            হ্যাঁ
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(record.id)}
                          className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "info" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Summary */}
            <Card className="rounded-3xl border-none shadow-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.name || "মা"}</h2>
                    <p className="text-emerald-100 text-sm opacity-80">{profile?.age || "--"} বছর</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">লক্ষ্য (খালি পেটে)</p>
                    <p className="font-bold text-sm">৪.৪ - ৬.১ mmol/L</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Insight */}
            {records.length > 0 && (
              <Card className={`rounded-3xl border-none shadow-xl overflow-hidden ${getInsight(parseFloat(records[0].value), records[0].context).bg} transition-all duration-500`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-bold text-lg ${getInsight(parseFloat(records[0].value), records[0].context).color}`}>সর্বশেষ রিপোর্টের বিশ্লেষণ</h3>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getInsight(parseFloat(records[0].value), records[0].context).bg} ${getInsight(parseFloat(records[0].value), records[0].context).color} border border-current`}>
                      {getInsight(parseFloat(records[0].value), records[0].context).label}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${getInsight(parseFloat(records[0].value), records[0].context).bg} shadow-inner`}>
                        <Activity className={`h-5 w-5 ${getInsight(parseFloat(records[0].value), records[0].context).color}`} />
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-0.5 opacity-70">আপনার বর্তমান অবস্থা</p>
                        <p className="text-zinc-800 font-bold text-sm leading-snug">
                          {records[0].context}-এ সুগারের পরিমাণ {records[0].value} mmol/L, যা {getInsight(parseFloat(records[0].value), records[0].context).label}।
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
                        <Heart className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-0.5 opacity-70">কি করবেন?</p>
                        <p className="text-zinc-800 font-medium text-sm leading-relaxed">
                          {getInsight(parseFloat(records[0].value), records[0].context).advice}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="font-bold text-zinc-800 px-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                জরুরি সতর্কতা
              </h3>
              <div className="grid gap-3">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <h4 className="font-bold text-amber-800 text-sm mb-1">সুগার কমে গেলে (হাইপোগ্লাইসেমিয়া)</h4>
                  <p className="text-amber-700 text-xs leading-relaxed">অতিরিক্ত ঘাম, বুক ধড়ফড়, বা মাথা ঘুরলে দ্রুত ১ চামচ চিনি বা গ্লুকোজ খান।</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <h4 className="font-bold text-blue-800 text-sm mb-1">নিয়মিত হাঁটা</h4>
                  <p className="text-blue-700 text-xs leading-relaxed">প্রতিদিন অন্তত ৩০ মিনিট দ্রুত হাঁটার চেষ্টা করুন।</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm space-y-6">
              <h3 className="font-bold text-zinc-800 flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                প্রতিদিনের খাবারের রুটিন
              </h3>
              <div className="space-y-6">
                {(Object.keys(mealData) as Array<keyof typeof mealData>).map((key) => {
                  const meal = mealData[key];
                  const colors: Record<string, string> = {
                    very_early: "bg-blue-400",
                    breakfast: "bg-orange-400",
                    mid_morning: "bg-green-400",
                    lunch: "bg-emerald-500",
                    evening: "bg-orange-500",
                    dinner: "bg-indigo-400",
                    before_sleep: "bg-purple-400"
                  };
                    const summaries: Record<string, string> = {
                      very_early: "১ গ্লাস কুসুম গরম পানি বা মেথি/দারুচিনি পানি।",
                      breakfast: "লাল আটার রুটি বা ডালিয়া, মিক্সড সবজি এবং ১টি ডিমের সাদা অংশ।",
                      mid_morning: "যেকোনো ১টি টক ফল (পেয়ারা/আপেল/নাশপাতি) অথবা সুগার ফ্রি বিস্কুট / মুড়ি।",
                      lunch: "পরিমাণমতো লাল চালের ভাত, প্রচুর শাক-সবজি, মাছ বা মুরগি এবং পাতলা ডাল।",
                      evening: "চিনি ছাড়া চা সাথে অল্প ছোলা বা বাদাম।",
                      dinner: "লাল আটার রুটি এবং করলা ভাজি বা সজনে ডাটা সবজি ও মাছ।",
                      before_sleep: "হাফ কাপ ফ্যাট-ফ্রি দুধ অথবা ১-২টি বিস্কুট।"
                    };
                  
                  return (
                    <MealRow 
                      key={key}
                      time={meal.timeRange}
                      title={meal.title}
                      items={summaries[key]}
                      color={colors[key]}
                      isActive={expandedRoutineKey === key}
                      onClick={() => setExpandedRoutineKey(expandedRoutineKey === key ? null : key)}
                      categories={meal.categories}
                      selectedItems={selectedItems}
                      onToggleItem={toggleItem}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm">

              <h3 className="font-bold text-zinc-800 mb-4">জীবনযাত্রা</h3>
              <ul className="space-y-3">
                {[
                  "পর্যাপ্ত পানি পান করুন (দৈনিক ৮-১০ গ্লাস)।",
                  "একটানা বসে না থেকে সচল থাকুন।",
                  "মানসিক চাপ মুক্ত থাকার চেষ্টা করুন।",
                  "নির্দিষ্ট সময়ে খাবার গ্রহণ করুন।"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-xs text-zinc-500 leading-relaxed">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {user && (
              <button 
                onClick={handleSignOut}
                className="w-full py-4 rounded-2xl border-2 border-red-50 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                লগ আউট করুন
              </button>
            )}
          </div>
        )}


        <footer className="pt-6 pb-12 text-center space-y-4">
          <div className="inline-block p-4 bg-emerald-100/50 rounded-2xl border border-emerald-200"><p className="text-sm text-emerald-800 font-medium">সুস্থতা কাম্য</p></div>
          <p className="text-xs text-zinc-400 px-8 leading-relaxed italic">* চিকিৎসকের পরামর্শ অনুযায়ী তৈরি।</p>
        </footer>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-zinc-100 px-8 py-4 flex justify-around items-center z-20">
        <NavItem icon={<Utensils className="h-6 w-6" />} label="ডায়েট" active={activeTab === "diet"} onClick={() => setActiveTab("diet")} />
        <NavItem icon={<Activity className="h-6 w-6" />} label="ট্র্যাকার" active={activeTab === "tracker"} onClick={() => setActiveTab("tracker")} />
        <NavItem icon={<Info className="h-6 w-6" />} label="তথ্য" active={activeTab === "info"} onClick={() => setActiveTab("info")} />
      </nav>
    </div>
  );
}

function MealRow({ 
  time, 
  title, 
  items, 
  color,
  isActive,
  onClick,
  categories,
  selectedItems,
  onToggleItem
}: { 
  time: string, 
  title: string, 
  items: string, 
  color: string,
  isActive?: boolean,
  onClick?: () => void,
  categories?: MealCategory[],
  selectedItems?: Record<string, string[]>,
  onToggleItem?: (cat: string, opt: string) => void
}) {
  return (
    <div 
      className={`relative pl-6 border-l-2 transition-all duration-300 cursor-pointer ${isActive ? 'border-emerald-500' : 'border-zinc-100'}`}
      onClick={onClick}
    >
      <div className={`absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full transition-all duration-300 ${color} ${isActive ? 'scale-125 shadow-sm' : ''}`} />
      <div className="flex items-center justify-between group">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">{time}</p>
          <h4 className={`font-bold text-base mb-1 transition-colors ${isActive ? 'text-emerald-700' : 'text-zinc-900'}`}>{title}</h4>
        </div>
        {isActive ? <ChevronUp className="h-4 w-4 text-zinc-300" /> : <ChevronDown className="h-4 w-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      
      {!isActive && <p className="text-zinc-600 leading-relaxed text-sm line-clamp-2">{items}</p>}
      
      {isActive && categories && (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
           <p className="text-zinc-800 font-medium leading-relaxed text-sm mb-4">{items}</p>
           {categories.map((cat, idx) => (
             <div key={idx} className="space-y-2">
               <div className="flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-emerald-400" />
                 <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{cat.name}</h5>
               </div>
               <div className="flex flex-wrap gap-1.5">
                 {cat.options.map((opt, oIdx) => (
                   <button
                     key={oIdx}
                     onClick={(e) => {
                       e.stopPropagation();
                       onToggleItem?.(cat.name, opt);
                     }}
                     className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                       (selectedItems?.[cat.name] || []).includes(opt)
                         ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                         : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-emerald-100"
                     }`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}

function FoodItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
      <div className="p-3 bg-zinc-50 rounded-xl shrink-0">{icon}</div>
      <div><h4 className="font-bold text-zinc-900 text-md leading-none mb-1.5">{title}</h4><p className="text-zinc-500 text-xs leading-relaxed">{description}</p></div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-colors ${active ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-600"}`}>{icon}<span className="text-[10px] font-bold">{label}</span>{active && <div className="h-1 w-1 bg-emerald-600 rounded-full" />}</button>
  );
}

function StatCard({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex flex-col items-center gap-1"><div className="p-1.5 bg-zinc-50 rounded-lg">{icon}</div><span className="text-[10px] font-bold text-zinc-400 uppercase">{label}</span><span className="text-sm font-black text-zinc-800">{value}</span></div>
  );
}
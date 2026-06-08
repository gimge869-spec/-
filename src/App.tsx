import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Gift, 
  Calendar, 
  Plus, 
  Trash2, 
  Bell, 
  BellOff, 
  Sparkles, 
  Search, 
  MessageSquare, 
  Check, 
  Loader2, 
  Heart, 
  UserPlus, 
  Clock, 
  RotateCcw,
  Smile,
  X,
  BadgeAlert,
  Info,
  ExternalLink,
  PartyPopper
} from "lucide-react";
import MascotBubble from "./components/MascotBubble";
import { PREDEFINED_GIFTS } from "./data";
import { FriendBirthday, GiftRecommendation, PredefinedGift } from "./types";

// Default seed data for local storage
const DEFAULT_FRIENDS: FriendBirthday[] = [
  { 
    id: "f1", 
    name: "김민지", 
    date: "10-24", 
    relationship: "친구", 
    gender: "여성", 
    ageGroup: "20대 중반", 
    memo: "빈티지 가드닝, 꽃차, 허브 테라피와 아늑한 인테리어 소품을 한없이 좋아하는 친구 🌸" 
  },
  { 
    id: "f2", 
    name: "이한결", 
    date: "11-02", 
    relationship: "직장동료", 
    gender: "남성", 
    ageGroup: "30대 초반", 
    memo: "풍미 깊은 핸드드립 커피와 주방 식기, 깔끔한 미니멀 디자인 수집 매니아 ☕" 
  },
  { 
    id: "f3", 
    name: "박수빈", 
    date: "11-15", 
    relationship: "동기", 
    gender: "여성", 
    ageGroup: "20대 초반", 
    memo: "애플 기기 테크 액세서리, 요가 매트 중심 온전한 힐링 홈트 중독자 🧘‍♀️" 
  }
];

export default function App() {
  // --- Persistent Local Storage hooks ---
  const [friends, setFriends] = useState<FriendBirthday[]>(() => {
    const saved = localStorage.getItem("presently_friends_list");
    return saved ? JSON.parse(saved) : DEFAULT_FRIENDS;
  });

  const [notificationSettings, setNotificationSettings] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("presently_notifications");
    return saved ? JSON.parse(saved) : { "f1": true, "f2": true, "f3": false };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("presently_friends_list", JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem("presently_notifications", JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  // --- Search & Filtering States ---
  const [selectedGender, setSelectedGender] = useState<string>("unisex"); // male | female | unisex
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("20s_early");
  const [selectedBudget, setSelectedBudget] = useState<string>("30k_50k");
  const [selectedRelationship, setSelectedRelationship] = useState<string>("친구");
  const [selectedVibe, setSelectedVibe] = useState<string>("healing"); // practical | emotional | funny | luxurious | healing | beauty | classic
  const [selectedTastes, setSelectedTastes] = useState<string[]>(["향기초", "홈데코_리빙"]);
  const [additionalDetails, setAdditionalDetails] = useState<string>("");

  // Catalog search input
  const [catalogSearch, setCatalogSearch] = useState<string>("");
  const [catalogCategory, setCatalogCategory] = useState<string>("all");

  // --- Active Tab states ---
  const [activeTab, setActiveTab] = useState<"ai_matcher" | "curated_catalog" | "pogu_chat">("ai_matcher");

  // --- Friends Birthday Form Modal state ---
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendDate, setNewFriendDate] = useState(""); // MM-DD or YYYY-MM-DD
  const [newFriendRelationship, setNewFriendRelationship] = useState("친구");
  const [newFriendGender, setNewFriendGender] = useState("females");
  const [newFriendAgeGroup, setNewFriendAgeGroup] = useState("20s_early");
  const [newFriendMemo, setNewFriendMemo] = useState("");

  // --- Recommendation results ---
  const [aiRecommendations, setAiRecommendations] = useState<GiftRecommendation[]>([]);
  const [isRecommendLoading, setIsRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [recommendSuccessMsg, setRecommendSuccessMsg] = useState<string | null>(null);

  // --- Pogu Live Chat states ---
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "pogu"; text: string; date: string }>>([
    { 
      sender: "pogu", 
      text: "만나서 반갑구! 나는 소중한 사람에게 한없이 폭닥한 하루를 선물해주고 싶은 구름 강아지 '포구'라구! 사소한 사연도 좋으니 고민거리를 편하게 이야기해 달구! 🐶🌸", 
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [mascotBubbleMessage, setMascotBubbleMessage] = useState<string>("");

  // Scroll Pogu Live Chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isChatLoading]);

  // --- Helper Date Calculations for D-Days ---
  const parsedFriendsWithDDay = useMemo(() => {
    // Standard target is 2026-06-08 from metadata
    const today = new Date("2026-06-08T00:00:00");
    
    return friends.map(friend => {
      // Expecting MM-DD or YYYY-MM-DD
      const dateParts = friend.date.split("-");
      let targetMonth = 0;
      let targetDay = 1;
      
      if (dateParts.length === 3) {
        // YYYY-MM-DD
        targetMonth = parseInt(dateParts[1]) - 1;
        targetDay = parseInt(dateParts[2]);
      } else if (dateParts.length === 2) {
        // MM-DD
        targetMonth = parseInt(dateParts[0]) - 1;
        targetDay = parseInt(dateParts[1]);
      }

      // Create anniversary object in same year relative to today
      const anniversaryThisYear = new Date(today.getFullYear(), targetMonth, targetDay);
      let dDayYear = today.getFullYear();
      
      // If it passed already this year, shift to next year
      if (anniversaryThisYear.getTime() < today.getTime() && 
          anniversaryThisYear.toDateString() !== today.toDateString()) {
        dDayYear += 1;
      }
      
      const targetDate = new Date(dDayYear, targetMonth, targetDay);
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...friend,
        displayDate: `${targetMonth + 1}월 ${targetDay}일`,
        dDayValue: diffDays,
        dDayText: diffDays === 0 ? "Today" : `D-${diffDays}`
      };
    }).sort((a, b) => a.dDayValue - b.dDayValue);
  }, [friends]);

  // Alert highlight for extremely close friend birthdays (within 30 days)
  const imminentAnniversaries = useMemo(() => {
    return parsedFriendsWithDDay.filter(f => f.dDayValue <= 30);
  }, [parsedFriendsWithDDay]);

  // --- Auto Fill from Sidebar Card Tapping ---
  const handleSelectFriend = (friend: FriendBirthday) => {
    const pGender = friend.gender === "여성" ? "female" : friend.gender === "남성" ? "male" : "unisex";
    setSelectedGender(pGender);
    
    // Map age groups
    if (friend.ageGroup.includes("10대")) setSelectedAgeGroup("10s");
    else if (friend.ageGroup.includes("20대")) setSelectedAgeGroup("20s");
    else if (friend.ageGroup.includes("30대")) setSelectedAgeGroup("30s");
    else if (friend.ageGroup.includes("40대")) setSelectedAgeGroup("40s");
    else if (friend.ageGroup.includes("50대")) setSelectedAgeGroup("50s");
    else setSelectedAgeGroup("60s+");

    setSelectedRelationship(friend.relationship || "친구");
    
    // Attempt detailed keyword match in memo for tastes
    const parsedTastes: string[] = [];
    const memoLower = (friend.memo || "").toLowerCase();
    
    if (memoLower.includes("향") || memoLower.includes("캔들") || memoLower.includes("인센스")) parsedTastes.push("향기초");
    if (memoLower.includes("커피") || memoLower.includes("차") || memoLower.includes("다과")) parsedTastes.push("차_커피버라이어티");
    if (memoLower.includes("인테리어") || memoLower.includes("소품") || memoLower.includes("홈데코")) parsedTastes.push("홈데코_리빙");
    if (memoLower.includes("가드닝") || memoLower.includes("도자기") || memoLower.includes("원예")) parsedTastes.push("원예_가드닝");
    if (memoLower.includes("테크") || memoLower.includes("기기") || memoLower.includes("악세서리")) parsedTastes.push("스마트한테크");
    if (memoLower.includes("힐링") || memoLower.includes("요가") || memoLower.includes("스트레칭")) parsedTastes.push("웰빙안마기");

    if (parsedTastes.length > 0) {
      setSelectedTastes(parsedTastes);
    } else {
      setSelectedTastes(["향기초", "홈데코_리빙"]); // defaults
    }

    if (friend.memo) {
      setAdditionalDetails(`✨ 기념일 연동됨 [${friend.name} / ${friend.relationship}] - 메모 내용: ${friend.memo}`);
    } else {
      setAdditionalDetails(`✨ ${friend.name}님을 위한 특별 맞춤 선물을 픽해주세요.`);
    }

    setMascotBubbleMessage(`우와! ${friend.name} 친구를 골라 줬구려! 조건들을 캘린더 연동 바탕으로 쏙쏙 맞춰놓았다구! 🐶💖 이제 추천 버튼을 빵빵하게 탭해줘구!`);
    
    // Jump straight to AI Matcher tab
    setActiveTab("ai_matcher");
  };

  // --- Add Friend Submit ---
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName || !newFriendDate) {
      alert("이름과 기념일 날짜를 꼬옥 써줘구!");
      return;
    }

    const cleanedDate = newFriendDate.replace(/\s+/g, ""); // strip spaces
    const id = "friend_" + Date.now();
    const ageLabel = 
      newFriendAgeGroup === "10s_under" ? "10대 이하" :
      newFriendAgeGroup === "10s" ? "10대" : 
      newFriendAgeGroup === "20s_early" ? "20대 초반" : 
      newFriendAgeGroup === "2s_late" || newFriendAgeGroup === "20s_late" ? "20대 후반" : 
      newFriendAgeGroup === "30s_early" ? "30대 초반" : 
      newFriendAgeGroup === "30s_late" ? "30대 후반" : 
      newFriendAgeGroup === "40s" ? "40대" : 
      newFriendAgeGroup === "50s" ? "50대" : 
      newFriendAgeGroup === "60s" ? "60대" : "70대 이상";

    const genderLabel = newFriendGender === "females" ? "여성" : newFriendGender === "males" ? "남성" : "성별 무관";

    const newFriend: FriendBirthday = {
      id,
      name: newFriendName,
      date: cleanedDate,
      relationship: newFriendRelationship,
      gender: genderLabel,
      ageGroup: ageLabel,
      memo: newFriendMemo
    };

    setFriends(prev => [newFriend, ...prev]);
    setNotificationSettings(prev => ({ ...prev, [id]: true }));

    // Reset fields
    setNewFriendName("");
    setNewFriendDate("");
    setNewFriendRelationship("친구");
    setNewFriendMemo("");
    setIsAddFriendOpen(false);

    setMascotBubbleMessage(`축하축하하구! ${newFriendName} 친구의 기념일이 달력에 쏙 등록되었다구! 🐶🥞 포구가 생일 일곱 날 전에 미리 속닥속닥 알려줄게!`);
  };

  // Delete Friend
  const handleDeleteFriend = (id: string, name: string) => {
    if (confirm(`${name} 친구의 소중한 기념일을 달력에서 지우겠구려?`)) {
      setFriends(prev => prev.filter(f => f.id !== id));
      const textCopy = { ...notificationSettings };
      delete textCopy[id];
      setNotificationSettings(textCopy);
      setMascotBubbleMessage(`${name} 친구의 기념일을 정리 완료했어구! 마음 구석에 따뜻함은 남아있을 거라구!`);
    }
  };

  // Switch Toggle Alarm
  const handleToggleAlarm = (id: string, name: string) => {
    setNotificationSettings(prev => {
      const active = !prev[id];
      setMascotBubbleMessage(
        active 
          ? `좋아구! ${name} 친구 생일 일주일 전에 마스코트 포구가 이메일과 팝업으로 행복하게 콩콩 알려줄 거라구! 🔔` 
          : `친구 ${name}의 알림 메신저를 조용히 수면 모드로 전환해두었어구! 💤`
      );
      return { ...prev, [id]: active };
    });
  };

  // --- Real-time Local and AI Recommendation Trigger ---
  const handleFetchRecommendations = async () => {
    setIsRecommendLoading(true);
    setRecommendError(null);
    setRecommendSuccessMsg(null);

    // Prepare Request Body
    const mappedTastes = selectedTastes.map(t => `#${t}`);
    const reqBody = {
      age: selectedAgeGroup === "10s_under" ? "10대 이하" :
           selectedAgeGroup === "10s" ? "10대" : 
           selectedAgeGroup === "20s_early" ? "20대 초반" : 
           selectedAgeGroup === "20s_late" ? "20대 후반" : 
           selectedAgeGroup === "30s_early" ? "30대 초반" : 
           selectedAgeGroup === "30s_late" ? "30대 후반" : 
           selectedAgeGroup === "40s" ? "40대" : 
           selectedAgeGroup === "50s" ? "50대" : 
           selectedAgeGroup === "60s" ? "60대" : "70대 이상",
      gender: selectedGender === "male" ? "남성" : selectedGender === "female" ? "여성" : "성별무관(공용)",
      budget: selectedBudget === "10k_under" ? "1만원 이하 소소한 선물" :
              selectedBudget === "10k_30k" ? "1만원 ~ 3만원대 실속 선물" :
              selectedBudget === "30k_50k" ? "3만원 ~ 5만원대 선물" :
              selectedBudget === "50k_100k" ? "5만원 ~ 10만원대 고품질 선물" :
              selectedBudget === "100k_200k" ? "10만원 ~ 20만원대 프리미엄 선물" :
              selectedBudget === "200k_300k" ? "20만원 ~ 30만원대 럭셔리 실속선물" : "30만원 이상 최고급 명품 선물",
      tastes: mappedTastes,
      relationship: selectedRelationship,
      vibe: selectedVibe,
      additionalInfo: additionalDetails
    };

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody)
      });

      if (!response.ok) {
        throw new Error("서버 폭닥 추천 연결에 지연이 발생했대구.");
      }

      const data = await response.json();
      if (data && data.gifts) {
        setAiRecommendations(data.gifts);
        setRecommendSuccessMsg(data.usingFallback ? "💡 마스코트 추천창이 열렸어구! (포구의 스마트 필터 추천 가이드 작동중)" : "✨ 인공지능 양방향 포구 컨시에르주 매칭 완료!");
        setMascotBubbleMessage("꺄앗! 너만을 위해 하늘 구름 위에서 가장 따스한 3개 기프트를 추려왔다구! 🐶🎁 하나하나 꼼꼼하게 읽어보구 마음에 들었으면 좋겠당!");
      } else {
        throw new Error("올바른 양식이 오지 않았어구.");
      }
    } catch (err: any) {
      console.warn("API Error, falling back to smart local matching logic:", err);
      // Fallback: Smart local filters over PREDEFINED_GIFTS
      const locals = smartLocalFilter(selectedGender, selectedAgeGroup, selectedBudget, selectedVibe, selectedTastes);
      setAiRecommendations(locals);
      setRecommendSuccessMsg("💡 포구의 로컬 큐레이션 스마트 필터링이 알차게 작동했습니다!");
      setMascotBubbleMessage("네트워크가 살짝 졸고 있어서 내가 직접 촘촘히 큐레이션한 소장용 시크릿 목록에서 엄선했다구! 🐶🥖");
    } finally {
      setIsRecommendLoading(false);
    }
  };

  // Triggering on load once with baseline
  useEffect(() => {
    handleFetchRecommendations();
  }, []);

  // --- Smart Client-side Matcher ---
  const smartLocalFilter = (gender: string, age: string, budget: string, vibe: string, tastes: string[]) => {
    // Map selections to categories
    let pool = [...PREDEFINED_GIFTS];
    
    // Sort pool based on closeness of matches
    const scored = pool.map(item => {
      let score = 0;
      
      // Gender match
      if (item.genders.includes("unisex") || item.genders.includes(gender)) score += 3;
      
      // Age group match
      let matchedAge = false;
      if (age.includes("10s") && item.ageGroups.includes("10s")) matchedAge = true;
      else if (age.includes("20s") && item.ageGroups.includes("20s")) matchedAge = true;
      else if (age.includes("30s") && item.ageGroups.includes("30s")) matchedAge = true;
      else if (age.includes("40s") && item.ageGroups.includes("40s")) matchedAge = true;
      else if (age.includes("50s") && item.ageGroups.includes("50s")) matchedAge = true;
      else if (age.includes("60s") && item.ageGroups.includes("60s+")) matchedAge = true;
      else if (age.includes("70s") && item.ageGroups.includes("60s+")) matchedAge = true;
      if (matchedAge) score += 3;
      
      // Budget category match
      let matchedBudget = false;
      if (budget === "10k_under" && (item.budgetCategory === "under_30k" || item.price.includes("1만") || item.price.includes("9천"))) matchedBudget = true;
      else if (budget === "10k_30k" && (item.budgetCategory === "under_30k")) matchedBudget = true;
      else if (budget === "30k_50k" && item.budgetCategory === "30k_50k") matchedBudget = true;
      else if (budget === "50k_100k" && item.budgetCategory === "50k_100k") matchedBudget = true;
      else if (budget === "100k_200k" && item.budgetCategory === "100k_200k") matchedBudget = true;
      else if (budget === "200k_300k" && (item.budgetCategory === "over_200k" || item.budgetCategory === "100k_200k")) matchedBudget = true;
      else if (budget === "over_300k" && item.budgetCategory === "over_200k") matchedBudget = true;
      if (matchedBudget) score += 4;
      
      // Vibe match
      if (item.vibes.includes(vibe)) score += 2;

      return { item, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Return top 3 conversion to GiftRecommendation schema
    return scored.slice(0, 3).map(s => ({
      name: s.item.name,
      description: s.item.description,
      priceRange: s.item.price,
      whyItFits: `${selectedRelationship ? `${selectedRelationship}에게` : "소중한 사람에게"} 전하기 좋은, 맞춤 나이 및 스타일 최적화 추천 선물입니다.`,
      tips: s.item.tips,
      cozyFactor: s.item.rating
    }));
  };

  // --- Interactive Curated Catalog (Tab C) Client Side Realtime Filter ---
  const filteredCatalogItems = useMemo(() => {
    let items = [...PREDEFINED_GIFTS];

    // Search query constraint
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase().replace(/\s+/g, "");
      items = items.filter(item => 
        item.name.toLowerCase().replace(/\s+/g, "").includes(q) ||
        item.description.toLowerCase().replace(/\s+/g, "").includes(q) ||
        item.tips.toLowerCase().replace(/\s+/g, "").includes(q)
      );
    }

    // Category check
    if (catalogCategory !== "all") {
      items = items.filter(item => item.category === catalogCategory);
    }

    // Current screen matching filter - highlights or refines
    return items;
  }, [catalogSearch, catalogCategory]);

  // --- Live Chat Pogu AI Handler ---
  const handlePoguChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput;
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { sender: "user", text: userMsgText, date: userTime }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // Create trailing subset package of last 6 messages as brief context
      const truncatedHistory = chatHistory.slice(-6);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsgText,
          chatHistory: truncatedHistory
        })
      });

      if (!response.ok) throw new Error("서버 연결에 실패하구...");
      const data = await response.json();
      
      const poguTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory(prev => [...prev, { sender: "pogu", text: data.reply, date: poguTime }]);
      setMascotBubbleMessage(data.reply);

    } catch (err) {
      console.warn("Chat API error, falling back locally:", err);
      // Cozy local replies
      const localCozyAnswers = [
        "와앙! 소중한 사람을 위한 고민은 늘 보람차다구! 🐶🌸 포구가 옆에서 향긋한 차 향기를 빌려줄테니, 그 친구의 일상 취미를 나긋나긋 관찰해보자구!",
        "선물은 포장지가 반이라구! 크래프트 백에 소박하게 묶은 마른 캐모마일 줄기 하나가 명품 가방보다 가슴 깊이 사르르 닿는 경우가 많아구! 🎋💝",
        "인생의 비밀은 거창하지 않다구! 달콤부드러운 마카롱 하나, 퐁신한 수면잠옷 하나로 그 친구의 찌푸려진 미간을 사르르 펴줄 수 있구! 힘을 내봐구! 🥰🥞",
        "생일 선물 고르기 대작전 성공을 빌어구! 궁금한 카테고리가 있으면 언제든 나 포구에게 똑똑 노크해달라구! 🍒"
      ];
      const randomAnswer = localCozyAnswers[Math.floor(Math.random() * localCozyAnswers.length)];
      
      setTimeout(() => {
        const poguTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setChatHistory(prev => [...prev, { sender: "pogu", text: randomAnswer, date: poguTime }]);
        setMascotBubbleMessage(randomAnswer);
        setIsChatLoading(false);
      }, 700);
      return;
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedGender("unisex");
    setSelectedAgeGroup("20s_early");
    setSelectedBudget("30k_50k");
    setSelectedRelationship("친구");
    setSelectedVibe("healing");
    setSelectedTastes(["향기초", "홈데코_리빙"]);
    setAdditionalDetails("");
    setMascotBubbleMessage("조건 필터를 초기화했다구! 🐶🧹 언제든 다시 멋진 조합을 만들어줘구!");
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] flex flex-col p-4 md:p-8 select-none font-sans text-[#5A524C] max-w-(--size-7xl) mx-auto">
      
      {/* Decorative Outer Ambient Blur in Corner */}
      <div className="fixed top-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-[#FFEBE1] rounded-full filter blur-[120px] opacity-25 pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] bg-[#E9EDC9] rounded-full filter blur-[120px] opacity-25 pointer-events-none z-0" />

      {/* Main Grid Wrapper */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 flex-1">
        
        {/* ================= LEFT SIDEBAR (Calendar, Mascot & Urgent Events) ================= */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Logo / Title Block */}
          <div className="bg-white rounded-[40px] p-6 border border-[#F5EBE0] shadow-xs flex flex-col gap-1 items-center text-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl animate-bounce">🎁</span>
              <h1 className="text-3xl font-medium tracking-wide text-[#4A443F]" style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }}>
                Presently
              </h1>
            </div>
            <p className="text-xs tracking-wide text-[#8D8175] font-serif italic mt-1 font-bold">
              소중한 인연을 위한 포근폭닥 생일선물 큐레이션 & 캘린더
            </p>
          </div>

          {/* Interactive Cloud Mascot Bubble */}
          <MascotBubble customMessage={mascotBubbleMessage} />

          {/* D-Day Notification Center (If any event is within 30 days) */}
          {imminentAnniversaries.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#FFEBE1]/80 rounded-[30px] p-5 border border-[#EC8B63]/20 flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 text-[#EC8B63] font-semibold text-sm">
                <PartyPopper className="w-4 h-4" />
                <span>다가오는 폭닥폭닥 기념일 알림!</span>
              </div>
              <div className="text-xs text-[#765446] leading-relaxed">
                {imminentAnniversaries.map(friend => (
                  <div key={friend.id} className="flex justify-between items-center bg-white/60 p-2 rounded-xl mt-1.5 border border-[#FFEBE1]">
                    <span>
                      🎉 <b>{friend.name}</b>님의 생일({friend.displayDate})이 <b>{friend.dDayText}</b> 남았구!
                    </span>
                    <button 
                      onClick={() => handleSelectFriend(friend)}
                      className="px-2 py-0.5 bg-[#EC8B63] text-white rounded-full text-[10px] hover:bg-opacity-90 active:scale-95 transition-all font-bold shrink-0 ml-1"
                    >
                      바로 매칭
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Birthday Calendar Hub */}
          <div className="bg-white rounded-[40px] p-6 lg:p-8 flex flex-col gap-6 border border-[#F5EBE0] shadow-xs flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#D4A373] animate-ping" />
                <h2 className="text-lg font-semibold text-[#4A443F]" style={{ fontFamily: "Gowun Batang, serif" }}>
                  소중한 친구들의 기념일 ({friends.length}명)
                </h2>
              </div>
              <button 
                id="add-friend-btn"
                onClick={() => setIsAddFriendOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5EBE0] hover:bg-[#EBDCCF] text-[#765446] rounded-full text-xs font-semibold tracking-tight transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>기록 추가</span>
              </button>
            </div>

            {/* Hint Box */}
            <p className="text-[11px] text-[#AE8573] leading-relaxed bg-[#FAF3EB]/55 p-3 rounded-2xl border border-[#F5EBE0] -mt-2">
              💡 <b>캘린더 카드를 터치</b>하면 그 친구의 나이, 취향 태그가 하단의 선물 조건 필터로 기분 좋게 자동 연동된다구! 🐶🌷
            </p>

            {/* List of Friends */}
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {parsedFriendsWithDDay.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-[#F5EBE0] rounded-3xl text-center text-xs text-[#AE8573] flex flex-col items-center gap-2 bg-[#FDFBF7]/50">
                  <Calendar className="w-8 h-8 text-[#E6D4C3]" />
                  <span>아직 연동된 기념일 친구가 없구!</span>
                  <button 
                    onClick={() => setIsAddFriendOpen(true)}
                    className="text-xs text-[#EC8B63] underline font-bold mt-1"
                  >
                    오늘 첫 친구를 등록해볼까구?
                  </button>
                </div>
              ) : (
                parsedFriendsWithDDay.map((friend) => {
                  const hasNotification = notificationSettings[friend.id] !== false;
                  
                  return (
                    <div 
                      key={friend.id}
                      id={`friend-card-${friend.id}`}
                      className="group p-4 rounded-3xl bg-white border border-[#F5EBE0] relative flex items-start gap-3 hover:bg-[#FAF3EB]/30 hover:border-[#D4A373]/30 hover:shadow-xs transition-all cursor-pointer select-none"
                      onClick={() => handleSelectFriend(friend)}
                    >
                      {/* D-Day badge badge style matching presently minimalism */}
                      <span className={`absolute -top-1.5 -right-1.5 text-white text-[10px] uppercase tracking-wide font-extrabold px-2.5 py-1.5 rounded-full shadow-xs ${
                        friend.dDayValue <= 7 ? "bg-[#EC8B63]" : friend.dDayValue <= 30 ? "bg-[#D4A373]" : "bg-[#7E9C85]"
                      }`}>
                        {friend.dDayText}
                      </span>

                      {/* Cake Icon Accent */}
                      <div className="w-10 h-10 rounded-full bg-[#FAF3EB] flex items-center justify-center text-lg shrink-0 mt-0.5">
                        🎈
                      </div>

                      <div className="flex-1 min-w-0 pr-10">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold text-[#4A443F] truncate">{friend.name}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FAF3EB] font-bold text-[#AE8573] shrink-0">
                            {friend.relationship}
                          </span>
                        </div>
                        <p className="text-xs text-[#8D8175] mt-0.5 font-semibold">
                          생일: {friend.displayDate} ({friend.gender} / {friend.ageGroup})
                        </p>
                        {friend.memo && (
                          <p className="text-[11px] text-[#AE8573] italic truncate mt-1 bg-[#FAF3EB]/40 px-2 py-1 rounded-sm">
                            "{friend.memo}"
                          </p>
                        )}
                      </div>

                      {/* Action buttons on hover */}
                      <div className="flex flex-col gap-1 items-center justify-center shrink-0 ml-1" onClick={(e) => e.stopPropagation()}>
                        {/* Alarm Bell */}
                        <button
                          onClick={() => handleToggleAlarm(friend.id, friend.name)}
                          className={`p-1.5 rounded-full hover:bg-white border transition-colors ${
                            hasNotification ? "text-[#EC8B63] bg-[#FFEBE1]/30 border-[#FFEBE1]" : "text-gray-400 bg-gray-50 border-gray-100"
                          }`}
                          title={hasNotification ? "알림 알람 서비스 운용중" : "알림 정지됨"}
                        >
                          {hasNotification ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                        </button>
                        {/* Trash */}
                        <button
                          onClick={() => handleDeleteFriend(friend.id, friend.name)}
                          className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 rounded-full border border-red-100 transition-colors"
                          title="삭제하기"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Custom Interactive Notification Setting Toggler */}
            <div className="mt-auto bg-[#FDFBF7] p-4 border border-[#F5EBE0] rounded-3xl flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[#4A443F] flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#D4A373]" /> D-Day 및 알림 모니터
                </span>
                <span className="text-[10px] text-[#AE8573]">등록된 {friends.filter(f => notificationSettings[f.id] !== false).length}개 알람 작동중</span>
              </div>
              <span className="text-xs bg-[#7E9C85]/20 text-[#7E9C85] px-2.5 py-1 rounded-full font-bold">푸시 ON</span>
            </div>

          </div>
        </aside>

        {/* ================= MAIN COLUMN (Recommend Filters & Catalog Browser & Chat) ================= */}
        <main className="lg:col-span-8 flex flex-col gap-6">

          {/* Navigation Tabs (Minimalist Design Theme compatible) */}
          <div className="flex gap-2 p-1.5 bg-white border border-[#F5EBE0] rounded-full self-start shadow-xs">
            <button
              onClick={() => {
                setActiveTab("ai_matcher");
                setMascotBubbleMessage("조건을 세세히 골라주면 내가 인공지능 추천 매칭을 가동한다구! 🐶🌷");
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                activeTab === "ai_matcher" 
                  ? "bg-[#D4A373] text-white shadow-xs font-bold" 
                  : "text-[#8D8175] hover:text-[#4A443F]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>포구의 선물 매칭소 (세세한 추천)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("curated_catalog");
                setMascotBubbleMessage("폭신폭신의 결정체! 정기적으로 엄선하는 포구 마켓 상설 리스트를 검색할래구? 🐶🥐");
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                activeTab === "curated_catalog" 
                  ? "bg-[#D4A373] text-white shadow-xs font-bold" 
                  : "text-[#8D8175] hover:text-[#4A443F]"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>선물 도감 카탈로그 ({PREDEFINED_GIFTS.length}선)</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("pogu_chat");
                setMascotBubbleMessage("오구오구! 나랑 소통하구 마음 노곤해질 수 있는 포구수다방에 들어왔구! 🐶💬");
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all flex items-center gap-2 ${
                activeTab === "pogu_chat" 
                  ? "bg-[#D4A373] text-white shadow-xs font-bold" 
                  : "text-[#8D8175] hover:text-[#4A443F]"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>포구와 오손도손 수다방 🐶💬</span>
            </button>
          </div>

          {/* ================= TAB 1: AI & FILTER GIFT RECOMMENDATIONS ================= */}
          {activeTab === "ai_matcher" && (
            <div className="flex flex-col gap-6">
              
              {/* Filter Setup Card */}
              <section className="bg-white rounded-[40px] p-6 md:p-8 border border-[#F5EBE0] shadow-xs flex flex-col gap-6">
                
                <div className="flex items-center justify-between border-b border-[#F5EBE0] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#4A443F]" style={{ fontFamily: "Gowun Batang, serif" }}>
                      💝 세밀한 선물 맞춤 조건 조율기
                    </h3>
                    <p className="text-xs text-[#8D8175] mt-1">상세한 나이, 취향, 예산을 매칭해 감동을 극대화시켜드립니다.</p>
                  </div>
                  <button 
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 text-xs text-[#AE8573] hover:text-[#765446] underline transition-all"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>조건 리셋</span>
                  </button>
                </div>

                {/* Filters Row 1: Gender & Age Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  
                  {/* Recipient Gender */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#AE8573] flex items-center gap-1">
                      <span>• 성별</span>
                    </label>
                    <div className="flex gap-2">
                      {[
                        { key: "female", label: "여성" },
                        { key: "male", label: "남성" },
                        { key: "unisex", label: "성별 무관" }
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setSelectedGender(item.key);
                            setMascotBubbleMessage(`성별을 '${item.label}'으로 설정했다구!`);
                          }}
                          className={`flex-1 px-3 py-2.5 rounded-2xl border text-center transition-all duration-300 font-semibold ${
                            selectedGender === item.key 
                              ? "bg-[#D4A373] text-white border-[#D4A373]" 
                              : "bg-white border-[#F5EBE0] text-[#5A524C] hover:bg-[#FAF3EB]/35"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Age Category */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#AE8573] flex items-center gap-1">
                      <span>• 연령대</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "10s_under", label: "10대 미만" },
                        { key: "10s", label: "10대" },
                        { key: "20s_early", label: "20대 초반" },
                        { key: "20s_late", label: "20대 후반" },
                        { key: "30s_early", label: "30대 초반" },
                        { key: "30s_late", label: "30대 후반" },
                        { key: "40s", label: "40대" },
                        { key: "50s", label: "50대" },
                        { key: "60s", label: "60대" },
                        { key: "70s_over", label: "70대 이상" }
                      ].map((age) => (
                        <button
                          key={age.key}
                          type="button"
                          onClick={() => {
                            setSelectedAgeGroup(age.key);
                            setMascotBubbleMessage(`연령대를 '${age.label}'로 세팅했다구!`);
                          }}
                          className={`px-3 py-2 rounded-xl border text-xs font-semibold tracking-tight transition-all duration-250 ${
                            selectedAgeGroup === age.key 
                              ? "bg-[#D4A373] text-white border-[#D4A373]" 
                              : "bg-white border-[#F5EBE0] text-[#5A524C] hover:bg-[#FAF3EB]/35"
                          }`}
                        >
                          {age.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Filters Row 2: Budget & Relationship */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  
                  {/* Precise Price Level */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#AE8573]">
                      • 예산 범위
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { key: "10k_under", label: "1만 원 이하" },
                        { key: "10k_30k", label: "1~3만 원" },
                        { key: "30k_50k", label: "3~5만 원" },
                        { key: "50k_100k", label: "5~10만 원" },
                        { key: "100k_200k", label: "10~20만 원" },
                        { key: "200k_300k", label: "20~30만 원" },
                        { key: "over_300k", label: "30만 원 이상" }
                      ].map((bud) => (
                        <button
                          key={bud.key}
                          type="button"
                          onClick={() => {
                            setSelectedBudget(bud.key);
                            setMascotBubbleMessage(`예산대를 '${bud.label}'로 설정했다구!`);
                          }}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-250 ${
                            selectedBudget === bud.key 
                              ? "bg-[#D4A373] text-white border-[#D4A373]" 
                              : "bg-white border-[#F5EBE0] text-[#5A524C] hover:bg-[#FAF3EB]/35"
                          }`}
                        >
                          {bud.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Relationship */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#AE8573]">
                      • 관계
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                      {[
                        "친구", "연인", "배우자", 
                        "부모님", "자녀", "형제/자매", 
                        "직장 동료", "직장 상사", "비즈니스", 
                        "선생님/은사", "동기/선후배", "지인"
                      ].map((relation) => (
                        <button
                          key={relation}
                          type="button"
                          onClick={() => {
                            setSelectedRelationship(relation);
                            setMascotBubbleMessage(`관계가 '${relation}'이구려! 알맞게 큐레이션 하겠다구!`);
                          }}
                          className={`px-2 py-2 rounded-lg border text-xs font-bold transition-all ${
                            selectedRelationship === relation 
                              ? "bg-[#D4A373] text-white border-[#D4A373]" 
                              : "bg-white border-[#F5EBE0] text-[#5A524C] hover:bg-[#FAF3EB]/35"
                          }`}
                        >
                          {relation}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Filters Row 3: Aesthetic Vibe */}
                <div className="flex flex-col gap-2.5 text-xs">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-[#AE8573]">
                    • 원하는 선물 무드
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {[
                      { key: "healing", label: "🍀 힐링 / 웰빙" },
                      { key: "emotional", label: "🕯️ 감성 / 리빙" },
                      { key: "practical", label: "🔌 실용 / 테크" },
                      { key: "funny", label: "🪄 위트 / 독특" },
                      { key: "luxurious", label: "✨ 프리미엄 / 럭셔리" },
                      { key: "beauty", label: "🧼 뷰티 / 케어" },
                      { key: "classic", label: "🌱 미니멀 / 자연" }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSelectedVibe(item.key);
                          setMascotBubbleMessage(`선물 분위기는 '${item.label}'로 맞추었다구!`);
                        }}
                        className={`px-1.5 py-3 rounded-2xl border text-center font-bold text-[11px] sm:text-xs transition-all ${
                          selectedVibe === item.key 
                            ? "bg-[#D4A373] text-white border-[#D4A373] shadow-xs scale-[1.02]" 
                            : "bg-white border-[#F5EBE0] text-[#5A524C] hover:bg-[#FAF3EB]/35"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters Row 4: Extensive Tastes (Multiple selections) */}
                <div className="flex flex-col gap-2.5 text-xs">
                  <label className="text-[11px] uppercase tracking-widest font-semibold text-[#AE8573] flex justify-between items-center">
                    <span>• 관심 분야 / 취향 (복수 선택 가능)</span>
                    <span className="text-[10px] text-[#A69B90] font-normal">선택 개수: {selectedTastes.length}개</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "향기초", label: "#향기·캔들 🕯️" },
                      { id: "홈데코_리빙", label: "#인테리어소품 🪞" },
                      { id: "스마트한테크", label: "#스마트IT기기 🔌" },
                      { id: "차_커피버라이어티", label: "#커피·티 🍵" },
                      { id: "구움과자 디저트", label: "#디저트·푸드 🧁" },
                      { id: "웰빙안마기", label: "#풋·바디케어 💆" },
                      { id: "식기_도자기", label: "#그릇·식기류 🥣" },
                      { id: "도서_일기장", label: "#책·문구류 📚" },
                      { id: "원예_가드닝", label: "#화분·식물 🪴" },
                      { id: "패션잡화", label: "#패션·의류 🧣" },
                      { id: "반려관심", label: "#반려동물 용품 🐾" },
                      { id: "캠핑아웃도어", label: "#캠핑·피크닉 🏕️" },
                      { id: "주류_안주", label: "#와인·전통주 🍷" },
                      { id: "바디뷰티", label: "#핸드·바디코스메틱 🧼" },
                      { id: "주얼리액세서리", label: "#주얼리·액세서리 💍" },
                      { id: "건강식품", label: "#이너뷰티·영양제 💊" },
                      { id: "미술공예", label: "#DIY·미술·공예 🎨" }
                    ].map((taste) => {
                      const isSelected = selectedTastes.includes(taste.id);
                      return (
                        <button
                          key={taste.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTastes(prev => prev.filter(t => t !== taste.id));
                            } else {
                              setSelectedTastes(prev => [...prev, taste.id]);
                            }
                            setMascotBubbleMessage(`취향 태그를 선택했다구!`);
                          }}
                          className={`px-3.5 py-2.5 rounded-full text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                            isSelected 
                              ? "bg-[#E9EDC9] text-[#765446] border-2 border-[#D4A373]/30 scale-[1.03]" 
                              : "bg-white border border-[#F5EBE0] text-[#5A524C] hover:bg-[#FAF3EB]/35"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-[#EC8B63]" />}
                          <span>{taste.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Memo Input */}
                <div className="flex flex-col gap-2.5 text-xs">
                  <label className="text-[11px] uppercase tracking-widest font-bold text-[#AE8573] flex items-center gap-1.5">
                    <span>• 그 친구만을 위한 사소하고 따뜻한 추가 사연 (필수 아님!)</span>
                    <span className="text-[10px] text-gray-400 font-normal">직접 써주시면 포구의 눈이 더 반짝인다구!</span>
                  </label>
                  <textarea
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="예: '최근에 독립해서 혼자 살기 시작한 친구야. 방이 늘 정갈하고 포근했으면 좋겠어!', 또는 '요즘 밤늦게 과제를 하느라 손끝이 자꾸 시려워 보였어구.'"
                    className="w-full text-xs bg-[#FDFBF8] border border-[#F5EBE0] rounded-2xl p-4 focus:ring-1 focus:ring-[#D4A373] focus:outline-hidden min-h-[70px] text-[#5A524C] placeholder-[#C5BCB2] font-cozy"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={handleFetchRecommendations}
                  disabled={isRecommendLoading}
                  className="w-full py-4 px-6 bg-[#D4A373] text-white rounded-3xl font-semibold tracking-wide font-cozy text-base shadow-sm hover:shadow-md active:scale-99 transition-all cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-1/3 bg-white/10 skew-x-12 translate-x-[-100%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
                  
                  {isRecommendLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#FCF9F4]" />
                      <span className="text-sm font-bold">포구가 구름 위에서 폭닥한 리스트를 뭉게뭉게 만드는 중구... 🐾</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-[#FAF3EB] animate-pulse" />
                      <span className="text-base font-bold">폭닥폭닥 포구 맞춤선물 추천 가동하기! ✨</span>
                    </>
                  )}
                </button>

              </section>

              {/* Recommendations Result Showcase */}
              <section className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-bold text-[#4A443F]" style={{ fontFamily: "Gowun Batang, serif" }}>
                      🎁 포구가 엄선한 다정한 추천선물 리스트
                    </h3>
                    <p className="text-xs text-[#8D8175] mt-1">받는 이의 마음을 노곤하게 녹여줄 아이템들을 감상해보구!</p>
                  </div>
                  {recommendSuccessMsg && (
                    <span className="text-xs text-[#7E9C85] bg-[#7E9C85]/10 px-3 py-1 rounded-full font-bold">
                      {recommendSuccessMsg}
                    </span>
                  )}
                </div>

                {aiRecommendations.length === 0 ? (
                  <div className="bg-white rounded-[40px] p-12 border border-[#F5EBE0] text-center flex flex-col items-center gap-3">
                    <span className="text-3xl">🧺</span>
                    <p className="text-sm text-[#AE8573] font-cozy">아직 추천 결과가 로딩중이거나 생성되지 않았구!</p>
                    <button 
                      onClick={handleFetchRecommendations}
                      className="px-4 py-2 bg-[#D4A373] text-white text-xs rounded-full font-bold hover:bg-opacity-95 mt-1"
                    >
                      지금 추천받기 기동하기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {aiRecommendations.map((gift, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="bg-white rounded-[32px] p-6 border border-[#F5EBE0] hover:border-[#D4A373] shadow-xs flex flex-col gap-4 justify-between relative overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      >
                        {/* Cozy Rating Indicator Stars */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 text-[#EC8B63] bg-[#FFEBE1]/80 px-2 py-1 rounded-full text-[10px] font-bold">
                          <span>폭닥지수:</span>
                          <span className="flex">
                            {Array.from({ length: Math.min(5, gift.cozyFactor || 5) }).map((_, i) => (
                              <Heart key={i} className="w-3.5 h-3.5 fill-[#EC8B63] text-[#EC8B63] stroke-[1]" />
                            ))}
                          </span>
                        </div>

                        {/* Top Block Container */}
                        <div className="flex flex-col gap-3">
                          
                          {/* Aesthetic Icon representation */}
                          <div className="w-12 h-12 rounded-2xl bg-[#FEFAE0] border border-[#E9EDC9] flex items-center justify-center text-2xl shrink-0">
                            {index === 0 ? "🕯️" : index === 1 ? "🧣" : "🍵"}
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-[#AE8573]">포구 엄선 #{index + 1} 셀렉션</span>
                            <h4 className="text-base font-extrabold text-[#4A443F] leading-tight font-serif mt-0.5">{gift.name}</h4>
                            <p className="text-xs font-bold text-[#EC8B63] mt-1.5 bg-[#FFEBE1]/45 px-2.5 py-1 rounded-md inline-block">
                              가격대: {gift.priceRange} 내외
                            </p>
                          </div>

                          <div className="border-t border-[#F5EBE0]/80 pt-3 flex flex-col gap-2.5">
                            <div>
                              <p className="text-[10px] uppercase font-extrabold text-[#AE8573] tracking-widest">선물 상세정보</p>
                              <p className="text-xs text-[#5A524C] leading-relaxed mt-0.5 font-sans">
                                {gift.description}
                              </p>
                            </div>

                            <div className="bg-[#FAF3E0]/70 p-3 rounded-2xl border border-[#F5EBE0]/45">
                              <p className="text-[10px] font-bold text-[#765446] flex items-center gap-1">
                                <span>🧸 이래서 딱 어울려요</span>
                              </p>
                              <p className="text-xs text-[#765446] italic leading-relaxed mt-0.5 font-cozy">
                                {gift.whyItFits}
                              </p>
                            </div>
                          </div>

                        </div>

                        {/* Bottom Tip Block container */}
                        <div className="bg-[#E9EDC9]/35 p-3 rounded-2xl border border-[#E9EDC9]/50 text-xs text-[#5A524C] flex flex-col gap-1">
                          <p className="text-[10px] font-extrabold text-[#7E9C85]">💡 포구의 센스만점 기프트 꿀팁</p>
                          <p className="text-[11px] leading-relaxed font-sans font-medium text-[#765446]">
                            {gift.tips}
                          </p>
                        </div>

                      </motion.div>
                    ))}
                  </div>
                )}

              </section>

              {/* Visual Tip Container */}
              <div className="bg-[#FAF3E0] rounded-3xl p-5 border border-[#F5EBE0] flex items-start gap-4">
                <Info className="w-5 h-5 text-[#D4A373] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 text-xs text-[#765446]">
                  <p className="font-bold">포구의 따뜻한 조언: "모양새가 거창하지 않더라도 괜찮아구!"</p>
                  <p className="leading-relaxed">
                    선물을 고르는 정성과 내내 고민했던 그 시간 자체가 우정의 마법을 증명해준다구! 추천받은 품목을 바탕으로 따뜻한 메시지가 담긴 감성 엽서 한 장을 봉투에 고이 밀봉해 주는 걸 절대 빼먹지 마구! 🐶💌
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: DETAILED GIFT CATALOG ================= */}
          {activeTab === "curated_catalog" && (
            <div className="bg-white rounded-[40px] p-6 md:p-8 border border-[#F5EBE0] shadow-xs flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F5EBE0] pb-5">
                <div>
                  <h3 className="text-xl font-bold text-[#4A443F]" style={{ fontFamily: "Gowun Batang, serif" }}>
                    📚 포구가 엄선해서 차곡차곡 쌓아둔 선물 백과사전
                  </h3>
                  <p className="text-xs text-[#8D8175] mt-1">포근함이 가득 검증된 테마별 최고 평점의 선물들을 즉시 탐색해 보세요.</p>
                </div>

                {/* Instant Counter Badge */}
                <span className="text-xs bg-[#E9EDC9] text-[#765446] font-bold px-3 py-1.5 rounded-full self-start md:self-auto">
                  탐색 가능한 고유 기프트: {PREDEFINED_GIFTS.length}종
                </span>
              </div>

              {/* Dynamic Interactive Catalog Search controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                
                {/* Search query input */}
                <div className="md:col-span-7 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AE8573]" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="찾고 있는 선물 명칭이나 꿀팁 키워드를 입력해봐구! (예: 오르골, 잠옷)"
                    className="w-full text-xs pl-11 pr-4 py-3.5 bg-[#FDFBF7] border border-[#F5EBE0] rounded-2xl focus:ring-1 focus:ring-[#D4A373] focus:outline-hidden text-[#5A524C] placeholder-[#C5BCB2]"
                  />
                  {catalogSearch && (
                    <button 
                      onClick={() => setCatalogSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#AE8573] hover:text-[#5A524C]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category filters */}
                <div className="md:col-span-5">
                  <select
                    value={catalogCategory}
                    onChange={(e) => setCatalogCategory(e.target.value)}
                    className="w-full text-xs py-3.5 px-4 bg-[#FDFBF7] border border-[#F5EBE0] rounded-2xl focus:ring-1 focus:ring-[#D4A373] focus:outline-hidden text-[#5A524C] font-semibold"
                  >
                    <option value="all">📁 전체 카테고리 보기</option>
                    <option value="fashion">🧣 패션 잡화 / 피치의류</option>
                    <option value="living">🛋️ 홈리빙 / 감성 소품</option>
                    <option value="beauty">💄 스킨케어 / 바디 보습</option>
                    <option value="food">🍵 수제 구움과자 / 티 블렌드</option>
                    <option value="tech">🔌 감성 스마트 테크 악세리</option>
                    <option value="healing">💆 전신 웰빙 / 피로이완</option>
                    <option value="hobby">🎨 아날로그 수집 / 취미용품</option>
                  </select>
                </div>

              </div>

              {/* Filtered items representation */}
              {filteredCatalogItems.length === 0 ? (
                <div className="py-20 border-2 border-dashed border-[#F5EBE0] rounded-3xl text-center flex flex-col items-center gap-3 bg-[#FCF9F4]/40">
                  <span className="text-3xl">🕵️‍♂️</span>
                  <p className="text-sm font-cozy text-[#AE8573]">포구가 도서관 구석까지 샅샅이 찾아봤지만 매칭되는 선물 아이템이 없구!</p>
                  <p className="text-xs text-[#8D8175]">검색어를 다른 단어로 바꾸거나 우측 상단 카테고리를 전체보기로 재설정해 보라구!</p>
                  <button
                    onClick={() => { setCatalogSearch(""); setCatalogCategory("all"); }}
                    className="mt-2 text-xs text-[#D4A373] underline font-bold"
                  >
                    검색 조건 초기화하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCatalogItems.map((gift) => (
                    <div
                      key={gift.id}
                      className="p-5 rounded-3xl bg-[#FAF3EB]/30 border border-[#F5EBE0] hover:border-[#D4A373]/80 transition-all duration-200 flex gap-4"
                    >
                      {/* Left icon box */}
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#F5EBE0] flex items-center justify-center text-3xl shrink-0 self-start shadow-xs">
                        {gift.category === "fashion" ? "🧣" : 
                         gift.category === "living" ? "🕯️" : 
                         gift.category === "tech" ? "🔌" : 
                         gift.category === "food" ? "🍵" : 
                         gift.category === "beauty" ? "💄" : 
                         gift.category === "healing" ? "💆" : "🎨"}
                      </div>

                      {/* Right info */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#7E9C85] bg-[#E9EDC9] px-2 py-0.5 rounded-full truncate">
                              {gift.category.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-[#AE8573] font-bold">♥ 포구 극찬: {gift.rating}점</span>
                          </div>
                          <h4 className="text-sm font-extrabold text-[#4A443F] truncate mt-1 leading-tight font-serif">{gift.name}</h4>
                          <p className="text-xs text-[#AE8573] font-bold mt-1">예상가: <span className="text-[#EC8B63]">{gift.price}</span></p>
                          <p className="text-xs text-[#5A524C] leading-relaxed mt-2 font-sans font-medium">
                            {gift.description}
                          </p>
                        </div>

                        {/* Extra tiny tip bubble in each card */}
                        <div className="bg-white/75 p-2.5 rounded-xl border border-[#F5EBE0]/80 text-[11px] text-[#765446] mt-3 leading-relaxed">
                          📌 <b>포구의 조언:</b> {gift.tips}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom total note */}
              <div className="p-4 bg-[#7E9C85]/10 border border-[#7E9C85]/20 rounded-2xl text-xs text-[#7E9C85] leading-relaxed flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>이 도감의 모든 기프트들은 검증된 브랜드 및 가치를 바탕으로 하여 비 상업적 우정 전달용으로 더없이 훌륭한 평판을 얻고 있습니다.</span>
              </div>

            </div>
          )}

          {/* ================= TAB 3: CHAT PANEL WITH MASCOT POGU ================= */}
          {activeTab === "pogu_chat" && (
            <div className="bg-white rounded-[40px] p-6 md:p-8 border border-[#F5EBE0] shadow-xs flex flex-col h-[580px] justify-between relative overflow-hidden">
              
              {/* Header inside chat */}
              <div className="flex items-center gap-3 border-b border-[#F5EBE0] pb-4">
                <div className="w-10 h-10 rounded-full bg-[#FFEBE1] flex items-center justify-center text-xl shrink-0 animate-bounce">
                  🐶
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#4A443F] flex items-center gap-1.5">
                    <span>마스코트 포구와 달콤한 수다방</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-[#AE8573]">포구에게 속마음을 말하면 포근한 반존댓말로 해결책과 선물을 매칭해드리구!</p>
                </div>
              </div>

              {/* Chat timeline message viewport */}
              <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3.5 pr-2">
                {chatHistory.map((chat, idx) => (
                  <div
                    key={idx}
                    className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"} items-end gap-1.5`}
                  >
                    {chat.sender === "pogu" && (
                      <div className="w-8 h-8 rounded-full bg-[#FAF3EB] border border-[#E6D4C3] flex items-center justify-center text-base shrink-0 select-none">
                        🐶
                      </div>
                    )}

                    {chat.sender === "user" && (
                      <span className="text-[9px] text-gray-400 font-normal self-end pb-0.5">{chat.date}</span>
                    )}

                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs sm:text-sm font-cozy leading-relaxed ${
                        chat.sender === "user"
                          ? "bg-[#D4A373] text-white rounded-br-none"
                          : "bg-[#FAF3EB] text-[#5A524C] rounded-bl-none border border-[#F5EBE0]"
                      }`}
                    >
                      {chat.text}
                    </div>

                    {chat.sender === "pogu" && (
                      <span className="text-[9px] text-gray-400 font-normal self-end pb-0.5">{chat.date}</span>
                    )}
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#FAF3EB] border border-[#E6D4C3] flex items-center justify-center text-base shrink-0 animate-ping">
                      🐶
                    </div>
                    <div className="bg-[#FAF3EB] text-[#AE8573] border border-[#F5EBE0] px-4 py-2.5 rounded-2xl rounded-bl-none text-xs flex items-center gap-1.5 font-cute font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>포구 발바닥이 부지런히 끄적끄적 생각중구... 🐾</span>
                    </div>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input keyboard submit panel */}
              <form onSubmit={handlePoguChatSend} className="border-t border-[#F5EBE0] pt-4 mt-2 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="포구야, 친한 동료 이사선물 뭐지? (~구 종결어로 끝내도 좋다구! 🐶)"
                  className="flex-1 bg-[#FDFBF7] text-xs border border-[#F5EBE0] rounded-2xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373] text-[#5A524C] placeholder-[#C5BCB2] font-cozy"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-5 py-3 bg-[#D4A373] hover:bg-[#C99665] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <span>전송하기</span>
                </button>
              </form>

            </div>
          )}

        </main>
      </div>

      {/* ================= MODAL DIALOG: NEW BIRTHDAY FRIEND FORM ================= */}
      <AnimatePresence>
        {isAddFriendOpen && (
          <div className="fixed inset-0 bg-[#4A443F]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-[#FCF9F4] border border-[#F5EBE0] rounded-[40px] p-6 md:p-8 max-w-sm w-full shadow-lg relative flex flex-col gap-5 text-[#5A524C]"
            >
              <button 
                onClick={() => setIsAddFriendOpen(false)}
                className="absolute top-5 right-5 text-[#AE8573] hover:text-[#5A524C]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 pb-2 border-b border-[#F5EBE0]">
                <UserPlus className="w-5 h-5 text-[#D4A373]" />
                <h4 className="text-base font-bold text-[#4A443F]" style={{ fontFamily: "Gowun Batang, serif" }}>
                  🎉 새 기념일 친구 기록 추가하기
                </h4>
              </div>

              <form onSubmit={handleAddFriend} className="flex flex-col gap-4 text-xs">
                
                {/* Friend Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#AE8573]">• 친구 및 받는이 성함</label>
                  <input
                    type="text"
                    required
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    placeholder="예: 김민지"
                    className="w-full bg-white border border-[#F5EBE0] rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373] text-[#5A524C]"
                  />
                </div>

                {/* Anniversary date format option */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#AE8573]">• 생일 / 기념일 날짜</label>
                  <input
                    type="text"
                    required
                    value={newFriendDate}
                    onChange={(e) => setNewFriendDate(e.target.value)}
                    placeholder="예: 10-24 (MM-DD 형식 꼬옥!)"
                    className="w-full bg-white border border-[#F5EBE0] rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373] text-[#5A524C]"
                  />
                  <p className="text-[10px] text-gray-400">일정 계산과 실시간 D-Day 정렬의 마법에 사용됩니다.</p>
                </div>

                {/* Genders, Relations, Age dropdown container */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Gender Select dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-[#AE8573]">• 성별</label>
                    <select
                      value={newFriendGender}
                      onChange={(e) => setNewFriendGender(e.target.value)}
                      className="w-full bg-white border border-[#F5EBE0] rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373]"
                    >
                      <option value="females">여성 👩</option>
                      <option value="males">남성 🧑</option>
                      <option value="unisex">성별 무관 🧸</option>
                    </select>
                  </div>

                  {/* Relationship category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-[#AE8573]">• 관계 설정</label>
                    <select
                      value={newFriendRelationship}
                      onChange={(e) => setNewFriendRelationship(e.target.value)}
                      className="w-full bg-white border border-[#F5EBE0] rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373]"
                    >
                      <option value="친구">소중한 친구</option>
                      <option value="연인">달콤한 연인</option>
                      <option value="부모님">은혜로운 부모님</option>
                      <option value="자녀">소담한 자녀</option>
                      <option value="선생님">존경하는 스승님</option>
                      <option value="직장동료">고마운 동료</option>
                      <option value="동기">격의 없는 동기</option>
                    </select>
                  </div>

                </div>

                {/* Age Level select dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#AE8573]">• 연령 단계</label>
                  <select
                    value={newFriendAgeGroup}
                    onChange={(e) => setNewFriendAgeGroup(e.target.value)}
                    className="w-full bg-white border border-[#F5EBE0] rounded-xl p-3 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373]"
                  >
                    <option value="10s_under">10대 이하</option>
                    <option value="10s">10대</option>
                    <option value="20s_early">20대 초반</option>
                    <option value="20s_late">20대 후반</option>
                    <option value="30s_early">30대 초반</option>
                    <option value="30s_late">30대 후반</option>
                    <option value="40s">40대</option>
                    <option value="50s">50대</option>
                    <option value="60s">60대</option>
                    <option value="70s_over">70대 이상</option>
                  </select>
                </div>

                {/* Hand-written custom interest profile */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-[#AE8573]">• 취향 키워드 한마디 (메모)</label>
                  <textarea
                    value={newFriendMemo}
                    onChange={(e) => setNewFriendMemo(e.target.value)}
                    placeholder="예: '차분한 차 마시기, 구움과자 구우며 힐링함'"
                    className="w-full bg-white border border-[#F5EBE0] rounded-xl p-2 focus:outline-hidden focus:ring-1 focus:ring-[#D4A373] h-[55px]"
                  />
                </div>

                {/* Actions inside modal */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFriendOpen(false)}
                    className="flex-1 py-3 bg-[#FAF3EB] hover:bg-[#F5EBE0] text-[#765446] rounded-xl font-bold transition-all text-center"
                  >
                    취소하기
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#D4A373] hover:bg-[#C99665] text-white rounded-xl font-bold transition-all text-center"
                  >
                    등록 완료구 🐶🌸
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="text-center mt-12 py-6 border-t border-[#F5EBE0]/60 text-xs text-[#AE8573] font-serif italic relative z-10">
        <p>© 2026 Presently. 내 손안의 포근폭닥 생일선물 집사 포구 🐶 | Designed with Clean Minimalism style.</p>
        <p className="mt-1 font-sans not-italic text-[10px] text-gray-400">Vercel과 최적화 연동되어 안정적인 무공해 선물을 소개합니다.</p>
      </footer>

    </div>
  );
}

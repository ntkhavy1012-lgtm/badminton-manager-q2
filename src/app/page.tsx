"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Timeline from "./timeline/Timeline";

const translations = {
  vi: {
    title: "🏸 Badminton Manager",
    subtitle: "Điểm danh, cộng trận và theo dõi lượt đánh realtime",
    totalMembers: "Tổng thành viên",
    presentToday: "Có mặt hôm nay",
    offToday: "Off hôm nay",
    totalMatchesToday: "Tổng trận hôm nay",
    addMember: "Thêm thành viên",
    placeholderMemberName: "Nhập tên thành viên",
    addButton: "Thêm",
    male: "Nam",
    female: "Nữ",
    member: "Member",
    guest: "Vãng lai",
    upcomingMatch: "Trận đang xếp",
    matchTypeAuto: "Trận xếp",
    matchTypeOrder: "Trận order",
    createMatch: "Ghép trận",
    searchPlayerPlaceholder: "Gõ tên người chơi...",
    empty: "Trống",
    teamA: "Team A",
    teamB: "Team B",
    vs: "VS",
    attendanceList: "Danh sách điểm danh",
    resetButton: "Reset",
    deleteGuestButton: "Xoá VL",
    searchMemberPlaceholder: "Tìm kiếm thành viên theo tên...",
    noMembersFound: "Không tìm thấy thành viên nào phù hợp với tìm kiếm.",
    noMembersList: "Chưa có thành viên nào trong danh sách.",
    noMembersLevel: "Chưa có thành viên nào ở trình độ này.",
    select: "Chọn",
    absent: "Vắng",
    present: "Có mặt",
    edit: "Sửa",
    delete: "Xóa",
    all: "All",
    matchChartTitle: "🏆 Biểu đồ lượt đấu",
    matchesCount: "trận",
    noMembersPresent: "Chưa có thành viên nào có mặt.",
    timelineTitle: "⏱ Timeline hoạt động",
    upcomingMatchesList: "Upcoming Match",
    deleteMatch: "Xóa trận",
    noUpcomingMatches: "Chưa có trận đấu nào được ghép.",
    editModalTitle: "Chỉnh sửa thành viên",
    memberNameLabel: "Tên thành viên",
    levelLabel: "Trình độ",
    genderLabel: "Giới tính",
    cancelButton: "Hủy",
    confirmButton: "Xác nhận",
    saveChangesButton: "Lưu thay đổi",
    
    // Alerts and Confirms
    confirmDeleteMember: "Bạn có chắc muốn xoá thành viên \"{name}\" không?",
    confirmDeleteGuests: "Bạn có chắc muốn xoá tất cả thành viên vãng lai?",
    confirmCancelUpcomingMatch: "Bạn có chắc muốn huỷ trận đấu này? Lượt trận của cả 4 người chơi sẽ tự động giảm đi 1.",
    alertMaxPlayers: "Chỉ chọn tối đa 4 người cho 1 trận. Vui lòng bỏ bớt người chơi trước.",
    alertNeedFourPlayers: "Cần chọn đủ 4 người để ghép trận",
    alertMatchError: "Lỗi ghép trận",
    alertResetError: "Lỗi reset trận",
    alertCancelMatchError: "Lỗi huỷ trận đấu",
    alertConfirmMatchError: "Lỗi xác nhận trận đấu",
    cancelMatchActionLog: "Huỷ trận đấu"
  },
  en: {
    title: "🏸 Badminton Manager",
    subtitle: "Check-in, add matches, and track queues in real-time",
    totalMembers: "Total Members",
    presentToday: "Present Today",
    offToday: "Absent Today",
    totalMatchesToday: "Total Matches Today",
    addMember: "Add Member",
    placeholderMemberName: "Enter member name",
    addButton: "Add",
    male: "Male",
    female: "Female",
    member: "Member",
    guest: "Guest",
    upcomingMatch: "Pending Match",
    matchTypeAuto: "Auto Match",
    matchTypeOrder: "Order Match",
    createMatch: "Matchmake",
    searchPlayerPlaceholder: "Type player name...",
    empty: "Empty",
    teamA: "Team A",
    teamB: "Team B",
    vs: "VS",
    attendanceList: "Attendance List",
    resetButton: "Reset",
    deleteGuestButton: "Del Guest",
    searchMemberPlaceholder: "Search member by name...",
    noMembersFound: "No members found matching your search.",
    noMembersList: "No members in the list.",
    noMembersLevel: "No members at this level.",
    select: "Select",
    absent: "Absent",
    present: "Present",
    edit: "Edit",
    delete: "Delete",
    all: "All",
    matchChartTitle: "🏆 Match Leaderboard",
    matchesCount: "matches",
    noMembersPresent: "No members present.",
    timelineTitle: "⏱ Activity Timeline",
    upcomingMatchesList: "Upcoming Matches",
    deleteMatch: "Delete Match",
    noUpcomingMatches: "No upcoming matches created yet.",
    editModalTitle: "Edit Member",
    memberNameLabel: "Member Name",
    levelLabel: "Level",
    genderLabel: "Gender",
    cancelButton: "Cancel",
    confirmButton: "Confirm",
    saveChangesButton: "Save Changes",
    
    // Alerts and Confirms
    confirmDeleteMember: "Are you sure you want to delete member \"{name}\"?",
    confirmDeleteGuests: "Are you sure you want to delete all guest members?",
    confirmCancelUpcomingMatch: "Are you sure you want to cancel this match? All 4 players' match counts will be decremented by 1.",
    alertMaxPlayers: "Maximum 4 players per match. Please remove a player first.",
    alertNeedFourPlayers: "Exactly 4 players are required to create a match.",
    alertMatchError: "Error creating match.",
    alertResetError: "Error resetting matches.",
    alertCancelMatchError: "Error cancelling match",
    alertConfirmMatchError: "Error confirming match",
    cancelMatchActionLog: "Cancelled Match"
  }
};

type Member = {
  id: string;
  name: string;
  level: string;
  present: boolean;
  total_matches: number;
  present_at: string | null;
  gender: string;
  type: string;
};
type UpcomingMatch = {
  id: string;
  players: Member[];
  status: string;
  created_at: string;
  match_type: string;
 
};

const getMatchGenderCategory = (players: Member[], currentLang: "vi" | "en") => {
  const maleCount = players.filter((p) => p.gender === "Nam").length;
  const femaleCount = players.filter((p) => p.gender === "Nữ").length;

  if (maleCount === 4) {
    return currentLang === "vi" ? "Đôi nam" : "Men's Doubles";
  }
  if (femaleCount === 4) {
    return currentLang === "vi" ? "Đôi nữ" : "Women's Doubles";
  }
  if (maleCount === 2 && femaleCount === 2) {
    return currentLang === "vi" ? "Đôi nam nữ" : "Mixed Doubles";
  }
  if ((maleCount === 3 && femaleCount === 1) || (maleCount === 1 && femaleCount === 3)) {
    return currentLang === "vi" ? "Đôi lạ" : "Odd Doubles";
  }
  return currentLang === "vi" ? "Đôi khác" : "Other Doubles";
};

const getCategoryColorClass = (categoryVi: string) => {
  if (categoryVi === "Đôi nam") return "tag-male-double";
  if (categoryVi === "Đôi nữ") return "tag-female-double";
  if (categoryVi === "Đôi nam nữ") return "tag-mixed-double";
  if (categoryVi === "Đôi lạ") return "tag-odd-double";
  return "tag-default-double";
};


export default function Page() {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "vi" || savedLang === "en") {
      setLang(savedLang as "vi" | "en");
    }
  }, []);

  const handleSetLang = (newLang: "vi" | "en") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Basic");
  const [selectedSlots, setSelectedSlots] = useState<(Member | null)[]>([null, null, null, null]);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState<number | null>(null);
  const activeSelectedPlayers = selectedSlots.filter((p): p is Member => p !== null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSlotIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedSlotIndex === null || draggedSlotIndex === targetIndex) return;

    const newSlots = [...selectedSlots];
    const temp = newSlots[draggedSlotIndex];
    newSlots[draggedSlotIndex] = newSlots[targetIndex];
    newSlots[targetIndex] = temp;

    setSelectedSlots(newSlots);
    setDraggedSlotIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSlotIndex(null);
  };

  const removePlayerFromSlot = (index: number) => {
    const newSlots = [...selectedSlots];
    newSlots[index] = null;
    setSelectedSlots(newSlots);
  };

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
const [matchType, setMatchType] = useState("Trận xếp");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("Basic");
  const [editGender, setEditGender] = useState("Nam");
  const [memberType, setMemberType] = useState("Member");
  const [activeLevel, setActiveLevel] = useState("All");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getGroupCounts = (group: string) => {
    const groupMembers = group === "All" ? members : members.filter((m) => m.level === group);
    const presentCount = groupMembers.filter((m) => m.present).length;
    return `${presentCount}/${groupMembers.length}`;
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("total_matches", { ascending: false });

    if (data) {
      const fixedData = data.map((member) => ({
        ...member,
        type: member.type || "Member",
      }));

      setMembers(fixedData);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchUpcomingMatches();
  }, []);

  const addMember = async () => {
    if (!name) return;

    const newMember = {
      name,
      level,
      gender,
      present: false,
      present_at: null,
      total_matches: 0,
      type: memberType,
    };

    const { error } = await supabase.from("members").insert(newMember);

    if (error) {
      console.error("ADD MEMBER ERROR:", error);
      alert(error.message);
      return;
    }

    setName("");
    setMemberType("Member");
    fetchMembers();
  };

 const setPresent = async (id: string, value: boolean) => {
  const { error } = await supabase
    .from("members")
    .update({
  present: value,
  present_at: value ? new Date().toISOString() : null,
})
    .eq("id", id);

 if (error) {
  console.error("FULL ERROR:", JSON.stringify(error, null, 2));
  alert(error.message);
  return;
}

  fetchMembers();
  };

const addMatch = async (id: string) => {
  const member = members.find((m) => m.id === id);
  if (!member) return;

  const newTotal = member.total_matches + 1;

  const { error } = await supabase
    .from("members")
    .update({ total_matches: newTotal })
    .eq("id", id);

  if (error) {
  console.error("FULL ERROR:", JSON.stringify(error, null, 2));
  alert(error.message);
  return;
}

  await supabase.from("match_logs").insert({
    member_id: id,
    member_name: member.name,
    action: "+1 trận",
    matches_after: newTotal,
  });

  fetchMembers();
  };

const removeMatch = async (id: string) => {
  const member = members.find((m) => m.id === id);
  if (!member) return;

  const newTotal = Math.max(0, member.total_matches - 1);

  const { error } = await supabase
    .from("members")
    .update({ total_matches: newTotal })
    .eq("id", id);

  if (error) {
  console.error("FULL ERROR:", JSON.stringify(error, null, 2));
  alert(error.message);
  return;
}
  await supabase.from("match_logs").insert({
    member_id: id,
    member_name: member.name,
    action: "-1 trận",
    matches_after: newTotal,
  });

  fetchMembers();
  };

  const deleteMember = async (id: string, name: string) => {
    const ok = window.confirm(translations[lang].confirmDeleteMember.replace("{name}", name));

    if (!ok) return;

    await supabase.from("members").delete().eq("id", id);
    fetchMembers();
  };

  const openEditMember = (member: Member) => {
    setEditingMember(member);
    setEditName(member.name);
    setEditLevel(member.level);
    setEditGender(member.gender || "Nam");
  };

  const saveEditMember = async () => {
    if (!editingMember) return;

    await supabase
      .from("members")
      .update({
        name: editName,
        level: editLevel,
        gender: editGender,
      })
      .eq("id", editingMember.id);

    setEditingMember(null);
    fetchMembers();
  };

  const [gender, setGender] = useState("Nam");

  const totalMembers = members.length;
  const presentToday = members.filter((m) => m.present).length;
  const offToday = totalMembers - presentToday;
  const totalMatches = members.reduce(
    (sum, m) => sum + m.total_matches,
    0
  );

  const deleteGuestMembers = async () => {
    const ok = confirm(translations[lang].confirmDeleteGuests);
    if (!ok) return;

    const { error } = await supabase
      .from("members")
      .delete()
      .eq("type", "Vãng lai");

    if (error) {
      alert(error.message);
      return;
    }

    fetchMembers();
  };

  const resetMatches = async () => {
    const { error } = await supabase
      .from("members")
      .update({ total_matches: 0 })
      .gte("total_matches", 0);

    if (error) {
      console.error("Reset matches error:", error);
      alert(translations[lang].alertResetError);
      return;
    }

    fetchMembers();
  };

  const toggleSelectPlayer = (member: Member) => {
    const existsIndex = selectedSlots.findIndex((p) => p?.id === member.id);

    if (existsIndex !== -1) {
      const newSlots = [...selectedSlots];
      newSlots[existsIndex] = null;
      setSelectedSlots(newSlots);
      return;
    }

    const emptyIndex = selectedSlots.findIndex((p) => p === null);
    if (emptyIndex === -1) {
      alert(translations[lang].alertMaxPlayers);
      return;
    }

    const newSlots = [...selectedSlots];
    newSlots[emptyIndex] = member;
    setSelectedSlots(newSlots);
  };

  const fetchUpcomingMatches = async () => {
    const { data, error } = await supabase
      .from("upcoming_matches")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch upcoming matches error:", error);
      return;
    }

    setUpcomingMatches((data || []) as UpcomingMatch[]);
  };

  const createUpcomingMatch = async () => {
    if (activeSelectedPlayers.length !== 4) {
      alert(translations[lang].alertNeedFourPlayers);
      return;
    }

    const { error: matchError } = await supabase
      .from("upcoming_matches")
      .insert({
        players: activeSelectedPlayers,
        status: "upcoming",
        match_type: matchType,
      });

    if (matchError) {
      console.error(matchError);
      alert(translations[lang].alertMatchError);
      return;
    }

  for (const player of activeSelectedPlayers) {
    const current = members.find((m) => m.id === player.id);

    await supabase
      .from("members")
      .update({
        total_matches: (current?.total_matches || 0) + 1,
      })
      .eq("id", player.id);
  }

  await supabase.from("match_logs").insert({
    member_id: activeSelectedPlayers[0].id,

    member_name: activeSelectedPlayers
      .map((p) => p.name.split(" ").slice(-2).join(" "))
      .join(" • "),

    action: `${matchType}`,
    matches_after: 0,
  });

  setSelectedSlots([null, null, null, null]);

  fetchMembers();
  fetchUpcomingMatches();
};
const confirmUpcomingMatch = async (match: UpcomingMatch) => {
  const { error } = await supabase
    .from("upcoming_matches")
    .delete()
    .eq("id", match.id);

  if (error) {
    console.error("Confirm match error:", error);
    alert(translations[lang].alertConfirmMatchError);
    return;
  }

  fetchUpcomingMatches();
};

const cancelUpcomingMatch = async (match: UpcomingMatch) => {
  const ok = window.confirm(translations[lang].confirmCancelUpcomingMatch);
  if (!ok) return;

  const { error: deleteError } = await supabase
    .from("upcoming_matches")
    .delete()
    .eq("id", match.id);

  if (deleteError) {
    console.error("Cancel match error:", deleteError);
    alert(translations[lang].alertCancelMatchError);
    return;
  }

  for (const player of match.players) {
    const currentMember = members.find((m) => m.id === player.id);
    if (currentMember) {
      const newTotal = Math.max(0, currentMember.total_matches - 1);
      await supabase
        .from("members")
        .update({ total_matches: newTotal })
        .eq("id", player.id);
    }
  }

  await supabase.from("match_logs").insert({
    member_id: match.players[0].id,
    member_name: match.players
      .map((p) => p.name.split(" ").slice(-2).join(" "))
      .join(" • "),
    action: translations[lang].cancelMatchActionLog,
    matches_after: 0,
  });

  fetchMembers();
  fetchUpcomingMatches();
};

const formatPresentTime = (time: string | null) => {
  if (!time) return "";

  return new Date(time).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase().replace(":00", "");
};

const [searchPlayer, setSearchPlayer] = useState("");
const normalizeText = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const playerSuggestions = members
  .filter((member) => member.present)
  .filter(
    (member) =>
      normalizeText(member.name).includes(normalizeText(searchPlayer))
  )
  .filter(
    (member) =>
      !selectedSlots.some((p) => p?.id === member.id)
  )
  .sort((a, b) => {
    const keyword = normalizeText(searchPlayer);

    const aWords = normalizeText(a.name).split(" ");
    const bWords = normalizeText(b.name).split(" ");

    const aLast = aWords[aWords.length - 1];
    const bLast = bWords[bWords.length - 1];

    const aExactLast = aLast === keyword;
    const bExactLast = bLast === keyword;

    // ưu tiên tên cuối khớp chính xác
    if (aExactLast !== bExactLast) {
      return Number(bExactLast) - Number(aExactLast);
    }

    return a.name.localeCompare(b.name);
  })
  .slice(0, 6);

  const filteredAndSortedMembers = [...members]
    .filter((member) => activeLevel === "All" || member.level === activeLevel)
    .filter((member) =>
      normalizeText(member.name).includes(normalizeText(attendanceSearch))
    )
    .sort((a, b) => {
      const pa = Number(a.present);
      const pb = Number(b.present);

      if (pa !== pb) return pb - pa;

      const aLast = a.name.trim().split(" ").pop() || "";
      const bLast = b.name.trim().split(" ").pop() || "";

      return aLast.localeCompare(bLast);
    });

  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const activePage = currentPage > totalPages ? 1 : currentPage;
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedMembers = filteredAndSortedMembers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="container">
      {/* Floating Language Switcher */}
      <div className="language-switcher-container">
        <button
          className={`lang-btn ${lang === "vi" ? "active" : ""}`}
          onClick={() => handleSetLang("vi")}
        >
          🇻🇳 VN
        </button>
        <button
          className={`lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => handleSetLang("en")}
        >
          🇬🇧 ENG
        </button>
      </div>

      <div className="title">{translations[lang].title}</div>

      <div className="subtitle">
        {translations[lang].subtitle}
      </div>

      <div className="page-layout">
        <div className="left-panel">
          {/* Top Stats Cards */}
          <div className="grid-4">
            <div className="card">
              <div className="card-title">{translations[lang].totalMembers}</div>
              <div className="card-number">{totalMembers}</div>
            </div>

            <div className="card">
              <div className="card-title">{translations[lang].presentToday}</div>
              <div className="card-number">{presentToday}</div>
            </div>

            <div className="card">
              <div className="card-title">{translations[lang].offToday}</div>
              <div className="card-number">{offToday}</div>
            </div>

            <div className="card">
              <div className="card-title">{translations[lang].totalMatchesToday}</div>
              <div className="card-number">{totalMatches}</div>
            </div>
          </div>

          {/* Thêm thành viên */}
          <div className="card mb-4">
            <div className="section-title">{translations[lang].addMember}</div>

            <div className="flex gap-4">
              <input
                className="flex-1"
                placeholder={translations[lang].placeholderMemberName}
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />

              <select
                value={level}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setLevel(e.target.value)
                }
              >
                <option>Basic</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <select
                value={gender}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setGender(e.target.value)
                }
              >
                <option value="Nam">{translations[lang].male}</option>
                <option value="Nữ">{translations[lang].female}</option>
              </select>

              <select
                value={memberType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setMemberType(e.target.value)
                }
              >
                <option value="Member">{translations[lang].member}</option>
                <option value="Vãng lai">{translations[lang].guest}</option>
              </select>

              <button className="black-btn" onClick={addMember}>
                {translations[lang].addButton}
              </button>
            </div>
          </div>

          {/* Trận đang xếp (Matchmaker Composer Relocated) */}
          <div className="card match-compose-card mb-4">
            <div className="section-header">
              <div className="section-title">{translations[lang].upcomingMatch}</div>

              <div className="match-compose-actions">
                <select
                  className="match-type-select"
                  value={matchType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setMatchType(e.target.value)
                  }
                >
                  <option value="Trận xếp">{translations[lang].matchTypeAuto}</option>
                  <option value="Trận order">{translations[lang].matchTypeOrder}</option>
                </select>

                <button className="black-btn" onClick={createUpcomingMatch}>
                  {translations[lang].createMatch}
                </button>
              </div>
            </div>

            <div className="match-search-box">
              <input
                className="match-search-input"
                placeholder={translations[lang].searchPlayerPlaceholder}
                value={searchPlayer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchPlayer(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && playerSuggestions[0]) {
                    toggleSelectPlayer(playerSuggestions[0]);
                    setSearchPlayer("");
                  }
                }}
              />

              {searchPlayer && (
                <div className="match-suggestions">
                  {playerSuggestions.map((member) => (
                    <div
                      key={member.id}
                      className="match-suggestion-item"
                      onClick={() => {
                        toggleSelectPlayer(member);
                        setSearchPlayer("");
                      }}
                    >
                      {member.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Premium Court DnD Layout */}
            <div className="matchmaker-court-container">
              <div className="team-column">
                <div className="team-title text-blue">{translations[lang].teamA}</div>
                {/* Slot 0 */}
                <div
                  className={`matchmaker-slot ${selectedSlots[0] ? "occupied" : "empty"} ${
                    selectedSlots[0]
                      ? selectedSlots[0].gender === "Nam"
                        ? "slot-male"
                        : "slot-female"
                      : ""
                  } ${draggedSlotIndex === 0 ? "dragging" : ""}`}
                  draggable={!!selectedSlots[0]}
                  onDragStart={(e) => handleDragStart(e, 0)}
                  onDragOver={(e) => handleDragOver(e, 0)}
                  onDrop={(e) => handleDrop(e, 0)}
                  onDragEnd={handleDragEnd}
                >
                  {selectedSlots[0] ? (
                    <div className="slot-player-content">
                      <span className="slot-player-name">{selectedSlots[0].name}</span>
                      <span className="slot-player-level">{selectedSlots[0].level}</span>
                      <button className="remove-player-btn" onClick={() => removePlayerFromSlot(0)}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="slot-empty-text">{translations[lang].empty}</span>
                  )}
                </div>

                {/* Slot 1 */}
                <div
                  className={`matchmaker-slot ${selectedSlots[1] ? "occupied" : "empty"} ${
                    selectedSlots[1]
                      ? selectedSlots[1].gender === "Nam"
                        ? "slot-male"
                        : "slot-female"
                      : ""
                  } ${draggedSlotIndex === 1 ? "dragging" : ""}`}
                  draggable={!!selectedSlots[1]}
                  onDragStart={(e) => handleDragStart(e, 1)}
                  onDragOver={(e) => handleDragOver(e, 1)}
                  onDrop={(e) => handleDrop(e, 1)}
                  onDragEnd={handleDragEnd}
                >
                  {selectedSlots[1] ? (
                    <div className="slot-player-content">
                      <span className="slot-player-name">{selectedSlots[1].name}</span>
                      <span className="slot-player-level">{selectedSlots[1].level}</span>
                      <button className="remove-player-btn" onClick={() => removePlayerFromSlot(1)}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="slot-empty-text">{translations[lang].empty}</span>
                  )}
                </div>
              </div>

              <div className="vs-divider-wrapper">
                <div className="vs-badge">{translations[lang].vs}</div>
              </div>

              <div className="team-column">
                <div className="team-title text-orange">{translations[lang].teamB}</div>
                {/* Slot 2 */}
                <div
                  className={`matchmaker-slot ${selectedSlots[2] ? "occupied" : "empty"} ${
                    selectedSlots[2]
                      ? selectedSlots[2].gender === "Nam"
                        ? "slot-male"
                        : "slot-female"
                      : ""
                  } ${draggedSlotIndex === 2 ? "dragging" : ""}`}
                  draggable={!!selectedSlots[2]}
                  onDragStart={(e) => handleDragStart(e, 2)}
                  onDragOver={(e) => handleDragOver(e, 2)}
                  onDrop={(e) => handleDrop(e, 2)}
                  onDragEnd={handleDragEnd}
                >
                  {selectedSlots[2] ? (
                    <div className="slot-player-content">
                      <span className="slot-player-name">{selectedSlots[2].name}</span>
                      <span className="slot-player-level">{selectedSlots[2].level}</span>
                      <button className="remove-player-btn" onClick={() => removePlayerFromSlot(2)}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="slot-empty-text">{translations[lang].empty}</span>
                  )}
                </div>

                {/* Slot 3 */}
                <div
                  className={`matchmaker-slot ${selectedSlots[3] ? "occupied" : "empty"} ${
                    selectedSlots[3]
                      ? selectedSlots[3].gender === "Nam"
                        ? "slot-male"
                        : "slot-female"
                      : ""
                  } ${draggedSlotIndex === 3 ? "dragging" : ""}`}
                  draggable={!!selectedSlots[3]}
                  onDragStart={(e) => handleDragStart(e, 3)}
                  onDragOver={(e) => handleDragOver(e, 3)}
                  onDrop={(e) => handleDrop(e, 3)}
                  onDragEnd={handleDragEnd}
                >
                  {selectedSlots[3] ? (
                    <div className="slot-player-content">
                      <span className="slot-player-name">{selectedSlots[3].name}</span>
                      <span className="slot-player-level">{selectedSlots[3].level}</span>
                      <button className="remove-player-btn" onClick={() => removePlayerFromSlot(3)}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="slot-empty-text">{translations[lang].empty}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attendance card with Chrome Tabs */}
          <div className="card attendance-card">
            {/* Chrome tabs container */}
            <div className="tabs-container">
              {["All", "Advanced", "Intermediate", "Beginner", "Basic"].map((group) => (
                <div
                  key={group}
                  className={`chrome-tab ${activeLevel === group ? "active" : ""}`}
                  onClick={() => {
                    setActiveLevel(group);
                    setCurrentPage(1);
                  }}
                >
                  {group === "All" ? translations[lang].all : group}
                  <span className="tab-badge">{getGroupCounts(group)}</span>
                </div>
              ))}
            </div>

            <div className="section-header">
              <div className="section-title">
                {translations[lang].attendanceList} ({activeLevel === "All" ? translations[lang].all : activeLevel})
              </div>

              <div className="attendance-actions">
                <button className="reset-btn" onClick={resetMatches}>
                  <span className="reset-icon">↻</span>
                  {translations[lang].resetButton}
                </button>
                <button className="delete-guest-btn" onClick={deleteGuestMembers}>
                  🗑 {translations[lang].deleteGuestButton}
                </button>
              </div>
            </div>

            {/* Attendance Search Bar */}
            <div className="attendance-search-container">
              <svg className="attendance-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                className="attendance-search-input"
                placeholder={translations[lang].searchMemberPlaceholder}
                value={attendanceSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setAttendanceSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {attendanceSearch && (
                <button className="clear-search-btn" onClick={() => setAttendanceSearch("")}>
                  ✕
                </button>
              )}
            </div>

            <div className="attendance-scroll">
              <div className="attendance-group">
                {paginatedMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`member-card ${
                      member.present
                        ? member.gender === "Nam"
                          ? "member-active-male"
                          : "member-active-female"
                        : ""
                    } ${
                      member.type === "Vãng lai"
                        ? "guest-member"
                        : ""
                    }`}
                  >
                    <div className="member-left">
                      <div className="member-info-block">
                        <div className="member-name-row">
                          <span className={`status-dot-indicator ${member.present ? "active" : "inactive"}`} title={member.present ? translations[lang].present : translations[lang].absent}></span>
                          <span className="member-name-text">
                            {member.type === "Vãng lai" && (
                              <span className="guest-warning">!</span>
                            )}
                            {startIndex + index + 1}. {member.name}
                          </span>
                        </div>
                        
                        <div className="member-meta-row">
                          <span className={`level-pill level-${member.level.toLowerCase()}`}>
                            {member.level}
                          </span>
                          <span className="meta-divider">•</span>
                          <span className="meta-matches">
                            {member.total_matches} {translations[lang].matchesCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="member-actions">
                      {member.present ? (
                        <>
                          <button
                            className={
                              selectedSlots.some((p) => p?.id === member.id)
                                ? "yellow-btn active-select"
                                : "yellow-soft-btn"
                            }
                            onClick={() => toggleSelectPlayer(member)}
                          >
                            {translations[lang].select}
                          </button>

                          <button
                            className="blue-btn"
                            onClick={() => addMatch(member.id)}
                          >
                            +1
                          </button>

                          <button
                            className="orange-btn"
                            onClick={() => removeMatch(member.id)}
                          >
                            -1
                          </button>

                          <button
                            className="gray-btn"
                            onClick={() => setPresent(member.id, false)}
                          >
                            {translations[lang].absent}
                          </button>
                        </>
                      ) : (
                        <button
                          className="green-btn"
                          onClick={() => setPresent(member.id, true)}
                        >
                          {translations[lang].present}
                        </button>
                      )}

                      <div className="member-util-actions">
                        <button
                          className="edit-btn-icon"
                          onClick={() => openEditMember(member)}
                          title={translations[lang].edit}
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-btn-icon"
                          onClick={() => deleteMember(member.id, member.name)}
                          title={translations[lang].delete}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredAndSortedMembers.length === 0 && (
                  <div className="empty-text">
                    {attendanceSearch 
                      ? translations[lang].noMembersFound 
                      : activeLevel === "All"
                        ? translations[lang].noMembersList
                        : translations[lang].noMembersLevel}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                  title={lang === "vi" ? "Trang trước" : "Previous page"}
                >
                  &laquo;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${activePage === page ? "active" : ""}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  className="pagination-btn"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                  title={lang === "vi" ? "Trang sau" : "Next page"}
                >
                  &raquo;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel */}
        <div className="middle-panel">
          {/* Leaderboard Chart Card */}
          <div className="card leaderboard-card">
            <div className="section-title">{translations[lang].matchChartTitle}</div>

            <div className="leaderboard-list">
              {members
                .filter((member) => member.present)
                .sort((a, b) => a.total_matches - b.total_matches)
                .map((member, index) => (
                  <div key={member.id} className="leaderboard-item">
                    <div className="leaderboard-header">
                      <div className="leaderboard-user">
                        <span className="leaderboard-rank">#{index + 1}</span>
                        <span className="leaderboard-name">{member.name}</span>
                        {member.present_at && (
                          <span className="leaderboard-time">
                            ({formatPresentTime(member.present_at)})
                          </span>
                        )}
                      </div>

                      <div className="leaderboard-count">
                        <strong>{member.total_matches}</strong> {translations[lang].matchesCount}
                      </div>
                    </div>

                    <div className="bar-bg">
                      <div
                        className={`bar-fill ${
                          member.total_matches <= 5
                            ? "low"
                            : member.total_matches <= 10
                            ? "mid"
                            : "high"
                        }`}
                        style={{
                          width: `${Math.min(100, member.total_matches * 10)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              {members.filter((member) => member.present).length === 0 && (
                <div className="empty-text">{translations[lang].noMembersPresent}</div>
              )}
            </div>
          </div>

          {/* Timeline Activities Card */}
          <div className="card timeline-card">
            <div className="section-title">{translations[lang].timelineTitle}</div>
            <Timeline lang={lang} />
          </div>
        </div>

        {/* Right Panel (Sidebar) */}
        <div className="right-panel">
          {/* Trận đang xếp (Matchmaker Composer) */}


          {/* Upcoming Matches list */}
          <div className="card upcoming-card">
            <div className="section-title">{translations[lang].upcomingMatchesList}</div>

            {upcomingMatches.map((match, index) => {
              const categoryVi = getMatchGenderCategory(match.players, "vi");
              const categoryColorClass = getCategoryColorClass(categoryVi);
              const categoryTranslated = getMatchGenderCategory(match.players, lang);
              
              return (
                <div
                  key={match.id}
                  className={`match-order-card ${
                    match.match_type === "Trận order"
                      ? "match-order-purple"
                      : "match-order-yellow"
                  }`}
                >
                  <div className="match-card-header">
                    <div className="match-order-title">
                      Match #{index + 1}
                    </div>
                    <div className="match-category-tags">
                      <span className="match-type-tag" style={{ marginBottom: 0 }}>
                        {match.match_type === "Trận order" ? translations[lang].matchTypeOrder : translations[lang].matchTypeAuto}
                      </span>
                      <span className={`match-category-tag ${categoryColorClass}`}>
                        {categoryTranslated}
                      </span>
                    </div>
                  </div>

                  {/* Visual VS Matchup layout */}
                  <div className="matchup-box">
                    <div className="matchup-team team-a">
                      <div className="matchup-player" title={match.players[0]?.level}>
                        <span className={`gender-dot ${match.players[0]?.gender === "Nam" ? "male" : "female"}`}></span>
                        {match.players[0]?.name}
                      </div>
                      <div className="matchup-player" title={match.players[1]?.level}>
                        <span className={`gender-dot ${match.players[1]?.gender === "Nam" ? "male" : "female"}`}></span>
                        {match.players[1]?.name}
                      </div>
                    </div>
                    <div className="matchup-vs-divider">
                      <span className="vs-badge-small">VS</span>
                    </div>
                    <div className="matchup-team team-b">
                      <div className="matchup-player" title={match.players[2]?.level}>
                        <span className={`gender-dot ${match.players[2]?.gender === "Nam" ? "male" : "female"}`}></span>
                        {match.players[2]?.name}
                      </div>
                      <div className="matchup-player" title={match.players[3]?.level}>
                        <span className={`gender-dot ${match.players[3]?.gender === "Nam" ? "male" : "female"}`}></span>
                        {match.players[3]?.name}
                      </div>
                    </div>
                  </div>

                  <div className="match-card-actions gap-2">
                    <button
                      className="cancel-match-btn"
                      onClick={() => cancelUpcomingMatch(match)}
                    >
                      {translations[lang].cancelButton}
                    </button>
                    <button
                      className="confirm-match-btn"
                      onClick={() => confirmUpcomingMatch(match)}
                    >
                      {translations[lang].confirmButton}
                    </button>
                  </div>
                </div>
              );
            })}
            {upcomingMatches.length === 0 && (
              <div className="empty-text">{translations[lang].noUpcomingMatches}</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editingMember && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <div className="modal-title">{translations[lang].editModalTitle}</div>

            <label>{translations[lang].memberNameLabel}</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <label>{translations[lang].levelLabel}</label>
            <select
              value={editLevel}
              onChange={(e) => setEditLevel(e.target.value)}
            >
              <option>Basic</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <label>{translations[lang].genderLabel}</label>
            <select
              value={editGender}
              onChange={(e) => setEditGender(e.target.value)}
            >
              <option value="Nam">{translations[lang].male}</option>
              <option value="Nữ">{translations[lang].female}</option>
            </select>

            <div className="modal-actions">
              <button
                className="gray-btn"
                onClick={() => setEditingMember(null)}
              >
                {translations[lang].cancelButton}
              </button>

              <button
                className="black-btn"
                onClick={saveEditMember}
              >
                {translations[lang].saveChangesButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
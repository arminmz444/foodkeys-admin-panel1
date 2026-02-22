import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Typography,
  Alert,
  Switch,
  Button,
  TextField,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  InputAdornment,
  Snackbar,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { getServerFile } from "src/utils/string-utils";

/* Helpers */
const formatNumber = (n) =>
  n != null ? Number(n).toLocaleString("fa-IR") : "\u06F0";

/* SearchBar */
const SearchBar = React.memo(function SearchBar({ value, onChange }) {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="\u062C\u0633\u062A\u062C\u0648\u06CC \u06A9\u0627\u0631\u0628\u0631..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
          backgroundColor: "white",
          "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
          "&.Mui-focused": { boxShadow: "0 2px 16px rgba(99,102,241,0.15)" },
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <FuseSvgIcon size={18} className="text-gray-400">
              heroicons-outline:search
            </FuseSvgIcon>
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => onChange("")}>
              <FuseSvgIcon size={16} className="text-gray-400">
                heroicons-outline:x
              </FuseSvgIcon>
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
});

/* UserCard */
const UserCard = React.memo(function UserCard({ user, isSelected, onSelect }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        onClick={() => onSelect(user)}
        className={`cursor-pointer rounded-2xl p-16 transition-all duration-200 border ${
          isSelected
            ? "bg-gradient-to-l from-indigo-50 to-blue-50 border-indigo-200 shadow-md shadow-indigo-100"
            : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-14">
          <div className="relative">
            <Avatar
              src={getServerFile(user.avatar)}
              alt={user.label}
              className="w-48 h-48 ring-2 ring-offset-2"
              sx={{ ringColor: isSelected ? "#6366f1" : "#e5e7eb" }}
            />
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 -right-2 w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center"
              >
                <FuseSvgIcon size={12} className="text-white">
                  heroicons-solid:check
                </FuseSvgIcon>
              </motion.div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Typography
              variant="body1"
              className={`font-semibold truncate ${isSelected ? "text-indigo-900" : "text-gray-800"}`}
            >
              {user.label}
            </Typography>
            <Typography variant="caption" className="text-gray-500 block">
              {user.username}
            </Typography>
          </div>
          {isSelected && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Chip label="\u0627\u0646\u062A\u062E\u0627\u0628 \u0634\u062F\u0647" size="small" className="bg-indigo-100 text-indigo-700 font-medium" />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

/* UserList */
const UserList = React.memo(function UserList({
  users,
  hasMore,
  loadMore,
  onSelectUser,
  selectedUserId,
  searchTerm,
  onSearchChange,
}) {
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(
      (u) => u.label?.toLowerCase().includes(lower) || u.username?.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  return (
    <div className="flex flex-col gap-16 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="w-40 h-40 rounded-xl bg-indigo-100 flex items-center justify-center">
            <FuseSvgIcon size={20} className="text-indigo-600">heroicons-outline:users</FuseSvgIcon>
          </div>
          <div>
            <Typography variant="subtitle1" className="font-bold text-gray-800">{"\u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646"}</Typography>
            <Typography variant="caption" className="text-gray-500">{filteredUsers.length} {"\u06A9\u0627\u0631\u0628\u0631"}</Typography>
          </div>
        </div>
      </div>
      <SearchBar value={searchTerm} onChange={onSearchChange} />
      <div id="scrollableUserList" className="flex-1 overflow-auto rounded-2xl" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <InfiniteScroll
          dataLength={users.length}
          next={loadMore}
          hasMore={hasMore}
          scrollableTarget="scrollableUserList"
          style={{ overflow: "visible" }}
          loader={
            <div className="flex items-center justify-center gap-8 py-16">
              <CircularProgress size={20} className="text-indigo-500" />
              <Typography variant="body2" className="text-gray-500">{"\u062F\u0631 \u062D\u0627\u0644 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC..."}</Typography>
            </div>
          }
          endMessage={
            filteredUsers.length > 0 && (
              <Typography variant="body2" className="text-gray-400 text-center py-12">
                {"\u2713 \u0647\u0645\u0647 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0628\u0627\u0631\u06AF\u0630\u0627\u0631\u06CC \u0634\u062F\u0646\u062F"}
              </Typography>
            )
          }
        >
          <div className="flex flex-col gap-6">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((user) => (
                <UserCard key={user.value} user={user} isSelected={user.value === selectedUserId} onSelect={onSelectUser} />
              ))}
            </AnimatePresence>
          </div>
        </InfiniteScroll>
        {filteredUsers.length === 0 && !hasMore && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-48 text-gray-400">
            <FuseSvgIcon size={48} className="text-gray-300 mb-8">heroicons-outline:search</FuseSvgIcon>
            <Typography>{"\u06A9\u0627\u0631\u0628\u0631\u06CC \u06CC\u0627\u0641\u062A \u0646\u0634\u062F"}</Typography>
          </motion.div>
        )}
      </div>
    </div>
  );
});

/* StatCard */
function StatCard({ icon, label, value, color = "indigo", delay = 0 }) {
  const styles = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", grad: "from-indigo-500 to-indigo-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", grad: "from-emerald-500 to-emerald-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", grad: "from-amber-500 to-amber-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", grad: "from-rose-500 to-rose-600" },
  };
  const s = styles[color] || styles.indigo;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
      <div className={`rounded-2xl ${s.bg} p-20`}>
        <div className="flex items-center gap-12 mb-8">
          <div className={`w-36 h-36 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-sm`}>
            <FuseSvgIcon size={18} className="text-white">{icon}</FuseSvgIcon>
          </div>
          <Typography variant="caption" className={`font-medium ${s.text}`}>{label}</Typography>
        </div>
        <Typography variant="h5" className="font-extrabold text-gray-900">{value}</Typography>
      </div>
    </motion.div>
  );
}

/* ================================================================
   CreditManagerApp
   ================================================================ */
export default function CreditManagerApp() {
  const [users, setUsers] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const hasMore = useMemo(() => pageNumber <= totalPages, [pageNumber, totalPages]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [credit, setCredit] = useState(null);
  const [isLoadingCredit, setIsLoadingCredit] = useState(false);

  const [ghostMode, setGhostMode] = useState(false);
  const [operation, setOperation] = useState("INCREASE");
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");

  /* Fetch users */
  const loadUsers = useCallback(async () => {
    if (isLoadingUsers) return;
    setIsLoadingUsers(true);
    try {
      const res = await axios.get("/user/options", { params: { pageSize: 10, pageNumber } });
      if (res.data.status === "SUCCESS") {
        const { data, pagination } = res.data;
        setUsers((prev) => [...prev, ...data]);
        setPageNumber(pagination.pageNumber + 1);
        setTotalPages(pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [pageNumber, isLoadingUsers]);

  useEffect(() => { loadUsers(); }, []);

  /* Select user */
  const handleSelectUser = useCallback(async (user) => {
    setSelectedUser(user);
    setCredit(null);
    setErrorMessage("");
    setAmount("");
    setIsLoadingCredit(true);
    try {
      const res = await axios.get(`/user/${user.value}/credit`);
      if (res.data.status === "SUCCESS") setCredit(res.data.data);
      else setErrorMessage("\u062E\u0637\u0627 \u062F\u0631 \u0648\u0627\u06A9\u0634\u06CC \u0627\u0639\u062A\u0628\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631");
    } catch { setErrorMessage("\u062E\u0637\u0627 \u062F\u0631 \u0648\u0627\u06A9\u0634\u06CC \u0627\u0639\u062A\u0628\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631"); }
    finally { setIsLoadingCredit(false); }
  }, []);

  const handleGhostModeToggle = (e) => {
    setGhostMode(e.target.checked);
    setErrorMessage("");
    setOperation("INCREASE");
    setAmount("");
  };

  /* Apply changes */
  const handleApplyChanges = useCallback(async () => {
    setErrorMessage("");
    if (!selectedUser) { setErrorMessage("\u0644\u0637\u0641\u0627\u064B \u0627\u0628\u062A\u062F\u0627 \u06A9\u0627\u0631\u0628\u0631\u06CC \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F."); return; }
    if (!amount || isNaN(amount)) { setErrorMessage("\u0644\u0637\u0641\u0627\u064B \u0645\u0628\u0644\u063A \u0631\u0627 \u0628\u0647 \u062F\u0631\u0633\u062A\u06CC \u0648\u0627\u0631\u062F \u06A9\u0646\u06CC\u062F."); return; }
    const numericAmount = Number(amount);
    if (numericAmount < 0) { setErrorMessage("\u0645\u0628\u0644\u063A \u0648\u0627\u0631\u062F \u0634\u062F\u0647 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u0646\u0641\u06CC \u0628\u0627\u0634\u062F."); return; }
    if (ghostMode && numericAmount < 0) { setErrorMessage("\u0627\u0639\u062A\u0628\u0627\u0631 \u0646\u0645\u06CC\u200C\u062A\u0648\u0627\u0646\u062F \u0645\u0646\u0641\u06CC \u0628\u0627\u0634\u062F."); return; }
    if (!ghostMode && operation === "DECREASE" && (credit ?? 0) - numericAmount < 0) {
      setErrorMessage("\u0639\u0645\u0644\u06CC\u0627\u062A \u0646\u0627\u0645\u0639\u062A\u0628\u0631! \u0627\u0639\u062A\u0628\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631 \u0645\u0646\u0641\u06CC \u0645\u06CC\u200C\u0634\u0648\u062F.");
      return;
    }
    setIsApplying(true);
    try {
      const res = await axios.post(`/user/${selectedUser.value}/credit`, { amount: numericAmount, ghostModeOn: ghostMode, operation });
      if (res.data.status === "SUCCESS") {
        setCredit(res.data.data);
        setSuccessAnim(true);
        setTimeout(() => setSuccessAnim(false), 2200);
        setAmount("");
        setSnackMsg("\u0627\u0639\u062A\u0628\u0627\u0631 \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0628\u0647\u200C\u0631\u0648\u0632\u0631\u0633\u0627\u0646\u06CC \u0634\u062F \u2713");
        setSnackOpen(true);
      } else setErrorMessage(res.data.message || "\u062E\u0637\u0627 \u062F\u0631 \u0627\u0639\u0645\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A");
    } catch { setErrorMessage("\u062E\u0637\u0627 \u062F\u0631 \u0627\u0639\u0645\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A"); }
    finally { setIsApplying(false); }
  }, [selectedUser, amount, credit, ghostMode, operation]);

  const previewCredit = useMemo(() => {
    if (!amount || isNaN(amount) || Number(amount) <= 0 || ghostMode) return null;
    const n = Number(amount);
    return operation === "INCREASE" ? (credit ?? 0) + n : (credit ?? 0) - n;
  }, [amount, credit, ghostMode, operation]);

  /*  RENDER  */
  return (
    <div dir="rtl" className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-16 sm:p-24 lg:p-32">
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-24 sm:mb-32">
        <div className="flex items-center gap-16 mb-8">
          <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <FuseSvgIcon size={24} className="text-white">heroicons-outline:credit-card</FuseSvgIcon>
          </div>
          <div>
            <Typography variant="h5" className="font-extrabold text-gray-900">{"\u0645\u062F\u06CC\u0631\u06CC\u062A \u0627\u0639\u062A\u0628\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646"}</Typography>
            <Typography variant="body2" className="text-gray-500 mt-2">{"\u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u062A\u063A\u06CC\u06CC\u0631 \u0627\u0639\u062A\u0628\u0627\u0631 \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0633\u06CC\u0633\u062A\u0645"}</Typography>
          </div>
        </div>
      </motion.div>

      {/* Top Alert */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-24">
        <AnimatePresence mode="wait">
          <motion.div key={ghostMode ? "g" : "n"} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
            {ghostMode ? (
              <Alert severity="warning" variant="filled" className="!rounded-2xl !text-right !leading-8 shadow-lg shadow-amber-200/40"
                icon={<FuseSvgIcon size={20} className="text-white">heroicons-outline:eye-off</FuseSvgIcon>}>
                <span className="font-medium">{"\u062D\u0627\u0644\u062A \u0645\u062E\u0641\u06CC \u0641\u0639\u0627\u0644 \u0627\u0633\u062A"}</span> {"\u2014 \u0647\u06CC\u0686 \u062A\u0631\u0627\u06A9\u0646\u0634\u06CC \u062B\u0628\u062A \u0646\u0645\u06CC\u200C\u0634\u0648\u062F"}
              </Alert>
            ) : (
              <Alert severity="info" variant="outlined" className="!rounded-2xl !text-right !leading-8 !border-indigo-200 !bg-indigo-50/50"
                icon={<FuseSvgIcon size={20} className="text-indigo-500">heroicons-outline:information-circle</FuseSvgIcon>}>
                {"\u062A\u0645\u0627\u0645\u06CC \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A \u0627\u0639\u062A\u0628\u0627\u0631 \u062F\u0631 \u062C\u062F\u0627\u0648\u0644 \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627 \u062B\u0628\u062A \u062E\u0648\u0627\u0647\u0646\u062F \u0634\u062F"}
              </Alert>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row-reverse gap-24">
        {/* User List Panel */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full lg:w-[420px] lg:flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-sm p-20 sm:p-24">
          <UserList users={users} hasMore={hasMore} loadMore={loadUsers} onSelectUser={handleSelectUser}
            selectedUserId={selectedUser?.value} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </motion.div>

        {/* Credit Panel */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex flex-col gap-24">

          <AnimatePresence mode="wait">
            {selectedUser ? (
              <motion.div key={selectedUser.value} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
                {/* Credit Hero Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-600 via-blue-600 to-purple-700 p-28 sm:p-36 text-white shadow-2xl shadow-indigo-300/30">
                  <div className="absolute -top-32 -left-32 w-128 h-128 rounded-full bg-white/5 blur-2xl" />
                  <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-xl" />
                  <AnimatePresence>
                    {successAnim && (
                      <motion.div initial={{ scale: 0, opacity: 0.4 }} animate={{ scale: 6, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-emerald-300" />
                    )}
                  </AnimatePresence>
                  <div className="relative z-10">
                    <div className="flex items-center gap-16 mb-24">
                      <Avatar src={getServerFile(selectedUser.avatar)} alt={selectedUser.label} className="w-56 h-56 ring-3 ring-white/30 shadow-lg" />
                      <div>
                        <Typography variant="h6" className="font-bold text-white">{selectedUser.label}</Typography>
                        <Typography variant="body2" className="text-white/60">{selectedUser.username}</Typography>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <Typography variant="body2" className="text-white/60 mb-4">{"\u0627\u0639\u062A\u0628\u0627\u0631 \u0641\u0639\u0644\u06CC"}</Typography>
                        {isLoadingCredit ? (
                          <CircularProgress size={28} className="text-white" />
                        ) : (
                          <motion.div key={credit} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                            <Typography variant="h3" className="font-black tracking-tight">
                              {formatNumber(credit ?? 0)}
                              <span className="text-lg font-normal text-white/50 mr-8">{"\u062A\u0648\u0645\u0627\u0646"}</span>
                            </Typography>
                          </motion.div>
                        )}
                      </div>
                      <AnimatePresence>
                        {previewCredit !== null && (
                          <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="bg-white/15 backdrop-blur-sm rounded-2xl px-20 py-12 text-center">
                            <Typography variant="caption" className="text-white/60 block">
                              {operation === "INCREASE" ? "\u0628\u0639\u062F \u0627\u0632 \u0627\u0641\u0632\u0627\u06CC\u0634" : "\u0628\u0639\u062F \u0627\u0632 \u06A9\u0627\u0647\u0634"}
                            </Typography>
                            <Typography variant="h6" className={`font-bold ${previewCredit < 0 ? "text-red-300" : "text-emerald-300"}`}>
                              {formatNumber(previewCredit)}
                            </Typography>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-12 mt-16">
                  <StatCard icon="heroicons-outline:credit-card" label={"\u0627\u0639\u062A\u0628\u0627\u0631 \u0641\u0639\u0644\u06CC"} value={`${formatNumber(credit ?? 0)} \u062A\u0648\u0645\u0627\u0646`} color="indigo" delay={0.1} />
                  <StatCard icon={ghostMode ? "heroicons-outline:eye-off" : "heroicons-outline:eye"} label={"\u062D\u0627\u0644\u062A \u0639\u0645\u0644\u06CC\u0627\u062A"} value={ghostMode ? "\u0645\u062E\u0641\u06CC" : "\u0639\u0627\u062F\u06CC"} color={ghostMode ? "amber" : "emerald"} delay={0.2} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="rounded-3xl border-2 border-dashed border-gray-200 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center py-64 px-32 text-center">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <div className="w-80 h-80 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-24">
                    <FuseSvgIcon size={40} className="text-indigo-400">heroicons-outline:cursor-click</FuseSvgIcon>
                  </div>
                </motion.div>
                <Typography variant="h6" className="font-bold text-gray-600 mb-8">{"\u06A9\u0627\u0631\u0628\u0631\u06CC \u0627\u0646\u062A\u062E\u0627\u0628 \u0646\u0634\u062F\u0647"}</Typography>
                <Typography variant="body2" className="text-gray-400 max-w-xs">
                  {"\u0627\u0632 \u0644\u06CC\u0633\u062A \u06A9\u0627\u0631\u0628\u0631\u0627\u0646\u060C \u06CC\u06A9 \u06A9\u0627\u0631\u0628\u0631 \u0631\u0627 \u0627\u0646\u062A\u062E\u0627\u0628 \u06A9\u0646\u06CC\u062F \u062A\u0627 \u0627\u0639\u062A\u0628\u0627\u0631 \u0627\u0648 \u0631\u0627 \u0645\u0634\u0627\u0647\u062F\u0647 \u0648 \u0645\u062F\u06CC\u0631\u06CC\u062A \u0646\u0645\u0627\u06CC\u06CC\u062F."}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Panel */}
          <AnimatePresence>
            {selectedUser && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-sm p-24 sm:p-32 space-y-24">
                <div className="flex items-center gap-12">
                  <div className="w-40 h-40 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FuseSvgIcon size={20} className="text-indigo-600">heroicons-outline:adjustments</FuseSvgIcon>
                  </div>
                  <Typography variant="subtitle1" className="font-bold text-gray-800">{"\u062A\u0646\u0638\u06CC\u0645\u0627\u062A \u0627\u0639\u062A\u0628\u0627\u0631"}</Typography>
                </div>

                {/* Ghost Mode */}
                <div className={`flex items-center justify-between p-16 rounded-2xl transition-all duration-300 border ${ghostMode ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
                  <div className="flex items-center gap-12">
                    <motion.div animate={{ rotate: ghostMode ? 180 : 0 }} transition={{ duration: 0.4 }}
                      className={`w-40 h-40 rounded-xl flex items-center justify-center ${ghostMode ? "bg-amber-200 text-amber-700" : "bg-gray-200 text-gray-500"}`}>
                      <FuseSvgIcon size={18}>{ghostMode ? "heroicons-outline:eye-off" : "heroicons-outline:eye"}</FuseSvgIcon>
                    </motion.div>
                    <div>
                      <Typography variant="body2" className="font-semibold text-gray-800">{"\u062D\u0627\u0644\u062A \u0645\u062E\u0641\u06CC"}</Typography>
                      <Typography variant="caption" className="text-gray-500">
                        {ghostMode ? "\u0641\u0639\u0627\u0644 \u2014 \u0628\u062F\u0648\u0646 \u062B\u0628\u062A \u062A\u0631\u0627\u06A9\u0646\u0634" : "\u063A\u06CC\u0631\u0641\u0639\u0627\u0644 \u2014 \u062A\u0631\u0627\u06A9\u0646\u0634\u200C\u0647\u0627 \u062B\u0628\u062A \u0645\u06CC\u200C\u0634\u0648\u0646\u062F"}
                      </Typography>
                    </div>
                  </div>
                  <Switch checked={ghostMode} onChange={handleGhostModeToggle} color="warning" />
                </div>

                {/* Operation buttons */}
                {!ghostMode && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Typography variant="body2" className="font-semibold text-gray-700 mb-12">{"\u0646\u0648\u0639 \u0639\u0645\u0644\u06CC\u0627\u062A"}</Typography>
                    <div className="grid grid-cols-2 gap-12">
                      {[
                        { value: "INCREASE", label: "\u0627\u0641\u0632\u0627\u06CC\u0634", icon: "heroicons-outline:plus-circle", activeClass: "bg-emerald-50 border-emerald-300 text-emerald-700" },
                        { value: "DECREASE", label: "\u06A9\u0627\u0647\u0634", icon: "heroicons-outline:minus-circle", activeClass: "bg-rose-50 border-rose-300 text-rose-700" },
                      ].map((opt) => (
                        <motion.button key={opt.value} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setOperation(opt.value)}
                          className={`flex items-center gap-10 p-16 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                            operation === opt.value ? opt.activeClass + " shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          }`}>
                          <FuseSvgIcon size={22}>{opt.icon}</FuseSvgIcon>
                          <Typography variant="body1" className="font-semibold">{opt.label}</Typography>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Amount */}
                <TextField
                  label={ghostMode ? "\u0645\u0642\u062F\u0627\u0631 \u0646\u0647\u0627\u06CC\u06CC \u0627\u0639\u062A\u0628\u0627\u0631 (\u062A\u0648\u0645\u0627\u0646)" : "\u0645\u0628\u0644\u063A (\u062A\u0648\u0645\u0627\u0646)"}
                  type="number" value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrorMessage(""); }}
                  fullWidth variant="outlined"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px", backgroundColor: "#fafafa", "&:hover": { backgroundColor: "#f5f5f5" }, "&.Mui-focused": { backgroundColor: "white", boxShadow: "0 0 0 3px rgba(99,102,241,0.1)" } } }}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><FuseSvgIcon size={20} className="text-gray-400">heroicons-outline:currency-dollar</FuseSvgIcon></InputAdornment>) }}
                />

                {/* Error */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                      <Alert severity="error" variant="filled" className="!rounded-xl" onClose={() => setErrorMessage("")}>{errorMessage}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Apply */}
                <div className="flex justify-end pt-8">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button variant="contained" onClick={handleApplyChanges}
                      disabled={!selectedUser || isLoadingCredit || isApplying || !amount}
                      className="!rounded-2xl !px-36 !py-12 !shadow-lg !shadow-indigo-200 !bg-gradient-to-l !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !text-white !font-bold !text-base disabled:!opacity-50 disabled:!shadow-none"
                      startIcon={isApplying ? <CircularProgress size={20} className="text-white" /> : <FuseSvgIcon size={20}>heroicons-outline:check-circle</FuseSvgIcon>}>
                      {isApplying ? "\u062F\u0631 \u062D\u0627\u0644 \u0627\u0639\u0645\u0627\u0644..." : "\u0627\u0639\u0645\u0627\u0644 \u062A\u063A\u06CC\u06CC\u0631\u0627\u062A"}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Snackbar */}
      <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackOpen(false)} severity="success" variant="filled" className="!rounded-2xl !shadow-xl">{snackMsg}</Alert>
      </Snackbar>
    </div>
  );
}

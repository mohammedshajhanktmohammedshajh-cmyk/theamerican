
import { Box, Card, IconButton, Paper, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Call this function when your form is submitted
const handleUpdateUser = async (userId, newUsername, newEmail, setUsers) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, {
      username: newUsername,
      email: newEmail,
    });

    // 1. Print to console for debugging
    console.log(response.data.message);

    // 2. SHOW THE SUCCESS MESSAGE ON SCREEN
    alert(response.data.message); // Pops up: "User [name] updated successfully!"

    // 3. INSTANTLY UPDATE THE DASHBOARD STATE (Refreshes the UI)
    if (typeof setUsers === "function") {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? response.data.user : user
        )
      );
    }

    return response.data.user;

    // 4. Close your edit modal / form here if you have one
    // setOpenEditModal(false);
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Update failed";
    console.error(errorMsg);
    alert(errorMsg);
    throw error;
  }
};

const Dashboard = ({ username, user }) => {
  let savedUser = null;

  if (typeof window !== "undefined") {
    try {
      savedUser = JSON.parse(window.localStorage.getItem("user") || "null");
    } catch (e) {
      savedUser = null;
    }
  }
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [savingIndex, setSavingIndex] = useState(null);
	const [deletingIndex, setDeletingIndex] = useState(null);

  const saveUser = async (listedUser, index) => {
    const userId = listedUser.id ?? listedUser._id;
    if (userId == null) {
      setUsersError("Unable to save user: user ID is unavailable.");
      return;
    }

    try {
      setSavingIndex(index);
      setUsersError("");
      const updatedUser = await handleUpdateUser(userId, listedUser.username ?? "", listedUser.email ?? "");

      setUsers((currentUsers) =>
        currentUsers.map((userItem, userIndex) =>
          userIndex === index ? { ...userItem, ...updatedUser } : userItem
        )
      );
      setEditingIndex(null);
    } catch (error) {
      setUsersError(error.response?.data?.message || error.message || "Unable to save user.");
    } finally {
      setSavingIndex(null);
    }
  };

	const deleteUser = async (listedUser, index) => {
		const userId = listedUser.id ?? listedUser._id;
		if (userId == null) {
			setUsersError("Unable to delete user: user ID is unavailable.");
			return;
		}

		try {
			setDeletingIndex(index);
			setUsersError("");
			const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
			setUsers((currentUsers) => currentUsers.filter((_, userIndex) => userIndex !== index));
			setEditingIndex(null);
			alert(response.data?.message || "User deleted successfully");
			handleLogout();
		} catch (error) {
			const errorMsg = error.response?.data?.message || error.message || "Unable to delete user.";
			setUsersError(errorMsg);
			alert(errorMsg);
		} finally {
			setDeletingIndex(null);
		}
	};

  const displayName = (username || user?.username || user?.name || savedUser?.username || savedUser?.name || (typeof window !== "undefined" && window.localStorage.getItem("username")) || "").trim();
  const firstName = displayName.split(/\s+/)[0] || "there";
  const handleLogout = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("user");
    window.localStorage.removeItem("username");
    window.localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchusers = async () => {
    try {
      setUsersLoading(true);
      setUsersError("");
      const response = await axios.get(`${API_BASE_URL}/users`);
      if (response.status === 200) {
        let fetchedUsers = response.data?.users ?? response.data;
        if (typeof fetchedUsers === "string") {
          try {
            fetchedUsers = JSON.parse(fetchedUsers);
          } catch {
            const rows = fetchedUsers.trim().replace(/^\uFEFF/, "").split(/\r?\n/);
            const headers = rows.shift()?.split(/\t+/).map((header) => header.trim()) ?? [];
            fetchedUsers = rows.filter(Boolean).map((row) => {
              const values = row.split(/\t+/).map((value) => value.trim());
              return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
            });
          }
        }
        if (!Array.isArray(fetchedUsers) && Array.isArray(fetchedUsers?.users)) {
          fetchedUsers = fetchedUsers.users;
        }
        setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      }
    } catch (error) {
      setUsersError(error.response?.data?.message || error.message || "Unable to load users.");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const check = () => {
      if (typeof window !== "undefined" && !window.localStorage.getItem("token")) {
        window.location.href = "/login";
        return;
      }
    };

    fetchusers();
    check();

    if (typeof window !== "undefined") {
      window.addEventListener("pageshow", check);
      window.addEventListener("storage", check);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("pageshow", check);
        window.removeEventListener("storage", check);
      }
    };
  }, []);

     
   	
	return (
		<div className="dashboard">
			<style>{`
				* { box-sizing: border-box; }
				.dashboard { min-height: 100vh; background: #f7f8fc; color: #20243a; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
				.layout { max-width: 1240px; margin: auto; padding: 28px 36px 48px; }
				.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
				.logo { font-size: 21px; font-weight: 800; letter-spacing: -1px; }
				.logo-mark { display: inline-grid; place-items: center; width: 30px; height: 30px; margin-right: 9px; border-radius: 9px; color: white; background: #6958e8; }
				.user { display: flex; align-items: center; gap: 11px; font-size: 14px; font-weight: 650; }
				.avatar { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; color: #fff; background: linear-gradient(140deg, #9e91ff, #5946d6); }
				.logout-button { padding: 9px 14px; border: 1px solid #e5e7f0; border-radius: 9px; color: #555b70; background: #fff; font: inherit; font-size: 13px; font-weight: 650; cursor: pointer; transition: background .2s, border-color .2s, color .2s; }
				.logout-button:hover { border-color: #6958e8; color: #5946d6; background: #f7f5ff; }
				.logout-button:focus-visible { outline: 3px solid #c9c2ff; outline-offset: 2px; }
				.welcome { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 28px; }
				.welcome h1 { margin: 0; font-size: clamp(26px, 4vw, 34px); letter-spacing: -1.2px; }
				.welcome p { margin: 9px 0 0; color: #858ba0; font-size: 14px; }
				.date { color: #777e93; font-size: 13px; }
				.cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
				.card { padding: 22px; border: 1px solid #eceef5; border-radius: 15px; background: #fff; box-shadow: 0 5px 18px #252a4108; }
				.stat-label { color: #81879a; font-size: 13px; font-weight: 550; }
				.stat-value { margin: 14px 0 8px; font-size: 29px; font-weight: 750; letter-spacing: -1px; }
				.trend { color: #15996e; font-size: 12px; font-weight: 650; }
				.content { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(270px, 1fr); gap: 16px; margin-top: 18px; }
				.card h2 { margin: 0 0 20px; font-size: 16px; }
				.activity { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 15px 0; border-top: 1px solid #f0f1f5; font-size: 13px; }
				.activity-name { font-weight: 600; }
				.activity-meta { margin-top: 5px; color: #9298a8; font-size: 12px; }
				.badge { flex: 0 0 auto; padding: 6px 9px; border-radius: 20px; color: #12815f; background: #e9f8f2; font-size: 11px; font-weight: 650; }
				.badge.progress { color: #a76b0a; background: #fff5df; }
				.goal-copy { color: #858ba0; font-size: 13px; line-height: 1.6; }
				.goal-row { display: flex; justify-content: space-between; margin-top: 24px; font-size: 13px; }
				.goal-row span:last-child { color: #7d8295; }
				.track { height: 8px; margin-top: 12px; overflow: hidden; border-radius: 8px; background: #eeecfb; }
				.fill { width: 72%; height: 100%; border-radius: inherit; background: #6958e8; }
				@media (max-width: 760px) { .layout { padding: 22px 18px 36px; } .header { margin-bottom: 36px; } .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } .content { grid-template-columns: 1fr; } }
				@media (max-width: 440px) { .welcome { align-items: start; flex-direction: column; } .date { display: none; } .card { padding: 17px; } .user-name { display: none; } }
			`}</style>

			<div className="layout">
				<header className="header">
					<div className="logo"><span className="logo-mark">✦</span>orbit</div>
					<div className="user">
						<span className="avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>
						<span className="user-name">{displayName}</span>
						<button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
					</div>
				</header>

				<main>
					<section className="welcome">
						<div>
							<h1>Welcome back, {firstName} 👋</h1>
							<p>Here’s an overview of your workspace today.</p>
						</div>
						<div className="date">Your dashboard at a glance</div>
					</section>

					<section className="cards" aria-label="Workspace statistics">
						{[
							{ label: "Total projects", value: "12", trend: "↗ 2 this month" },
							{ label: "Tasks completed", value: "48", trend: "↗ 12% this week" },
							{ label: "Hours tracked", value: "36.5", trend: "↗ 4.5 this week" },
							{ label: "Productivity", value: "84%", trend: "↗ 8% this month" },
						].map((stat) => (
							<article className="card" key={stat.label}>
								<div className="stat-label">{stat.label}</div>
								<div className="stat-value">{stat.value}</div>
								<div className="trend">{stat.trend}</div>
							</article>
						))}
					</section>

					<section className="content">
						<article className="card">
							<h2>Recent activity</h2>
							<div className="activity">
								<div><div className="activity-name">Website redesign</div><div className="activity-meta">Updated today</div></div>
								<span className="badge">Completed</span>
							</div>
							<div className="activity">
								<div><div className="activity-name">Team planning session</div><div className="activity-meta">Updated yesterday</div></div>
								<span className="badge progress">In progress</span>
							</div>
							<div className="activity">
								<div><div className="activity-name">Q3 campaign assets</div><div className="activity-meta">Updated yesterday</div></div>
								<span className="badge">Completed</span>
							</div>
						</article>

						<article className="card">
							<h2>Weekly goal</h2>
							<div className="goal-copy">You’re making great progress. Keep it up to reach your goal.</div>
							<div className="goal-row"><strong>Tasks completed</strong><span>18 / 25</span></div>
							<div className="track" role="progressbar" aria-label="Weekly goal progress" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100">
								<div className="fill" />
							</div>
							<div className="goal-copy" style={{ marginTop: 10 }}>72% of your weekly goal complete</div>
						</article>
					</section>
					<Paper sx={{ mt: 2, p: 2, borderRadius: 3 }}>
						<h2>Users</h2>
						{usersLoading ? (
							<p>Loading users…</p>
						) : usersError && users.length === 0 ? (
							<p role="alert">{usersError}</p>
						) : users.length === 0 ? (
							<p>No users found.</p>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
								{users.map((listedUser, index) => (
									<Card key={listedUser.id ?? listedUser._id ?? index} variant="outlined" sx={{ p: 2, borderRadius: 2, overflow: "hidden", transition: "box-shadow .2s, border-color .2s", "&:hover": { borderColor: "#c9c2ff", boxShadow: "0 6px 18px #252a4112" } }}>
										<Box>
											<TextField
												value={listedUser.username ?? ""}
												size="small"
												fullWidth
												disabled={editingIndex !== index}
												aria-label={`Username for ${listedUser.username || "user"}`}
												onChange={(event) => {
													const nextValue = event.target.value;
													setUsers((currentUsers) =>
														currentUsers.map((user, userIndex) =>
															userIndex === index ? { ...user, username: nextValue } : user
														)
													);
												}}
												sx={{
													"& .MuiInputBase-input": { fontWeight: 700, paddingY: 1.15 },
													"& .MuiOutlinedInput-root": { borderRadius: 2 },
												}}
											/>
										</Box>
										
										<div style={{ marginTop: 6, color: "#777e93", fontSize: 14 }}>{listedUser.email || "Email unavailable"}</div>
										<div style={{ display: "flex", justifyContent: "flex-end", gap: 8, margin: "16px -16px -16px", padding: "9px 12px", borderTop: "1px solid #f0f1f5", background: "#fafaff" }}>
											<IconButton
												aria-label={editingIndex === index ? `Save ${listedUser.username || "user"}` : `Edit ${listedUser.username || "user"}`}
												title={editingIndex === index ? "Save user" : "Edit user"}
												size="small"
												disabled={savingIndex === index}
												onClick={() => editingIndex === index ? saveUser(listedUser, index) : setEditingIndex(index)}
												sx={{ width: 34, height: 34, color: "#5946d6", border: "1px solid #e6e1ff", borderRadius: 2, backgroundColor: "#fff", transition: "background-color .2s, border-color .2s, transform .2s", "&:hover": { borderColor: "#c9c2ff", backgroundColor: "#f3f1ff", transform: "translateY(-1px)" }, "&:focus-visible": { outline: "3px solid #c9c2ff", outlineOffset: 2 } }}
											>
												{editingIndex === index ? <SaveIcon fontSize="small" /> : <EditIcon fontSize="small" />}
											</IconButton>
											<IconButton aria-label={`Delete ${listedUser.username || "user"}`} title="Delete user" size="small" disabled={deletingIndex === index} onClick={() => deleteUser(listedUser, index)} sx={{ width: 34, height: 34, color: "#bd4650", border: "1px solid #f4dfe1", borderRadius: 2, backgroundColor: "#fff", transition: "background-color .2s, border-color .2s, transform .2s", "&:hover": { borderColor: "#edc3c6", backgroundColor: "#fff3f3", transform: "translateY(-1px)" }, "&:focus-visible": { outline: "3px solid #f2c5c8", outlineOffset: 2 } }}>
												<DeleteIcon fontSize="small" />
											</IconButton>
										</div>
									</Card>

									
								))}
							</div>
						)}
						
					</Paper>
					
				</main>
			</div>
		</div>
		
	);
	};


export default Dashboard;

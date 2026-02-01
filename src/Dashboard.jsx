export default function Dashboard() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Dashboard</h2>
      <p>You are logged in successfully 🎉</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

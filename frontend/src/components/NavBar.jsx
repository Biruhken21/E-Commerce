import "../css/Navbar.css";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    // Check if user is admin
    const isAdmin = user?.email === 'admin@used.com';

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Used.com</Link>
            </div>
            <div className="navbar-link">
                <Link to="/" className="nav-link">Home</Link>
                {isAuthenticated() && (
                    <Link to="/favorite" className="nav-link">Favorites</Link>
                )}
                {isAuthenticated() && isAdmin && (
                    <Link to="/admin" className="nav-link admin-link">🤝 Admin</Link>
                )}
            </div>
            <div className="right-side">
                {isAuthenticated() ? (
                    <>
                        <span className="user-welcome">Welcome, {user?.name}</span>
                        <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    )
}
export default NavBar;
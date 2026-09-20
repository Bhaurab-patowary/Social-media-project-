import React, { useState, } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../form.scss';
// import { useState } from 'react';


function Login() {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [error, setError] = useState("");

    // Check if there was a target route passed from previous page; default to "/"
    const from = location.state?.from || "/";

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await handleLogin({ email, password })
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Login failed", error);

              setError(
            error.response?.data?.message || "Invalid email or password"
           );
        }

    }

    // LoginPage.jsx (after successful login/register)
    const handleLoginSuccess = (token) => {
        localStorage.setItem("token", token);

        const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/feed";
        sessionStorage.removeItem("redirectAfterLogin");

        navigate(redirectTo);
    };

    if (loading) {
        return (<main><h1>Loading.......</h1></main>)
    }
    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" name="email" placeholder="Enter email" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">password</label>
                        <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" name="password" placeholder="Enter password" required />
                    </div>

                    {error && (
                                <p className="error-message">
                                    {error}
                                </p>
                            )}

                    <button type="submit" className="button primary-button">Login</button>
                </form>
                <p>Don't an have account? <Link to={"/register"}>Register</Link></p>
            </div>
        </main>
    )

}

export default Login;
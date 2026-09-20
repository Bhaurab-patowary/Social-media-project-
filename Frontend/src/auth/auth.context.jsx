// src/auth.context.jsx
import React, { createContext, useState, useEffect } from 'react'
import { getProfile } from './services/auth.api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const data = await getProfile()
                if (data && data.user) {
                    setUser(data.user)
                }
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchCurrentUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
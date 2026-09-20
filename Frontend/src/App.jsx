import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CreatePost from './Posts/pages/CreatePost.jsx'
import Feed from './Posts/pages/Feed.jsx'
import Login from './auth/pages/Login.jsx'
import Register from './auth/pages/Register.jsx'
import Profile from './auth/pages/Profile.jsx'
import { AuthProvider } from './auth/auth.context.jsx'
import ProtectedRoute from "./auth/components/Protected";
// import { PostProvider } from './Posts/hooks/usePost.js'

const App = () => {
  return (
    <AuthProvider>

      <Router>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path='/create-post' element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path='/profile' element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path='/feed' element={<Feed />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </Router>

    </AuthProvider>
  )
}

export default App
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(
    () => localStorage.getItem('token')
  );
  const [userId, setUserId] = useState(
    () => localStorage.getItem('userId')
  );
  const [user, setUser]     = useState(
    () => JSON.parse(
      localStorage.getItem('user') || 'null'
    )
  );

  const loginUser = (data) => {

    const token = data.accessToken || localStorage.getItem('token');
    const userData = data.user;

    localStorage.setItem('token',
      data.accessToken);
    localStorage.setItem('userId',
      String(data.user.userId));
    localStorage.setItem('user',
      JSON.stringify(data.user));
    setToken(data.accessToken);
    setUserId(String(data.user.userId));
    setUser(data.user);
  };

  const logoutUser = () => {
    localStorage.clear();
    setToken(null);
    setUserId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        user,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
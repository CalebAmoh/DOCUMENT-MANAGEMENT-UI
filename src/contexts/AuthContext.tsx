import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import refreshToken from '../hooks/useRefreshToken';

// Define the User type
interface User {
  id: string;
  employee: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  accessToken: string;
  // Add other fields as necessary
}



// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
}

// Create a context with the defined type
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

// Define the props type for AuthProvider
interface AuthProviderProps {
  children: string[] | ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const initializeAuth = async () => {
  //     const refreshedUser = await refreshToken(); // Call the function
  //     console.log("user",refreshedUser);
  //     setLoading(false);
  //   };

  //   initializeAuth();
  // }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};



export default AuthContext;
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

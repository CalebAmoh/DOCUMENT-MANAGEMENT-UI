import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define the User type
interface User {
  id: string;
  name: string;
  roles: string[];
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

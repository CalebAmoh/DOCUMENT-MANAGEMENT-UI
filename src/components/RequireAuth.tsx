import React, { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface RequireAuthProps {
  children?: string[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    console.log("require auth function",user);
    
    return (
        user?.roles.find(rl => children?.includes(rl))
        ? <Outlet/> 
        : user?.employee ? <Navigate to ="/dashboard" state={location} replace/> 
        : <Navigate to ="/" state={location} replace/>);
    //   return (user?.roles.find(rl => children?.includes(rl))? <Outlet/> : user ? <Outlet/> : <Navigate to ="/" state={location} replace/>);
    //   if (!user) {
    //     return <Navigate to="/" />;
    //   }

    //   return children ? <>{children}</> : <Outlet />;
};

export default RequireAuth;
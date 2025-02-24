import { useState,useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';


const PersistLogin= () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const {user} = useAuth();

    useEffect(()=>{
        const verifyRefreshToken = async () => {
            try{
                await refresh();
            }catch(err){
                console.error("persist error",err)
            }finally{
                setIsLoading(false);
            }
        }

        !user?.accessToken ? verifyRefreshToken(): setIsLoading(false);
    },[])
};

export default PersistLogin;
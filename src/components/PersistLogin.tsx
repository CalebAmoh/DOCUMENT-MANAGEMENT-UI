import { useState,useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';


const PersistLogin= () => {
    const [isLoading, setIsLoading] = useState(true);
    const [authUser, setAuthUser] = useState({});
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

    useEffect(()=>{
        console.log("isloading",isLoading)
        console.log("user token",user?.accessToken)
        console.log("auth user",authUser)
    },[isLoading])

    return(
        <>
            {isLoading ? <p>Loading...</p>:<Outlet/>}
        </>
    )
};

export default PersistLogin;
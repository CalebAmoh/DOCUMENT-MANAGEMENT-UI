import { useEffect } from "react";
import axios from 'axios';
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";
import { API_SERVER1,axiosPrivate } from "../constant";

const useAxiosPrivate = () => {
    const refreshToken = useRefreshToken();
    const {user} = useAuth();

    const requestIntercept = axiosPrivate.interceptors.request.use(
        config => {
            if(!config.headers['Authorization']){
                config.headers['Authorization'] = `Bearer ${user?.accessToken}`
            }
            return config;
        }, (error) => {
            Promise.reject(error);
        }
    )
    
    useEffect(() => {
        const responseIntercept = axiosPrivate.interceptors.response.use(
            response => response,
            async (error)=>{
                 const prevRequest = error.config;
                 if(error?.response?.status === 403 && !prevRequest?.sent){
                    prevRequest.sent = true;
                    const newAccessToken = await useRefreshToken();
                    prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                 }

                 Promise.reject(error);
            }
        );
        return () => {
            axiosPrivate.interceptors.response.eject(responseIntercept);
            axiosPrivate.interceptors.response.eject(requestIntercept);
        }
    },[user,refreshToken])

    return axiosPrivate;
};

export default useAxiosPrivate;

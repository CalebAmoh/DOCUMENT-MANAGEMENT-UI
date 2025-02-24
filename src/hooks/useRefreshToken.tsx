import { useContext } from "react";
import axios from 'axios';
import useAuth from "./useAuth";
import { API_SERVER1 } from "../constant";

const useRefreshToken = () => {
    const { setUser } = useAuth();
    
    const refresh = async () => {
        try {
            const response = await axios.get(`${API_SERVER1}/user/refresh-token`, {
                withCredentials: true
            });
            console.log(response);
            if (response.status === 200) {
                const userData = response.data.user[0];
                const accessToken = response.data.accessToken;
                
                setUser({
                    id: userData.id,
                    employee: userData.employee,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    email: userData.email,
                    roles: [userData.name],
                    accessToken: accessToken
                });
                return accessToken;
            }
        } catch (error) {
            console.error("Refresh token error:", error);
            return null;
        }
    };

    return refresh;
};

export default useRefreshToken;

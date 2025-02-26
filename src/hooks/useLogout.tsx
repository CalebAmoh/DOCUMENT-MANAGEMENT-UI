import { useContext } from "react";
import axios from 'axios';
import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";
import { API_SERVER1,axiosPrivate } from "../constant";

const useLogout = () => {
    const { user,setUser } = useAuth();
     const navigate = useNavigate();

    const logout = async () => {
        try {
            const response = await axios.get(`${API_SERVER1}/user/logout`, {
                withCredentials: true
            });
            if (response.status === 200) {
                const message = response.data.message;
                
                setUser({
                    id: "",
                    employee: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    roles: [""],
                    accessToken: ""
                });
                navigate("/login");
            }
        } catch (error:any) {
            console.error("logout error:", error);
            return error.response?.data?.error;
        }
    };

    return logout;
};

export default useLogout;

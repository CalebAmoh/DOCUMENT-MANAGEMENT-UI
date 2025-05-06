import axios from 'axios';
const BASE_URL = 'http://localhost:3006/v1/api/dms';
export const API_SERVER_CORE = "http://10.203.14.195:3320";

export const API_SERVER = "http://127.0.0.1:8000/api"
export const API_SERVER1 = BASE_URL;

export default axios.create({
    baseURL: BASE_URL
});

export const headers = {
    "Accept": 'application/json', 
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhucmFtb2hAZ21haWwuY29tIiwiaWF0IjoxNzQwMDgzNDQ2LCJleHAiOjE3NDAwODQzNDZ9.BKsvz6fC_JF7_BOF6RtaQwHKxu-D9jc4WLwxVX9AWa8'
}

export const headers_core = {
    "x-api-key":"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "Content-Type": "application/json",
  };

export const axiosPrivate = axios.create({
    api_server: BASE_URL,
    headers: {'Content-Type':'Application/json'},
    withCredentials:true
})
import axios from "axios"

const API_URL = "http://127.0.0.1:8000/api/users/"

export const registerUser = async (email, username, password) => {
    try {
        const response = await axios.post(`${API_URL}register/`, {email, username, password},
            {withCredentials: true} // dla ciasteczek
        )
        return response.data;
    }
    catch(e) {
        throw new Error("Registration failed!")
    }
}


export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}login/`, {email, password},
            {withCredentials: true} 
        )
        return response.data;
    }
    catch(e) {
        throw new Error("log in failed!")
    }
}


/*
export const logoutrUser = async (params) => {
    
}
    */
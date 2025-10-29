import axios from 'axios';

export const getDevelopers = async () => {
    const res = await axios.get('http://127.0.0.1:8000/api/developers');
    return res.data;
};
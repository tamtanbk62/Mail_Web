const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export default {
    loginWithLaoID: `${API_BASE_URL}/user/login-laoid`,
    sendMail: `${API_BASE_URL}/send`,
    inbox: `${API_BASE_URL}/inbox`,
    mailByUid: (uid) => `${API_BASE_URL}/inbox/${uid}`,
    searchBySubject: `${API_BASE_URL}/search/subject`,
    searchByBody: `${API_BASE_URL}/search/body`
};
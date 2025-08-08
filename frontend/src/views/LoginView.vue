<template>
    <div class="login-container">
        <div class="login-box">
            <h1 class="login-title">Chào mừng đến với GGMail</h1>
            <p class="login-subtitle">Đăng nhập bằng tài khoản LaoID</p>
            <button id="laoid-signin" class="login-btn">🔐 Đăng nhập với LaoID</button>
        </div>
    </div>
</template>

<script>
import api from '@/services/services.js';
export default {
    mounted() {
        const tryInitSSO = () => {
            if (document.getElementById('laoid-signin')) {
                window.LaoIdSSO.init(
                    "660dfa27-5a95-4c88-8a55-abe1310bf579",
                    "http://localhost",
                    false
                );

                window.addEventListener("message", async (event) => {
                    if (event.origin !== "https://demo-sso.tinasoft.io") return;

                    const { message, data } = event.data;

                    if (message === "login_success") {
                        try {
                            const response = await fetch(api.loginWithLaoID, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    authorization_code: data
                                })
                            });

                            const result = await response.json();

                            if (result.mailAccount) {
                                console.log("🎉 Đăng nhập thành công:", result);

                                
                                localStorage.setItem("accessToken", result.accessToken); 
                                localStorage.setItem("userEmail", result.mailAccount.email);
                                localStorage.setItem("userPassword", result.mailAccount.password);

                                
                                window.location.href = "/inbox";
                            } else {
                                alert("Đăng nhập thất bại: không có mailAccount");
                            }
                        } catch (err) {
                            console.error("Lỗi khi gọi backend:", err);
                            alert("Đăng nhập thất bại.");
                        }
                    } else if (message === "login_fail") {
                        alert("Đăng nhập thất bại từ LaoID.");
                    }
                });

                console.log('LaoID SSO đã được khởi tạo.');
            } else {
                setTimeout(tryInitSSO, 100);
            }
        };

        tryInitSSO();
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #e0e7ff, #f0f4ff);
}

.login-box {
    background: white;
    padding: 3rem 2.5rem;
    border-radius: 18px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    text-align: center;
}

.login-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #3730a3;
}

.login-subtitle {
    margin-bottom: 2rem;
    color: #4b5563;
}

.login-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1.1rem;
    font-weight: bold;
    background: linear-gradient(90deg, #6366f1, #60a5fa);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
}

.login-btn:hover {
    background: linear-gradient(90deg, #4f46e5, #3b82f6);
}
</style>
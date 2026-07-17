// ===== ADMIN LOGIN PAGE =====
import { adminLogin } from '../../utils/api.js';
import { setToken, setAdminSession } from '../../utils/auth.js';

export async function renderLogin(container) {
    container.innerHTML = `
        <div class="page-login">
            <div class="container container-xs">
                <div class="login-card">
                    <div class="login-header">
                        <span class="login-icon">🔐</span>
                        <h1>Admin Login</h1>
                        <p>Enter your credentials to access the admin panel</p>
                    </div>

                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" placeholder="admin@otukporent.com" required />
                        </div>

                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" placeholder="Enter your password" required />
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg btn-block" id="loginBtn">
                            <i class="fas fa-lock"></i> Login
                        </button>

                        <p class="login-help">
                            <a href="/" class="text-muted"><i class="fas fa-arrow-left"></i> Back to Home</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    `;

    // ===== LOGIN FORM =====
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const btn = document.getElementById('loginBtn');

        if (!email || !password) {
            window.showToast('Please enter email and password', 'error');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        try {
            const response = await adminLogin(email, password);

            if (response.success && response.token) {
                setToken(response.token);
                setAdminSession();
                window.updateAdminNav();
                window.showToast('✅ Welcome Admin!', 'success');
                window.navigate('admin');
            } else {
                throw new Error(response.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            window.showToast(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-lock"></i> Login';
        }
    });
}
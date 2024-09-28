document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('form_signup');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(signupForm);

            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password'); 

            try {
                const response = await fetch ('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });
                if (response.ok) {
                    alert('Registration successful');
                    window.location.href ='/signin';
                } else {
                    alert('Registration failed');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }
});
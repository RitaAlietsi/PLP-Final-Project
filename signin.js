document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('form_signin');

    if (signinForm) {
        signinForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(signinForm);

            const username = formData.get('username');
            const password = formData.get('password'); 

            try {
                const response = await fetch ('/signin', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                if (response.ok) {
                    alert('Signin successful');
                    window.location.href ='/tracker';
                } else {
                    alert('Registration failed');
                }
            } catch (error) {
                console.error ('Error:', error);
            }
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const Logout = document.getElementById('logoutBtn');

    Logout.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const response = await fetch ('/logout', {
                method: 'POST',
                credentials: 'include'
            }); 
            
            console.log('Response:',response);
            
            if (response.ok) {
                console.log('Logout successful');
                window.location.href =('/');
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    
});


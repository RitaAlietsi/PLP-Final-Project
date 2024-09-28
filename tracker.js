document.addEventListener('DOMContentLoaded', () => {
    const trackerForm = document.getElementById('tracker');
   
    if (trackerForm) {
        trackerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(trackerForm);

            const userid = formData.get('userid');
            const vehicle_type = formData.get('vehicle');
            const number_plate = formData.get('registration');
            const item_transported = formData.get('item');
            const quantity_kgs = formData.get('quantity');
            const departure_location = formData.get('departure');
            const destination = formData.get('destination');
            const date = formData.get('date');

            if (userid !== '' && vehicle_type !== '' && number_plate !== '' && item_transported !== '' && quantity_kgs !== '' && departure_location !== '' 
                && destination !== '') {
                const tracker = {
                    userid,
                    vehicle_type, 
                    number_plate, 
                    item_transported, 
                    quantity_kgs, 
                    departure_location,
                    destination,
                    date
            
                };

                try {
                    const response = await fetch ('/tracker', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }, 
                        body: JSON.stringify(tracker)
                    });

                    if (response.ok) {
                        alert('Information added successfully');
                        window.location.href = '/tracker';
                    } else {
                        alert('Information addition failed');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }

            }
        });
    }   

});
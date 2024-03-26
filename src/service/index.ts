import { mande } from 'mande'


const users = mande('/api/users')



export function fetchRecommendations(bodyMeasurements, base64ScreenShot) {
    const apiUrl = 'https://api.tianlong.co.uk/get-size-recommendation';
    // Prepare the data to be sent in the POST request
    const postData = {
        base64_image: base64ScreenShot,
        body_measurements: bodyMeasurements
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // createAndShowTextPopup(data)
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            // hideLoadingPopup(); // Hide the loading popup regardless of the outcome
        });
}
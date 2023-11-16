document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display existing values
    chrome.storage.local.get('bodyDimensions', function(result) {
        if (result.bodyDimensions) {
            document.getElementById('bustInput').value = result.bodyDimensions.bust || '';
            document.getElementById('waistInput').value = result.bodyDimensions.waist || '';
            document.getElementById('hipsInput').value = result.bodyDimensions.hips || '';
        }
    });

    // Save new values
    document.getElementById('saveDimensionsBtn').addEventListener('click', function() {
        const bust = document.getElementById('bustInput').value;
        const waist = document.getElementById('waistInput').value;
        const hips = document.getElementById('hipsInput').value;

        // Validation
        if (!bust || !waist || !hips) {
            alert('Please enter all dimensions (Bust, Waist, Hips)');
            return;
        }

        // Save to local storage
        chrome.storage.local.set({ 
            'bodyDimensions': { bust, waist, hips }
        }, function() {
            if (chrome.runtime.lastError) {
                alert('An error occurred: ' + chrome.runtime.lastError.message);
            } else {
                alert('Dimensions saved successfully!');
            }
        });
    });
    

document.getElementById('uploadBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image to upload');
        return;
    }

    const reader = new FileReader();

    reader.onloadend = function() {
        const base64String = reader.result.replace('data:', '').replace(/^.+,/, '');

        // Store the base64 image in local storage
        chrome.storage.local.set({ 'uploadedImage': base64String }, function() {
            if (chrome.runtime.lastError) {
                alert('An error occurred: ' + chrome.runtime.lastError.message);
            } else {
                alert('Image uploaded successfully!');
            }
        });
    };

    reader.readAsDataURL(file);
});
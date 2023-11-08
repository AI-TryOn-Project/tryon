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
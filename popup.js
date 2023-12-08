document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display existing values
    chrome.storage.local.get('bodyDimensions', function(result) {
        if (result.bodyDimensions) {
            document.getElementById('bustInput').value = result.bodyDimensions.bust || '';
            document.getElementById('waistInput').value = result.bodyDimensions.waist || '';
            document.getElementById('hipsInput').value = result.bodyDimensions.hips || '';
        }
    });

    // Load the current state of the 'lowResCheckbox' and set it
    chrome.storage.local.get('lowRes', function(data) {
        const lowResCheckbox = document.getElementById('lowResCheckbox');
        if (data.lowRes !== undefined) {
            lowResCheckbox.checked = data.lowRes;
        }
    });

    // Add change event listener to the checkbox
    lowResCheckbox.addEventListener('change', function() {
        chrome.storage.local.set({ 'lowRes': this.checked });
    });

    // Load and display the stored image if it exists
    chrome.storage.local.get('uploadedImage', function(data) {
        if (data.uploadedImage) {
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = 'data:image/png;base64,' + data.uploadedImage;
            imagePreview.classList.remove('hidden'); // Show the image preview
        }
    });
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


document.getElementById('screenshotButton').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'capture'});
  });

  document.getElementById('uploadBtn').addEventListener('click', function() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image to upload');
        return;
    }

    const reader = new FileReader();
    const preview = document.getElementById('imagePreview');

    reader.onloadend = function() {
        const base64String = reader.result;
        preview.src = base64String;
        preview.classList.remove('hidden'); // Show the image preview

        // Store the base64 image in local storage
        chrome.storage.local.set({ 'uploadedImage': base64String.replace('data:', '').replace(/^.+,/, '') }, function() {
            if (chrome.runtime.lastError) {
                alert('An error occurred: ' + chrome.runtime.lastError.message);
            } else {
                alert('Image uploaded successfully!');
            }
        });
    };

    reader.readAsDataURL(file);
});
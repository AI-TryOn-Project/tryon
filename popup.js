/* Script level vars start */
let fileToUpload;
/* Script level vars end */

/* Helpers start */
// Utility function to convert cm to inches
function cmToInch(cm) {
    return Math.round(Number(cm) / 2.54);
}
function inchToCm(inches) {
    return Math.round(Number(inches) * 2.54 ) 
}

let storedInDim = []
let storedCmDim = []

function changeDimLabel(option){
    let labels = document.querySelectorAll(".tab-content-body-dim-text-label");
    labels.forEach(label => {
        label.textContent = option;
    });
}
// Update the file name display function remains the same
function updateFileNameDisplay(fileName) {
    // Crop the file name if it's too long
    const maxFileNameLength = 20; // You can adjust this value
    if (fileName.length > maxFileNameLength) {
        fileName = fileName.substring(0, maxFileNameLength - 3) + '...'; // Crop and add ellipsis
    }

    // Update the div content with the file name
    document.querySelector('.tab-content-upload-prompt').textContent = fileName;
}

function renderImgUploadedUI() {
    const preview = document.getElementById('imagePreview');
    const upload = document.getElementById('imageUploadLabel');

    // Show preview
    preview.classList.remove('hidden');
    upload.classList.add('hidden');

    // Replace upload prompt
    document.getElementById("imageUploadPrompt").textContent = "Image saved successfully! Right-click on any model picture for instant face swap.";

    // Upload btn -> change btn
    document.getElementById("uploadBtnText").textContent = "CHANGE";
    document.getElementById("uploadBtnIcon").src = "resources/icon-upload-change.svg";
}
/* Helpers end */
/* Lifecycle methods start */
document.addEventListener('DOMContentLoaded', function () {
    let bodyDimensions = {}
    // Fetch and display existing values
    chrome.storage.local.get('bodyDimensions', function (result) {
        if (result.bodyDimensions) {
            document.getElementById('bustInput').value = result.bodyDimensions.bust || '';
            document.getElementById('waistInput').value = result.bodyDimensions.waist || '';
            document.getElementById('hipsInput').value = result.bodyDimensions.hips || '';
            bodyDimensions = result.bodyDimensions
        }
    });
    chrome.storage.local.get('measurementUnit', function (result) {
        if (result.measurementUnit === 'in'||!result.measurementUnit) {
            var element = document.getElementById("dim-switch-btn");
            element.classList.add("dim-in-switch-selected");
              // Update labels for all textfields

            // old version has no measurementUnit,all is inch,store bodyDimensions as bodyDimensionsIn
            if(!result.measurementUnit){
                chrome.storage.local.set({
                    'bodyDimensionsIn':bodyDimensions,
                })
            }
        }
        changeDimLabel(result.measurementUnit)
    });
    // Last selected tab
    chrome.storage.local.get('selectedDimTab', function (result) {
        if (result.selectedDimTab) {
            switchTab(1);
        } else {
            switchTab(0);
        }
    });

    // Load and display the stored image if it exists
    chrome.storage.local.get('uploadedImage', function (data) {
        if (data.uploadedImage) {
            renderImgUploadedUI();

            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = 'data:image/png;base64,' + data.uploadedImage;
            imagePreview.classList.remove('hidden'); // Show the image preview
        }
    });
});
/* Lifecycle methods end */

// Save new values
document.getElementById('saveDimBtn').addEventListener('click', function () {
    let measurementUnit = document.querySelector('.tab-content-body-dim-text-label').textContent;
    const isInch = measurementUnit === 'in' || !measurementUnit
    let bust = document.getElementById('bustInput').value;
    let bustIn = isInch ? bust : cmToInch(bust)
    let waist = document.getElementById('waistInput').value;
    let waistIn = isInch ? waist : cmToInch(waist)
    let hips = document.getElementById('hipsInput').value;
    let hipsIn = isInch ? hips : cmToInch(hips)


    // Validation
    if (!bust || !waist || !hips) {
        alert('Please enter all dimensions (Bust, Waist, Hips)');
        return;
    }

    // Convert values if the unit is cm
    // if (measurementUnit === 'cm') {
    //     bust = cmToInch(parseFloat(bust));
    //     waist = cmToInch(parseFloat(waist));
    //     hips = cmToInch(parseFloat(hips));
    // }

    // Save to local storage
    chrome.storage.local.set({
        'bodyDimensions': { bust, waist, hips }, // for UI
        'bodyDimensionsIn':{bust:bustIn,waist:waistIn,hips:hipsIn},// only for server
        'measurementUnit':measurementUnit
    }, function () {
        if (chrome.runtime.lastError) {
            alert('An error occurred: ' + chrome.runtime.lastError.message);
        } else {
            alert('Dimensions saved successfully!');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#sizeRecomBtn').forEach(function (element) {
        element.addEventListener('click', function () {
            let bust = document.getElementById('bustInput').value;
            let waist = document.getElementById('waistInput').value;
            let hips = document.getElementById('hipsInput').value;
            if (!bust || !waist || !hips) {
                alert('Please enter all dimensions (Bust, Waist, Hips)');
                return;
            }
            chrome.runtime.sendMessage({ action: 'capture' });
        });
    });
});

// Upload btn logic
document.getElementById('uploadBtn').addEventListener('click', function () {
    const reader = new FileReader();
    const preview = document.getElementById('imagePreview');
    const upload = document.getElementById('imageUploadLabel');

    // Change btn logic
    if (document.getElementById("uploadBtnText").textContent === "CHANGE") {
        preview.classList.add('hidden');
        upload.classList.remove('hidden');
        document.getElementById("imageUploadLabelPrompt").textContent = "Drag image here or Select image to upload";

        // Replace upload prompt
        document.getElementById("imageUploadPrompt").textContent = "Clear, well-lit facial image";

        // Upload btn -> change btn
        document.getElementById("uploadBtnText").textContent = "UPLOAD";
        document.getElementById("uploadBtnIcon").src = "resources/icon-upload-cloud.svg";

        // Purge selected img
        fileToUpload = undefined;
        return;
    }

    if (!fileToUpload) {
        alert('Please select an image to upload');
        return;
    }

    reader.onloadend = function () {
        const base64String = reader.result;
        preview.src = base64String;

        renderImgUploadedUI();

        // Store the base64 image in local storage
        chrome.storage.local.set({ 'uploadedImage': base64String.replace('data:', '').replace(/^.+,/, '') }, function () {
            if (chrome.runtime.lastError) {
                alert('An error occurred: ' + chrome.runtime.lastError.message);
            } else {
                alert('Image uploaded successfully!');
            }
        });
    };

    reader.readAsDataURL(fileToUpload);
});

// Event listener for file input change
document.getElementById('imageUpload').addEventListener('change', function () {
    const fileInput = this;
    let fileName = fileInput.files.length > 0 ? fileInput.files[0].name : '';
    fileToUpload = fileInput.files[0];

    // Crop the file name if it's too long
    const maxFileNameLength = 20;
    if (fileName.length > maxFileNameLength) {
        fileName = fileName.substring(0, maxFileNameLength - 3) + '...';
    }

    // Update the div content with the file name
    document.getElementById('imageUploadLabelPrompt').textContent = fileName;

    // Reset the file input after processing the file
    setTimeout(function () {
        fileInput.value = ''; // Reset the input value
    }, 0);
});

// Drag and drop file support
document.addEventListener('DOMContentLoaded', function () {
    const dropZone = document.querySelector('.tab-content-inner-bg');

    // Function to update the input element and display text with the file
    function prepareFileInput(file) {
        updateFileNameDisplay(file.name);
        fileToUpload = file;
    }

    dropZone.addEventListener('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    dropZone.addEventListener('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            prepareFileInput(files[0]);
        }
    });
});

// Close btn logic
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#closeBtn').forEach(function (element) {
        element.addEventListener('click', function () {
            window.close();
        });
    });
});

// Your existing switchTab function
function switchTab(tabIndex) {
    var i, tabcontent, tabs;
    tabcontent = document.getElementsByClassName("tab-content");
    tabs = document.getElementsByClassName("tab-bar-tab");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabs[i].classList.remove("selected");
    }
    document.getElementById("tab" + tabIndex + "Content").style.display = "block";
    tabs[tabIndex].classList.add("selected");

    // Persist selection
    chrome.storage.local.set({ 'selectedDimTab': tabIndex === 1 });
}

// Tabbar logic
document.addEventListener('DOMContentLoaded', function () {
    // Attach click event listeners to tab bar tabs
    var tabs = document.querySelectorAll('.tab-bar-tab');
    tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
            switchTab(index);
        });
    });
});

// Dim switch
document.getElementById("dim-switch-btn").addEventListener("click", function () {
    this.classList.toggle("dim-in-switch-selected");
    let option = this.classList.contains("dim-in-switch-selected") ? "in" : "cm";

    // Update labels for all textfields
    changeDimLabel(option)
    //  Update input for all textfields
    let inputs = document.querySelectorAll(".tab-content-body-dim-text-field");
    let measurementUnit = document.querySelector('.tab-content-body-dim-text-label').textContent;
    

    inputs.forEach((input,index) => {
        input.addEventListener('input', function() {
            if (option === 'in') {
                // User is inputting data in inches, clear the corresponding cm value
                storedCmDim[index] = undefined;
            } else {
                // User is inputting data in cm, clear the corresponding inch value
                storedInDim[index] = undefined;
            }
        });
        let preValue = input.value
        if(measurementUnit === 'in'){
            input.value =storedCmDim[index]|| cmToInch(preValue)
            storedInDim[index] = preValue
        }else{
            input.value =storedInDim[index]|| inchToCm(preValue)
            storedCmDim[index] = preValue
        }
    });
});

// Minimize logic
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#minBtn').forEach(function (element) {
        element.addEventListener('click', function () {
            var windowContentFull = document.getElementById('windowContentFull');
            var windowContentMin = document.getElementById('windowContentMin');

            // validation
            let bust = document.getElementById('bustInput').value;
            let waist = document.getElementById('waistInput').value;
            let hips = document.getElementById('hipsInput').value;
            if (!bust || !waist || !hips) {
                alert('Please enter all dimensions (Bust, Waist, Hips)');
                return;
            }
            if (document.body.style.height === "260px" || !document.body.style.height) {
                // Window size 260px/78px
                document.body.style.height = "78px";

                // Window content
                windowContentFull.style.display = "none";
                windowContentMin.style.display = "block";
            } else {
                // Window size 260px/78px
                document.body.style.height = "260px";

                // Window content
                windowContentFull.style.display = "block";
                windowContentMin.style.display = "none";
            }
        });
    });
});

// Helpful vids btn
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('vidsBtn').addEventListener('click', function () {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.runtime.sendMessage({
                action: "injectScript",
                tabId: tabs[0].id,
            });
        });
    });

});


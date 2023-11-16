document.addEventListener('DOMContentLoaded', function() {
    // Fetch and display existing values
    chrome.storage.local.get('bodyDimensions', function(result) {
        if (result.bodyDimensions) {
            document.getElementById('bustInput').value = result.bodyDimensions.bust || '';
            document.getElementById('waistInput').value = result.bodyDimensions.waist || '';
            document.getElementById('hipsInput').value = result.bodyDimensions.hips || '';
        }
    });

    // Function to make the API call and render the size chart
    function fetchAndRenderSizeChart(userDimensions) {

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentTab = tabs[0];
            if (!currentTab || !currentTab.url) {
                console.error('No active tab found');
                return;
            }
    
            const currentUrl = currentTab.url;
            const apiUrl = `http://127.0.0.1:5000/get-size-guide?category_id=bottoms-women&product_url=${encodeURIComponent(currentUrl)}`;
    
            fetch(apiUrl)
            .then(response => {
                if (!response.ok && response.status === 404) {
                    console.log('Size guide not found');
                }
                return response.json();
            })
            .then(data => {
                renderSizeChart(data, userDimensions);
            })
            .catch(error => {
                console.error('Error fetching size guide:', error);
            });
        });
    }

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

    // When fetching and displaying existing values...
    chrome.storage.local.get('bodyDimensions', function(result) {
        if (result.bodyDimensions) {
            fetchAndRenderSizeChart(result.bodyDimensions);
        } else {
            fetchAndRenderSizeChart({});
        }
    });

    function parseDimensionRange(rangeStr) {
        const parts = rangeStr.split(' - ').map(Number);
        return { min: parts[0], max: parts.length > 1 ? parts[1] : parts[0] };
    }

    function highlightUserDimensions(userDimensions) {
        const rows = document.querySelectorAll('#sizeChartTable tr:not(:first-child)');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                // Match the index with the corresponding user dimension
                const dimensionKey = Object.keys(userDimensions)[index];
                if (dimensionKey) {
                    const cellDimensionRange = parseDimensionRange(cell.textContent.trim());
                    const userDimensionValue = Number(userDimensions[dimensionKey]);
    
                    if (userDimensionValue >= cellDimensionRange.min && userDimensionValue <= cellDimensionRange.max) {
                        cell.classList.add('highlight');
                    }
                }
            });
        });
    }

    function renderSizeChart(data, userDimensions) {
        if (!data || !data.length) {
            console.error('No size data available');
            return;
        }
    
        let chartHtml = '<table id="sizeChartTable">';
        
        // Create headers dynamically from the keys of the first object in the array
        chartHtml += '<tr>';
        Object.keys(data[0]).forEach(key => {
            chartHtml += `<th>${key}</th>`;
        });
        chartHtml += '</tr>';
        
        // Iterate over the data to create table rows
        data.forEach(size => {
            chartHtml += '<tr>';
            Object.values(size).forEach(value => {
                chartHtml += `<td>${value}</td>`;
            });
            chartHtml += '</tr>';
        });
    
        chartHtml += '</table>';
    
        // Add the chart to the DOM
        const chartContainer = document.createElement('div');
        chartContainer.innerHTML = chartHtml;
        document.body.appendChild(chartContainer);

        highlightUserDimensions(userDimensions);
    }
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
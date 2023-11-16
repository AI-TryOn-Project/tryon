let rightClickedElement = null;

document.addEventListener('contextmenu', (event) => {
  if (event.target.tagName === 'IMG') {
    rightClickedElement = event.target;
  }
}, true);

function addStyles() {
  const styleElement = document.createElement('style');
  styleElement.type = 'text/css';
  styleElement.textContent = `
      .highlight {
          background-color: yellow;
      }
  `;
  document.head.appendChild(styleElement);
}

// Call this function early in your content script
addStyles();

function createPopup(imageBase64, sizeChartData, userDimensions) {
    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'my-extension-image-popup';
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '50%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translate(-50%, -50%)';
    popupContainer.style.zIndex = '10000';
    popupContainer.style.padding = '10px';
    popupContainer.style.backgroundColor = 'white';
    popupContainer.style.border = '1px solid black';
    popupContainer.style.borderRadius = '8px';
    popupContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    popupContainer.style.display = 'flex'; // Enable flexbox
    popupContainer.style.justifyContent = 'center'; // Center items horizontally
    popupContainer.style.alignItems = 'center'; // Center items vertically

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.src = imageBase64;
    imageElement.style.maxWidth = '40vw'; // Adjust width as needed
    imageElement.style.maxHeight = '80vh'; // max height as 80% of the viewport height
    imageElement.style.width = 'auto'; // maintain aspect ratio
    imageElement.style.height = 'auto'; // maintain aspect ratio
    imageElement.style.borderRadius = '4px';
    imageElement.style.marginRight = '20px'; // Add some space between the image and the size chart

    // Create the size chart container
    const sizeChartContainer = document.createElement('div');
    sizeChartContainer.style.maxWidth = '50vw'; // Adjust width as needed


    if (sizeChartData) {
  
      // Create the size chart table
      const sizeChartTable = document.createElement('table');
      sizeChartTable.id = 'sizeChartTable'; // Assign the ID
      sizeChartTable.style.width = '100%';
      sizeChartTable.style.borderCollapse = 'collapse';
    
      // Add headers to the table
      const headerRow = document.createElement('tr');
      Object.keys(sizeChartData[0]).forEach(key => {
          const headerCell = document.createElement('th');
          headerCell.textContent = key;
          headerCell.style.border = '1px solid black';
          headerCell.style.padding = '5px';
          headerRow.appendChild(headerCell);
      });
      sizeChartTable.appendChild(headerRow);
    
      // Add data to the table
      sizeChartData.forEach(item => {
          const dataRow = document.createElement('tr');
          Object.values(item).forEach(value => {
              const dataCell = document.createElement('td');
              dataCell.textContent = value;
              dataCell.style.border = '1px solid black';
              dataCell.style.padding = '5px';
              dataRow.appendChild(dataCell);
          });
          sizeChartTable.appendChild(dataRow);
      });
      // Append the size chart table to its container
      sizeChartContainer.appendChild(sizeChartTable);
        const message = document.createElement('p');
        message.textContent = "Inaccurate or outdated size chart? Use our plugin to take the current size chart and see our size recommendation.";
        sizeChartContainer.appendChild(message);

    } else {
      // Fallback message when size chart is not available
      const fallbackMessage = document.createElement('p');
      fallbackMessage.textContent = "We don't have a size chart for this apparel on file. Try taking a screenshot of the size chart and see our size recommendation.";
      sizeChartContainer.appendChild(fallbackMessage);
    }
    // Append the image and close button to the popup
    popupContainer.appendChild(imageElement);
    // Append the size chart container to the popup
    popupContainer.appendChild(sizeChartContainer);

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = function() {
        document.body.removeChild(popupContainer);
    };
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';

    // Append the close button to the popup
    popupContainer.appendChild(closeButton);
  
    // Add the popup to the body
    document.body.appendChild(popupContainer);

    if (sizeChartData) {
      highlightUserDimensions(userDimensions);
    }
  }

  function parseDimensionRange(rangeStr) {
    // Function to convert fractional sizes to decimal
    function convertFractionalSize(sizeStr) {
        if (sizeStr.includes('½')) {
            return parseFloat(sizeStr.replace('½', '')) + 0.5;
        } else {
            return parseFloat(sizeStr);
        }
    }

    const parts = rangeStr.split(' - ').map(convertFractionalSize);

    if (parts.length === 1) {
        // No range, just a single value
        return { min: parts[0], max: parts[0] };
    } else {
        // A range of values
        return { min: Math.min(...parts), max: Math.max(...parts) };
    }
}


function highlightUserDimensions(userDimensions) {
  const rows = document.querySelectorAll('#sizeChartTable tr:not(:first-child)');
  let closestCell = null;
  let closestDistance = Infinity;

  rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const headers = document.querySelectorAll('#sizeChartTable th');

      cells.forEach((cell, index) => {
          const headerText = headers[index].textContent.trim();
          const userDimensionKey = Object.keys(userDimensions).find(key => 
              key.replace(/\s+/g, '').toLowerCase() === headerText.replace(/\s+/g, '').toLowerCase());

          if (userDimensionKey) {
              const cellDimensionRange = parseDimensionRange(cell.textContent.trim());
              const userDimensionValue = parseFloat(userDimensions[userDimensionKey]);

              // Check if the user dimension is within the range or is the closest match
              if (userDimensionValue >= cellDimensionRange.min && userDimensionValue <= cellDimensionRange.max) {
                  cell.classList.add('highlight');
                  return; // Exit the function as we found an exact or within-range match
              } else {
                  // Determine if this cell is the closest match so far
                  const distance = Math.min(
                      Math.abs(cellDimensionRange.min - userDimensionValue),
                      Math.abs(cellDimensionRange.max - userDimensionValue)
                  );
                  if (distance < closestDistance) {
                      closestDistance = distance;
                      closestCell = cell;
                  }
              }
          }
      });
  });

  // If no exact match was found, highlight the closest cell
  if (closestCell && closestDistance < Infinity) {
      closestCell.classList.add('highlight');
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showLoading') {
    showLoadingPopup('Generating Virtual Try-On, Please Wait...');
  }
  else if (message.action === 'replaceImage') {
    hideLoadingPopup();

    fetchAndRenderSizeChart(message.productUrl, message.pageTitle, message.srcUrl, message.pageTitle)
        .then(sizeChartData => {
            if (sizeChartData) {
                createPopup(message.newImageBase64, sizeChartData, message.userDimensions);
            } else {
                // Handle the case where size chart data couldn't be fetched
                console.log("Failed to fetch size chart data.");
            }
        });
    rightClickedElement = null; // Reset the right-clicked element
  } else if (message.action === 'getRecommendations') {
    showLoadingPopup('Generating AI size recommendations, Please Wait...');
    fetchRecommendations(message.userDimensions, message.base64ScreenShot);
  }
});

function fetchRecommendations(bodyMeasurements, base64ScreenShot) {
    const apiUrl = 'http://127.0.0.1:5000/get-size-recommendation';

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
        createAndShowTextPopup(data)
    })
    .catch(error => console.error('Error:', error))
    .finally(() => {
        hideLoadingPopup(); // Hide the loading popup regardless of the outcome
    });
}

function createAndShowTextPopup(dataText) {
    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'my-extension-popup-container';
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '20%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translateX(-50%)';
    popupContainer.style.zIndex = '10000';  // Same z-index as the loading popup
    popupContainer.style.padding = '20px';
    popupContainer.style.backgroundColor = 'rgba(255, 255, 255, 1)'; // Similar to loading popup
    popupContainer.style.borderRadius = '10px';
    popupContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    popupContainer.style.maxWidth = '80%';
    popupContainer.style.maxHeight = '60%';
    popupContainer.style.overflowY = 'auto';

    // Create the text element
    const textElement = document.createElement('p');
    textElement.textContent = dataText;
    textElement.style.margin = '0';

    // Append the text element to the popup container
    popupContainer.appendChild(textElement);

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.onclick = function() {
        document.body.removeChild(popupContainer);
    };

    // Append the close button to the popup container
    popupContainer.appendChild(closeButton);

    // Append the popup container to the body
    document.body.appendChild(popupContainer);
}

function fetchAndRenderSizeChart(currentUrl, pageTitle, srcUrl, pageTitle) {
  showLoadingPopup('Generating size recommendation for you...');
  const apiUrl = `http://127.0.0.1:5000/get-size-guide`;

  // Prepare the data to be sent in the POST request
  const postData = {
      category_id: 'bottoms-women',
      product_url: currentUrl,
      page_title: pageTitle,
      img_src_url: srcUrl,
      page_title: pageTitle
  };

  return fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
  })
  .then(response => {
      if (!response.ok) {
          if (response.status === 404) {
              console.log('Size guide not found');
              return null; // Return null to indicate no data
          }
          throw new Error('Error fetching size guide');
      }
      return response.json();
  })
  .then(data => {
      // This data will now be used in createPopup
      return data;
  })
  .catch(error => {
      console.error('Error:', error);
      return null; // Return null to indicate an error
  })
  .finally(() => {
      hideLoadingPopup(); // Hide the loading popup regardless of the outcome
  });
}

function showLoadingPopup(loadingText) {
  const loadingPopup = document.createElement('div');
  loadingPopup.id = 'my-extension-loading-popup';
  loadingPopup.style.position = 'fixed';
  loadingPopup.style.top = '50%';
  loadingPopup.style.left = '50%';
  loadingPopup.style.transform = 'translate(-50%, -50%)';
  loadingPopup.style.zIndex = '10000';
  loadingPopup.style.padding = '20px';
  loadingPopup.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  loadingPopup.style.borderRadius = '8px';
  loadingPopup.style.display = 'flex';
  loadingPopup.style.justifyContent = 'center';
  loadingPopup.style.alignItems = 'center';
  loadingPopup.style.flexDirection = 'column';
  loadingPopup.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

  const spinner = document.createElement('div');
  spinner.style.border = '5px solid #f3f3f3';
  spinner.style.borderTop = '5px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.width = '50px';
  spinner.style.height = '50px';
  spinner.style.animation = 'spin 1s linear infinite';

  const spinnerText = document.createElement('div');
  spinnerText.textContent = loadingText;
  spinnerText.style.marginTop = '10px';

  loadingPopup.appendChild(spinner);
  loadingPopup.appendChild(spinnerText);
  document.body.appendChild(loadingPopup);

  // Add the @keyframes for the spinner
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
      @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
      }
  `;
  document.head.appendChild(styleSheet);
}

// Function to hide the loading popup
function hideLoadingPopup() {
  const loadingPopup = document.getElementById('my-extension-loading-popup');
  if (loadingPopup) {
      document.body.removeChild(loadingPopup);
  }
}

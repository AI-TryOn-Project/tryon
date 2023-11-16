let rightClickedElement = null;

document.addEventListener('contextmenu', (event) => {
  if (event.target.tagName === 'IMG') {
    rightClickedElement = event.target;
  }
}, true);

function createPopup(imageBase64, sizeChartData) {
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
  
     // Create the image element
     const imageElement = document.createElement('img');
     imageElement.src = imageBase64;
     imageElement.style.maxWidth = '80vw'; // max width as 80% of the viewport width
     imageElement.style.maxHeight = '80vh'; // max height as 80% of the viewport height
     imageElement.style.width = 'auto'; // maintain aspect ratio
     imageElement.style.height = 'auto'; // maintain aspect ratio
     imageElement.style.borderRadius = '4px';
 
  
    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = function() {
      document.body.removeChild(popupContainer);
    };
    closeButton.style.marginTop = '10px';
  
    // Append the image and close button to the popup
    popupContainer.appendChild(imageElement);
    popupContainer.appendChild(closeButton);


    // Create the size chart container
    const sizeChartContainer = document.createElement('div');
    sizeChartContainer.style.marginTop = '20px';
  
    // Create the size chart table
    const sizeChartTable = document.createElement('table');
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
  
    // Append the size chart container to the popup
    popupContainer.appendChild(sizeChartContainer);
  
    // Add the popup to the body
    document.body.appendChild(popupContainer);
  }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showLoading') {
    showLoadingPopup();
  }
  else if (message.action === 'replaceImage') {
    hideLoadingPopup();

    fetchAndRenderSizeChart(message.productUrl, message.pageTitle)
        .then(sizeChartData => {
            if (sizeChartData) {
                createPopup(message.newImageBase64, sizeChartData);
            } else {
                // Handle the case where size chart data couldn't be fetched
                console.log("Failed to fetch size chart data.");
            }
        });
    rightClickedElement = null; // Reset the right-clicked element
  }
});

function fetchAndRenderSizeChart(currentUrl, pageTitle) {
  const apiUrl = `http://127.0.0.1:5000/get-size-guide?category_id=bottoms-women&product_url=${encodeURIComponent(currentUrl)}&page_title=${encodeURIComponent(pageTitle)}`;

  return fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              if (response.status === 404) {
                  console.log('Size guide not found');
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
      });
}

function showLoadingPopup() {
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
  spinnerText.textContent = 'Generating Virtual Try-On, Please Wait...';
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

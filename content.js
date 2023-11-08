let rightClickedElement = null;

document.addEventListener('contextmenu', (event) => {
  if (event.target.tagName === 'IMG') {
    rightClickedElement = event.target;
  }
}, true);

function createPopup(imageBase64) {
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
  
    // Add the popup to the body
    document.body.appendChild(popupContainer);
  }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showLoading') {
    showLoadingPopup();
  }
  else if (message.action === 'replaceImage') {
    hideLoadingPopup();
    createPopup(message.newImageBase64);
    rightClickedElement = null; // Reset the right-clicked element
  }
});

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

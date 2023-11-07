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
    imageElement.style.width = '100%'; // or set a fixed size
    imageElement.style.height = 'auto';
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
  if (message.action === 'replaceImage') {
    createPopup(message.newImageBase64);
    rightClickedElement = null; // Reset the right-clicked element
  }
});

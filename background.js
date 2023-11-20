chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "viewImage",
      title: "fAIshion Try-On",
      contexts: ["image"]
    });
  });

  chrome.runtime.onMessage.addListener(async function (message, tab, sendResponse) {
    console.log(message);
    console.log(message.action);
    if (message.action === 'capture') {
      const base64ScreenShot = await chrome.tabs.captureVisibleTab();
      chrome.storage.local.get('bodyDimensions', function(result) {
        const userDimensions = result.bodyDimensions || {};
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          const currentTab = tabs[0];
          if (currentTab) {
              chrome.tabs.sendMessage(currentTab.id, {
                  action: 'getRecommendations',
                  userDimensions: userDimensions,
                  base64ScreenShot: base64ScreenShot
              });
          }
        });
      });
    }
  });

// Fetches an image and converts it to a base64 data URL
function fetchImageAsBase64(url, callback) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result); // This is the data URL
        reader.readAsDataURL(blob);
      })
      .catch(error => console.error('Error fetching image:', error));
  }
  
  // This function sends the API request to your server
  function sendApiRequest(sourceImageBase64, targetImageBase64, lastRightClickedImageSrc, tab, pageUrl, useLowRes) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showLoading'
    });
    
    const data = {
        "source_image": sourceImageBase64,
        "target_image": targetImageBase64,
        "upscale": !useLowRes
    };
  
    fetch('https://tianlong.ngrok.io/relay', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      const imageBase64 = data.image;
      console.log("finished processubg")

      chrome.storage.local.get('bodyDimensions', function(result) {
          const userDimensions = result.bodyDimensions || {};
          chrome.tabs.sendMessage(tab.id, {
            action: 'replaceImage',
            srcUrl: lastRightClickedImageSrc,
            userDimensions: userDimensions,
            productUrl: pageUrl,
            pageTitle: tab.title,
            newImageBase64: 'data:image/png;base64,' + imageBase64 // your new image data
          });
      });

    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
  
  // Example usage: Convert right-clicked image to base64 and call API
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "viewImage") {
        fetchImageAsBase64(info.srcUrl, (targetImageBase64) => {
        // Assuming 'targetImage.png' is in the 'images' directory of your extension
        chrome.storage.local.get(['uploadedImage', 'lowRes'], function(data) {
          const sourceImageBase64 = data.uploadedImage;
          const useLowRes = data.lowRes || false; // Default to false if not set

          // Check if the sourceImageBase64 is not set
          if (!sourceImageBase64) {
            alert("Please upload an image in the extension before proceeding.");
            return; // Exit the function if no image is set
          }
           
          sendApiRequest(sourceImageBase64, targetImageBase64, info.srcUrl, tab, info.pageUrl, useLowRes);
        });
      });
    }
  });
  
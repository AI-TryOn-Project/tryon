chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "viewImage",
    title: "fAIshion Try-On",
    contexts: ["all"],
  });
});

chrome.runtime.onMessage.addListener(async function (
  message,
  tab,
  sendResponse
) {
  console.log(message);
  console.log(message.action);
  if (message.action === "capture") {
    const base64ScreenShot = await chrome.tabs.captureVisibleTab();
    chrome.storage.local.get("bodyDimensionsIn", function (result) {
      const userDimensions = result.bodyDimensionsIn || {};
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        if (currentTab) {
          chrome.tabs.sendMessage(currentTab.id, {
            action: "getRecommendations",
            userDimensions: userDimensions,
            base64ScreenShot: base64ScreenShot,
            tabUrl: currentTab.url,
          });
        }
      });
    });
  } else if (message.action === "captureSelectedArea") {
    captureAndProcessImage(
      message.coordinates,
      message.isSizeChart,
      message.userDimensions
    );
  } else if (message.action === "finishedCrop") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      generateTryOn(
        message.croppedDataUrl,
        "https://img.shopcider.com/hermes/video/1681719531000-ehkmff.jpg",
        currentTab,
        currentTab.url
      ); // fix me
    });
  } else if (message.action === "injectScript") {
    chrome.scripting
      .executeScript({
        target: { tabId: message.tabId },
        files: ["content/showHelpfulVideos.js"],
      })
      .then(() => {
        console.log("Content script has been injected.");
      })
      .catch((err) => console.error(err));
  } else if (message.action === "enhanceRegenerate") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      const { formData } = message;
      chrome.storage.local.set({ enhanceTryOnData: formData });
      chrome.storage.local.get(["lastRightClickedImageSrc"], function (result) {
        fetchImageAsBase64(
          result.lastRightClickedImageSrc,
          (targetImageBase64) => {
            generateTryOn(
              targetImageBase64,
              result.lastRightClickedImageSrc,
              currentTab,
              currentTab.url
            );
          }
        );
      });
    });
  }
});

function captureAndProcessImage(
  selectionCoordinates,
  isSizeChart,
  userDimensions
) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0];
    chrome.tabs.captureVisibleTab(
      currentTab.windowId,
      { format: "png" },
      function (dataUrl) {
        chrome.tabs.sendMessage(currentTab.id, {
          action: "processCapturedImage",
          dataUrl: dataUrl,
          selection: selectionCoordinates,
          isSizeChart: isSizeChart,
          userDimensions: userDimensions,
          tabUrl: currentTab.url,
        });
      }
    );
  });
}

// Fetches an image and converts it to a base64 data URL
function fetchImageAsBase64(url, callback) {
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result); // This is the data URL
      reader.readAsDataURL(blob);
    })
    .catch((error) => console.error("Error fetching image:", error));
}

// This function sends the API request to your server
async function sendApiRequest(
  sourceImageBase64,
  targetImageBase64,
  lastRightClickedImageSrc,
  tab,
  pageUrl,
  useLowRes
) {
  chrome.tabs.sendMessage(tab.id, {
    action: "showLoading",
  });
  const getStorageData = (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function (result) {
        resolve(result[key]);
      });
    });
  };

  // Asynchronously retrieve data from storage
  const enhanceTryOnData = await getStorageData("enhanceTryOnData") || {};
  chrome.storage.local.get(["savedPrompt"], function (result) {
    const savedPrompt =
      result.savedPrompt || "fit woman, on the busy street, bright sunshine";

    const data = {
      model: lastRightClickedImageSrc,
      face: sourceImageBase64,
      prompt: savedPrompt, // Use the loaded prompt
      enhanceTryOnData: enhanceTryOnData,
    };

    fetch("https://tryon-advanced.tianlong.co.uk/upload/images", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        const imageBase64 = data.image;
        console.log("finished processubg");

        chrome.storage.local.get("bodyDimensionsIn", function (result) {
          const userDimensions = result.bodyDimensionsIn || {};
          chrome.tabs.sendMessage(tab.id, {
            action: "replaceImage",
            srcUrl: lastRightClickedImageSrc,
            userDimensions: userDimensions,
            productUrl: pageUrl,
            pageTitle: tab.title,
            newImageBase64: "data:image/png;base64," + imageBase64, // your new image data
          });
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

// Example usage: Convert right-clicked image to base64 and call API
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "viewImage") {
    if (info.srcUrl) {
      // Save the last right-clicked image URL
      chrome.storage.local.set({ lastRightClickedImageSrc: info.srcUrl });
      fetchImageAsBase64(info.srcUrl, (targetImageBase64) => {
        generateTryOn(targetImageBase64, info.srcUrl, tab, info.pageUrl);
      });
    } else {
      console.log(
        "no src url, sending createOverlay message to content script"
      );
      chrome.tabs.sendMessage(tab.id, { action: "createOverlay" });
    }
  } else if (info.menuItemId === "recommendSize") {
    chrome.storage.local.get("bodyDimensionsIn", function (result) {
      const userDimensions = result.bodyDimensionsIn || {};
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        if (currentTab) {
          chrome.tabs.sendMessage(currentTab.id, {
            action: "getRecommendations",
            userDimensions: userDimensions,
            // base64ScreenShot: base64ScreenShot
          });
        }
      });
    });
  }
});

function generateTryOn(targetImageBase64, srcUrl, tab, pageUrl) {
  // Assuming 'targetImage.png' is in the 'images' directory of your extension
  chrome.storage.local.get(["uploadedImage", "lowRes"], function (data) {
    const sourceImageBase64 = data.uploadedImage;
    const useLowRes = data.lowRes || false; // Default to false if not set

    // Check if the sourceImageBase64 is not set
    if (!sourceImageBase64) {
      alert("Please upload an image in the extension before proceeding.");
      return; // Exit the function if no image is set
    }
    sendApiRequest(
      sourceImageBase64,
      targetImageBase64,
      srcUrl,
      tab,
      pageUrl,
      useLowRes
    );
  });
}

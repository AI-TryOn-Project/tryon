chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "viewImage",
      title: "View Image",
      contexts: ["image"]
    });
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
  function sendApiRequest(sourceImageBase64, targetImageBase64, lastRightClickedImageSrc, tab) {
    const data = {
        "source_image": sourceImageBase64,
        "target_image": targetImageBase64,
        "source_faces_index": [0],
        "face_index": [0],
        "upscaler": "4x_Struzan_300000",
        "scale": 2,
        "upscale_visibility": 1,
        "face_restorer": "CodeFormer",
        "restorer_visibility": 1,
        "restore_first": 1,
        "model": "inswapper_128.onnx",
        "gender_source": 0,
        "gender_target": 0,
        "save_to_file": 0,
        "result_file_path": ""
    };
  
    fetch('https://6399-73-93-232-158.ngrok-free.app/reactor/image', {
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
      chrome.tabs.sendMessage(tab.id, {
        action: 'replaceImage',
        srcUrl: lastRightClickedImageSrc,
        newImageBase64: 'data:image/png;base64,' + imageBase64 // your new image data
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
        fetchImageAsBase64("https://media.licdn.com/dms/image/C4D03AQGoAc_VqUatvA/profile-displayphoto-shrink_800_800/0/1516999668372?e=1704931200&v=beta&t=P1ySObPY2jbTTlV1fxwlJygUGMaxH1YnW79gfAOaSok", (sourceImageBase64) => {
          sendApiRequest(sourceImageBase64, targetImageBase64, info.srcUrl, tab);
        });
      });
    }
  });
  
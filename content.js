let rightClickedElement = null;
let isSelecting = false;
let startX, startY, endX, endY;
let overlay, selectionBox;

document.addEventListener('contextmenu', (event) => {
    // Check if the clicked element is an image
    if (event.target.tagName === 'IMG') {
        rightClickedElement = event.target;
    }
}, true);

function addStyles() {
    const styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    styleElement.textContent = `
      .highlight {
        background-color: #fff3cd; /* softer yellow */
        border: 1px solid #ffeeba;
        color: #856404; /* darker text color for better contrast */
        padding: 5px;
        border-radius: 4px; /* rounded corners */
      }
  `;
    document.head.appendChild(styleElement);
}

// Call this function early in your content script
addStyles();

function makeDraggable(element) {
    let isDragging = false;
    let dragStartX, dragStartY;

    const onMouseDown = (e) => {
        isDragging = true;
        dragStartX = e.clientX - element.offsetLeft;
        dragStartY = e.clientY - element.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - dragStartX}px`;
        element.style.top = `${e.clientY - dragStartY}px`;
    };

    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    element.addEventListener('mousedown', onMouseDown);
}


function createPopup(imageBase64, sizeChartData, userDimensions) {
    // Create the popup container with a fixed width
    const popupContainer = document.createElement('div');
    popupContainer.id = 'my-extension-image-popup';
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '50%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translate(-50%, -50%)';
    popupContainer.style.zIndex = '100000';
    popupContainer.style.backgroundColor = 'white';
    popupContainer.style.border = '1px solid black';
    popupContainer.style.borderRadius = '8px';
    popupContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    popupContainer.style.display = 'flex';
    popupContainer.style.flexDirection = 'row';
    popupContainer.style.alignItems = 'start';
    popupContainer.style.padding = '10px';
    popupContainer.style.width = sizeChartData ? '60vw' : '30vw'; // Adjust width as needed
    popupContainer.style.maxHeight = '80vh';
    popupContainer.style.overflow = 'auto';

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.src = imageBase64;
    imageElement.style.maxWidth = '50%'; // Adjust width as needed
    imageElement.style.maxHeight = '100%';
    imageElement.style.borderRadius = '4px';
    imageElement.style.marginRight = '20px';

    // Create the size chart container
    const sizeChartContainer = document.createElement('div');
    sizeChartContainer.style.flexGrow = sizeChartData ? '1' : '0'; // Adjust based on sizeChartData
    sizeChartContainer.style.maxWidth = sizeChartData ? '50%' : '0'; // Adjust max width based on sizeChartData

    if (sizeChartData) {
        // Create the size chart table
        const sizeChartTable = document.createElement('table');
        sizeChartTable.id = 'sizeChartTable';
        sizeChartTable.style.width = '100%';
        sizeChartTable.style.borderCollapse = 'collapse';

        // Function to reorder keys with 'Size' as the first key
        const reorderKeysWithSizeFirst = (obj) => {
            const { Size, ...rest } = obj;
            return { Size, ...rest };
        };

        // Add headers to the table
        const headerRow = document.createElement('tr');
        const orderedKeys = Object.keys(reorderKeysWithSizeFirst(sizeChartData[0]));
        orderedKeys.forEach(key => {
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
            const orderedItem = reorderKeysWithSizeFirst(item);
            Object.values(orderedItem).forEach(value => {
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
        if (imageBase64) {
            sizeChartContainer.appendChild(message);
        }
    } else {

        // Fallback message when size chart is not available
        const fallbackMessage = document.createElement('p');
        fallbackMessage.textContent = "We don't have a size chart for this apparel on file. Try taking a screenshot of the size chart and see our size recommendation.";
        //sizeChartContainer.appendChild(fallbackMessage);
        imageElement.style.maxWidth = '100%'; // Use more space for the image when there is no size chart
    }
    // Append the image and close button to the popup
    if (imageBase64) {
        popupContainer.appendChild(imageElement);
    }
    // Append the size chart container to the popup
    popupContainer.appendChild(sizeChartContainer);

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = function () {
        document.body.removeChild(popupContainer);
    };
    closeButton.style.position = 'absolute';
    closeButton.style.bottom = '10px';
    closeButton.style.right = '10px';

    // Append the close button to the popup
    popupContainer.appendChild(closeButton);

    makeDraggable(popupContainer);

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

    // Track the closest cell for each dimension
    let closestCells = {
        bust: { cell: null, distance: Infinity },
        hips: { cell: null, distance: Infinity },
        waist: { cell: null, distance: Infinity }
    };

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const headers = document.querySelectorAll('#sizeChartTable th');

        cells.forEach((cell, index) => {
            const headerText = headers[index].textContent.trim().replace(/\s+/g, '').toLowerCase();
            let userDimensionKey = null;

            // Identify the dimension
            if (headerText === 'bust' || headerText === 'chest') {
                userDimensionKey = 'bust';
            } else if (headerText === 'hips' || headerText === 'hip') {
                userDimensionKey = 'hips';
            } else if (headerText === 'waist') {
                userDimensionKey = 'waist';
            }

            if (userDimensionKey && userDimensions[userDimensionKey] !== undefined) {
                const cellDimensionRange = parseDimensionRange(cell.textContent.trim());
                const userDimensionValue = parseFloat(userDimensions[userDimensionKey]);

                // Check if the user dimension is within the range
                if (userDimensionValue >= cellDimensionRange.min && userDimensionValue <= cellDimensionRange.max) {
                    // If there's an exact match, highlight immediately and stop looking for this dimension
                    closestCells[userDimensionKey].cell = cell;
                    closestCells[userDimensionKey].distance = 0;
                    cell.classList.add('highlight');
                } else {
                    // Determine if this cell is the closest match so far for the dimension
                    const distance = Math.min(
                        Math.abs(cellDimensionRange.min - userDimensionValue),
                        Math.abs(cellDimensionRange.max - userDimensionValue)
                    );

                    if (distance < closestCells[userDimensionKey].distance) {
                        closestCells[userDimensionKey].distance = distance;
                        closestCells[userDimensionKey].cell = cell;
                    }
                }
            }
        });
    });

    // Highlight the closest cell for each dimension if no exact match was found
    Object.keys(closestCells).forEach(dimension => {
        const { cell, distance } = closestCells[dimension];
        if (cell && distance !== 0) {
            cell.classList.add('highlight');
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showLoading') {
        showLoadingPopup('Generating Virtual Try-On, Please Wait...');
    }
    else if (message.action === 'replaceImage') {
        hideLoadingPopup();

        fetchAndRenderSizeChart(message.productUrl, message.pageTitle, message.srcUrl, message.pageTitle)
            .then(sizeChartData => {
                createPopup(message.newImageBase64, sizeChartData, message.userDimensions);
            });
        rightClickedElement = null; // Reset the right-clicked element
    } else if (message.action === 'getRecommendations') {
        // createOverlay(true, message.userDimensions);
        fetchRecommendations(message.userDimensions, message.base64ScreenShot, message.tabUrl);
    } else if (message.action === "createOverlay") {
        createOverlay(false);
    } else if (message.action === "processCapturedImage") {
        cropImage(message.dataUrl, message.selection, message.isSizeChart, message.userDimensions, message.tabUrl);
    } else if (message.action === "showHelpfulVids") {

        // 检查页面中是否已经出现了弹窗, 如果出现了不再重复弹出;
        var existingElement = document.getElementById("vidsPopupContent");
        if (!existingElement) {
            showHelpfulVidsPopup();
        }
    }
});

function cropImage(dataUrl, selection, isSizeChart, userDimensions, tabUrl) {
    const pixelRatio = window.devicePixelRatio || 1;
    const scaleFactor = 0.5; // Reduce the image size to 50% of the original
    const img = new Image();
    img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Apply the scale factor to the canvas dimensions
        canvas.width = selection.width * pixelRatio * scaleFactor;
        canvas.height = selection.height * pixelRatio * scaleFactor;

        ctx.drawImage(img,
            selection.x * pixelRatio, // Source X
            selection.y * pixelRatio, // Source Y
            selection.width * pixelRatio, // Source Width
            selection.height * pixelRatio, // Source Height
            0, // Destination X
            0, // Destination Y
            selection.width * pixelRatio * scaleFactor, // Destination Width
            selection.height * pixelRatio * scaleFactor // Destination Height
        );
        const croppedDataUrl = canvas.toDataURL('image/png');
        if (isSizeChart) {
            fetchRecommendations(userDimensions, croppedDataUrl, tabUrl);
        } else {
            chrome.runtime.sendMessage({ action: "finishedCrop", croppedDataUrl: croppedDataUrl});
        }
    };
    img.src = dataUrl;
}

function fetchRecommendations(bodyMeasurements, base64ScreenShot, tabUrl) {
    showLoadingPopup('Generating size recommendation for you...');
    const apiUrl = 'https://api.tianlong.co.uk/get-size-recommendation';

    // Prepare the data to be sent in the POST request
    const postData = {
        base64_image: base64ScreenShot,
        body_measurements: bodyMeasurements,
        showing_chart: true,
        tabUrl: tabUrl
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
            createPopup(null, data, bodyMeasurements)
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            hideLoadingPopup(); // Hide the loading popup regardless of the outcome
        });
}

function createAndShowTextPopup(dataHtml) {

    const cleanedDataHtml = dataHtml.replace(/^```html ,|```$/g, '').trim();
    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.id = 'my-extension-popup-container';
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '20%';
    popupContainer.style.left = '50%';
    popupContainer.style.transform = 'translateX(-50%)';
    popupContainer.style.zIndex = '10000000';  // Ensure high enough z-index to be on top
    popupContainer.style.padding = '20px';
    popupContainer.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    popupContainer.style.borderRadius = '10px';
    popupContainer.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    popupContainer.style.maxWidth = '80%';
    popupContainer.style.maxHeight = '60%';
    popupContainer.style.overflowY = 'auto';

    // Directly set the innerHTML of the popup container to the returned HTML
    popupContainer.innerHTML = cleanedDataHtml;

    // Since the HTML content might already include structured elements,
    // there's no need to create a specific paragraph element for text content.

    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.onclick = function () {
        document.body.removeChild(popupContainer);
    };

    // The closeButton needs to be appended after setting innerHTML
    // to avoid overwriting it with the returned HTML content
    popupContainer.appendChild(closeButton);

    // Append the popup container to the body
    document.body.appendChild(popupContainer);
}


function fetchAndRenderSizeChart(currentUrl, pageTitle, srcUrl, pageTitle) {
    showLoadingPopup('Generating size recommendation for you...');
    const apiUrl = 'https://api.tianlong.co.uk/get-size-guide';

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
                console.log('Failed to get size guide');
                return null;
            }
            return response.json();
        })
        .then(data => {
            // This data will now be used in createPopup
            console.log(data)
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
    loadingPopup.style.zIndex = '10000000';
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

function createOverlay(isSizeChart, userDimensions) {
    console.log("creating overlay");
    selectionBox = null;
    isSelecting = true;

    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.cursor = 'crosshair';
    overlay.style.zIndex = '99999999';
    overlay.style.clipPath = 'inset(0)'; // Initially no clipping
    document.body.appendChild(overlay);

    overlay.addEventListener('mousedown', startSelection);
    overlay.addEventListener('mousemove', resizeSelection);
    overlay.addEventListener('mouseup', function(event) {
        endSelection(event, isSizeChart, userDimensions);
    });
    document.addEventListener('keydown', cancelSelection); // Add keydown listener
}

function cancelSelection(event) {
    if (event.key === "Escape") {
        overlay.remove();
        isSelecting = false;
        selectionBox = null;
        document.removeEventListener('keydown', cancelSelection); // Remove the listener
    }
}


function startSelection(event) {
    startX = event.clientX;
    startY = event.clientY;
    selectionBox = document.createElement('div');
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px solid red';
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    overlay.appendChild(selectionBox);
}

function resizeSelection(event) {
    if (!selectionBox) return;

    endX = event.clientX;
    endY = event.clientY;

    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    const top = Math.min(startY, endY);
    const right = Math.max(startX, endX);
    const bottom = Math.max(startY, endY);
    const left = Math.min(startX, endX);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;

    // Calculate the clip-path
    overlay.style.clipPath = `polygon(
        0% 0%,
        0% 100%,
        ${left}px 100%,
        ${left}px ${top}px,
        ${right}px ${top}px,
        ${right}px ${bottom}px,
        ${left}px ${bottom}px,
        ${left}px 100%,
        100% 100%,
        100% 0%
    )`;
}


async function endSelection(event, isSizeChart, userDimensions) {
    console.log(isSizeChart)
    if (selectionBox) {
        overlay.removeEventListener('mousedown', startSelection);
        overlay.removeEventListener('mousemove', resizeSelection);
        overlay.removeEventListener('mouseup', endSelection);

        const selectionCoordinates = {
            x: parseInt(selectionBox.style.left, 10),
            y: parseInt(selectionBox.style.top, 10),
            width: parseInt(selectionBox.style.width, 10),
            height: parseInt(selectionBox.style.height, 10)
        };

        chrome.runtime.sendMessage({ action: "captureSelectedArea", coordinates: selectionCoordinates, isSizeChart: isSizeChart, userDimensions: userDimensions}); 
        // Clean up
        overlay.remove();
        isSelecting = false;
    }
}

// Tutorial videos popup
function showHelpfulVidsPopup() {
    const headerHtml = document.createElement('div');
    headerHtml.innerHTML = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">
    `;
    document.head.appendChild(headerHtml);

    const style = document.createElement('style');
    style.textContent = `
    body {
        margin: 0;
        padding: 0;
    }
    
    #vidsPopup {
        position: fixed;
        top: 50%;
        left: 50%;
        z-index: 9999999;
        width: 800px;
        height: 550px;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 255, 255, 0.9);
        border-radius: 15px;
        display: block;
    }
    
    #vidsPopupContent {
        padding: 20px 120px 35px 120px;
    }
    
    #vidsTitleContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    #vidsTitleContainer img {
        width: 34px;
        height: 34px;
    }
    
    #vidsTitleContainer p {
        font-family: "Bai Jamjuree", sans-serif;
        font-weight: 600;
        font-style: normal;
        font-size: 22px;
    
        margin-top: 20px;
        margin-bottom: 40px;
    }
    
    #vidsContentContainer {
        display: flex;
        flex-direction: column;
        gap: 20.5px;
    }
    
    #vidsVidContentContainer {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    
    #vidsVidContentContainer p {
        font-family: "Bai Jamjuree", sans-serif;
        font-weight: 200;
        font-style: normal;
        font-size: 18px;
        width: 230px;
    }
    
    #videoSeparator {
        border: none;
        border-top: 1px dotted black;
        height: 1px;
        width: 100%;
        margin: 0;
    }
    
    #vidsCloseBtn {
        border: none;
        cursor: pointer;
        padding: 2px;
        border-radius: 8px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
        backdrop-filter: blur(4px);
        position: absolute;
        top: 20px;
        right: 20px;
    }
    
    #vidsPopupBG {
        z-index: 9999998;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        position: fixed;
        top: 0;
        left: 0;
    }
    `;
    document.head.appendChild(style);

    const popup = document.createElement('div');
    popup.innerHTML = `
    <div id="vidsPopupContent">
        <div id="vidsTitleContainer">
            <img src="https://bs-core-user-icons.s3.us-west-2.amazonaws.com/vids-title-icon.svg"/>
            <p>Helpful Videos</p>
        </div>
        <div id="vidsContentContainer">
            <div id="vidsVidContentContainer">
                <p>All-In-One RightClick Sotion</p>
                <iframe width="300" height="169" src="https://www.youtube.com/embed/hZbgKslDNTE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe> 
            </div>
            <hr id="videoSeparator">
            <div id="vidsVidContentContainer">
                <p>All Brands Solution</p>
                <iframe width="300" height="169" src="https://www.youtube.com/embed/yDCsx993bbc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
        </div>
    </div>`;
    popup.id = "vidsPopup";

    const closeButton = document.createElement('button');
    closeButton.id = 'vidsCloseBtn';
    closeButton.innerHTML = `
        <img src="https://bs-core-user-icons.s3.us-west-2.amazonaws.com/vids-icon-close.svg" alt="Close Icon" />
    `;
    closeButton.onclick = function () {
        var elementToRemove = document.getElementById('vidsPopupBG');
        document.body.removeChild(elementToRemove);
    };
    popup.appendChild(closeButton);
    const vidsPopupBG = document.createElement('div');
    vidsPopupBG.id = 'vidsPopupBG';
    vidsPopupBG.appendChild(popup);

    document.body.appendChild(vidsPopupBG);
};
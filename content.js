let rightClickedElement = null;
let isSelecting = false;
let startX, startY, endX, endY;
let overlay, selectionBox;
let progress = 0;

document.addEventListener(
    "contextmenu",
    (event) => {
        // Check if the clicked element is an image
        if (event.target.tagName === "IMG") {
            rightClickedElement = event.target;
        }
    },
    true
);

function addStyles() {
  const linkElement = document.createElement("link");
  linkElement.rel = "stylesheet";
  linkElement.type = "text/css";
  linkElement.href = chrome.runtime.getURL('styles.css');  // Ensure the path is correct
  document.head.appendChild(linkElement);
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
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - dragStartX}px`;
        element.style.top = `${e.clientY - dragStartY}px`;
    };

    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    element.addEventListener("mousedown", onMouseDown);
}

// Function to create a select element with options
function createSelect(id, options, initialValue) {
    let select = document.createElement("select");
    select.id = id;
    //   select.style.border = "unset";
    select.style.backgroundColor = "#fff";
    options.forEach((opt) => {
        let option = document.createElement("option");
        option.value = opt.toLowerCase();
        option.textContent = opt;
        if (initialValue) {
            if (option.value === initialValue.toLowerCase()) {
                option.selected = true;
            }
        }
        select.appendChild(option);
        select.onchange = function () {
            console.log(select.value);
            // 设置表单的值
            document.getElementById(id).value = select.value;
        };
    });

    return select;
}

// Function to create a label for a select element
function createLabel(forId, text) {
    let label = document.createElement("label");
    label.htmlFor = forId;
    label.textContent = text;
    label.style.marginTop = "10px";
    label.style.marginBottom = "5px";
    return label;
}
// Function to create an input element
function createInput(id, type, initialValue) {
    let input = document.createElement("input");
    //   input.style.border = "unset";
    input.style.backgroundColor = "#fff";
    input.type = type;
    input.id = id;
    input.value = initialValue; // Set the initial value
    input.onchange = function () {
        console.log(input.value);
        // 设置表单的值
        document.getElementById(id).value = input.value;
    };
    return input;
}
function createButton(id, text, onClickFunction) {
    let buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.width = "100%";

    let button = document.createElement("button");
    button.id = id;
    button.textContent = text;
    button.style.fontWeight = 500;
    button.onclick = onClickFunction;
    button.style.marginTop = "10px"; // Space out elements
    button.style.cursor = "pointer";

    buttonContainer.appendChild(button);
    return buttonContainer;
}
function logFormValues() {
    event.preventDefault();
    const formElements = document.forms["enhanceTryOnForm"].elements;
    const formData = {};
    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.tagName === "SELECT" || element.tagName === "INPUT") {
            formData[element.id] = element.value;
        }
    }
    document.body.removeChild(document.getElementById("my-extension-image-popup"))
    console.log(formData);
    // 发送消息enhanceRegenerate
    chrome.runtime.sendMessage({
        action: "enhanceRegenerate",
        formData: formData,
    });
}
function closeFormOverlay() {
    document.getElementById("formOverlay").style.display = "none";
}

function getStorageData(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (chrome.runtime.lastError) {
                // If there's an error, reject the promise
                reject(new Error(chrome.runtime.lastError));
            } else {
                // Resolve the promise with the result
                resolve(result[key]);
            }
        });
    });
}
// Function to create the overlay form
async function createFormOverlay(enhanceTryOnData) {
    const { ethnic, sex, age, skinColor, bodyShape } = enhanceTryOnData || {};

    console.log(
        ethnic,
        sex,
        age,
        skinColor,
        bodyShape,
        "enhanceTryOnDataInit!!!!"
    );

    // Create the overlay div
    let formOverlay = document.createElement("div");
    formOverlay.className = "enhance-form-container";
    // 获取保存到本地的enhanceTryOnData

    formOverlay.appendChild(createLabel("ethnic", "Ethnic"));
    formOverlay.appendChild(
        createSelect(
            "ethnic",
            [
                "African American",
                "Hispanic ",
                "Asian",
                "White",
                "Native American",
                "Native Hawaiian",
                "Middle Eastern",
            ],
            ethnic || "Asian"
        )
    );

    formOverlay.appendChild(createLabel("sex", "Sex"));
    formOverlay.appendChild(createSelect("sex", ["Female", "Male"], sex));

    formOverlay.appendChild(createLabel("age", "Age"));
    formOverlay.appendChild(createInput("age", "number", age));

    formOverlay.appendChild(createLabel("skinColor", "Skin Color"));
    formOverlay.appendChild(createInput("skinColor", "text", skinColor || ''));

    formOverlay.appendChild(createLabel("bodyShape", "Body Shape"));
    formOverlay.appendChild(
        createSelect("bodyShape", ["Slim", "Fit", "Curvy"], bodyShape || "Fit")
    );
    // Confirm button
    let confirmButton = createButton(
        "confirmButton",
        "Confirm & Regenerate",
        logFormValues
    );
    formOverlay.appendChild(confirmButton);
    let form = document.createElement("form");
    form.name = "enhanceTryOnForm";
    form.appendChild(formOverlay);

    return form;
}
async function createPopup(imageBase64, sizeChartData, userDimensions) {
    // Create the popup container with a fixed width
    const popupContainer = document.createElement("div");
    popupContainer.id = "my-extension-image-popup";
    popupContainer.style.position = "fixed";
    popupContainer.style.top = "50%";
    popupContainer.style.left = "50%";
    popupContainer.style.transform = "translate(-50%, -50%)";
    popupContainer.style.zIndex = "100000";
    popupContainer.style.backgroundColor = "white";
    popupContainer.style.border = "1px solid black";
    popupContainer.style.borderRadius = "8px";
    popupContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
    popupContainer.style.display = "flex";
    popupContainer.style.flexDirection = "row";
    popupContainer.style.alignItems = "start";
    popupContainer.style.padding = "10px";
    popupContainer.style.width =  "60vw"; // Adjust width as needed
    popupContainer.style.maxHeight = "80vh";
    popupContainer.style.overflow = "auto";

    // Create the image element
    const imageContainerElement = document.createElement("div");
    imageContainerElement.style.position = "relative";
    imageContainerElement.style.maxWidth = "50%"; // Adjust width as needed
    imageContainerElement.style.maxHeight = "100%";
    imageContainerElement.style.borderRadius = "4px";
    imageContainerElement.style.marginRight = "20px";

    const imageElement = document.createElement("img");
    imageElement.src = imageBase64;
    imageElement.style.width = "100%"; // Adjust width as needed
    imageElement.style.height = "100%";
    imageElement.style.borderRadius = "4px";
    imageElement.style.marginRight = "20px";

    imageContainerElement.appendChild(imageElement);
    // Create the size chart container
    const sizeChartContainer = document.createElement("div");
    sizeChartContainer.id = 'tryon-sizeChartContainer'
    sizeChartContainer.style.flexGrow = sizeChartData ? "1" : "0"; // Adjust based on sizeChartData
    sizeChartContainer.style.maxWidth = sizeChartData ? "50%" : "0"; // Adjust max width based on sizeChartData

    if (sizeChartData) {
        // Create the size chart table
        const sizeChartTable = document.createElement("table");
        sizeChartTable.id = "sizeChartTable";
        sizeChartTable.style.width = "100%";
        sizeChartTable.style.marginTop = "25px";
        sizeChartTable.style.borderCollapse = "collapse";

        // Function to reorder keys with 'Size' as the first key
        const reorderKeysWithSizeFirst = (obj) => {
            const { Size, ...rest } = obj;
            return { Size, ...rest };
        };

        // Add headers to the table
        const headerRow = document.createElement("tr");
        const orderedKeys = Object.keys(reorderKeysWithSizeFirst(sizeChartData[0]));
        orderedKeys.forEach((key) => {
            const headerCell = document.createElement("th");
            headerCell.textContent = key;
            headerCell.style.border = "1px solid black";
            headerCell.style.padding = "5px";
            headerCell.style.color = "#000";
            headerCell.style.fontFamily = "sans-serif";
            headerRow.appendChild(headerCell);
        });
        sizeChartTable.appendChild(headerRow);

        // Add data to the table
        sizeChartData.forEach((item) => {
            const dataRow = document.createElement("tr");
            const orderedItem = reorderKeysWithSizeFirst(item);
            Object.values(orderedItem).forEach((value) => {
                const dataCell = document.createElement("td");
                dataCell.textContent = value;
                dataCell.style.border = "1px solid black";
                dataCell.style.padding = "5px";
                dataCell.style.color = "#000";
                dataCell.style.fontFamily = "sans-serif";
                dataCell.style.textTransform = "none";
                dataRow.appendChild(dataCell);
            });
            sizeChartTable.appendChild(dataRow);
        });
        // Append the size chart table to its container
        sizeChartContainer.appendChild(sizeChartTable);
    } else {
        // Fallback message when size chart is not available
        const fallbackMessage = document.createElement("p");
        fallbackMessage.textContent =
            "We don't have a size chart for this apparel on file. Try taking a screenshot of the size chart and see our size recommendation.";
        //sizeChartContainer.appendChild(fallbackMessage);
        imageElement.style.maxWidth = "100%"; // Use more space for the image when there is no size chart
    }
    // Append the image and close button to the popup
    if (imageBase64) {
        popupContainer.appendChild(imageContainerElement);
    }
    // Append the size chart container to the popup
    popupContainer.appendChild(sizeChartContainer);

    // Create a close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.fontFamily = "sans-serif";
    closeButton.style.color = "#000";
    closeButton.style.textTransform = "none";

    closeButton.onclick = function () {
        document.body.removeChild(popupContainer);
    };
    closeButton.className = "closeButton_faishion";
    closeButton.style.position = "absolute";

    closeButton.style.top = "10px";
    closeButton.style.right = "10px";

    // Append the close button to the popup
    popupContainer.appendChild(closeButton);

    // enhance button
    const enhanceButton = document.createElement("button");
    enhanceButton.textContent = "Enhance Try-On";
    enhanceButton.style.fontFamily = "sans-serif";
    enhanceButton.style.color = "#000";
    enhanceButton.style.textTransform = "none";

    enhanceButton.onclick = async function () {
        // 创新一个新的弹窗
        const enhancePopupContainer = document.createElement("div");
        enhancePopupContainer.className = "my-extension-image-popup-enhance";

        let closeButton = document.createElement("div");
        closeButton.textContent = "Close";
        closeButton.className = "enhance-close-button";
        // 点击时关闭弹窗
        closeButton.onclick = function () {
            imageContainerElement.removeChild(enhancePopupContainer);
        };

        enhancePopupContainer.appendChild(closeButton);
        const enhanceTryOnData = await getStorageData("enhanceTryOnData");
        console.log(enhanceTryOnData, "!!!!!!");
        const { ethnic, sex, age, skinColor, bodyShape } = enhanceTryOnData || {};
        console.log(
            ethnic,
            sex,
            age,
            skinColor,
            bodyShape,
            "enhanceTryOnDataInit!!!!"
        );
        const node = await createFormOverlay(enhanceTryOnData);
        enhancePopupContainer.appendChild(node);

        console.log("enhance button clicked", enhancePopupContainer);
        imageContainerElement.appendChild(enhancePopupContainer);
        // makeDraggable(enhancePopupContainer);
    };
    enhanceButton.className = "enhanceButton_faishion";
    enhanceButton.style.position = "absolute";

    enhanceButton.style.top = "10px";
    enhanceButton.style.left = "10px";

    // Append the close button to the popup
    if (imageBase64) {
        popupContainer.appendChild(enhanceButton);
    }

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
        if (sizeStr.includes("½")) {
            return parseFloat(sizeStr.replace("½", "")) + 0.5;
        } else {
            return parseFloat(sizeStr);
        }
    }

    const parts = rangeStr.split(" - ").map(convertFractionalSize);

    if (parts.length === 1) {
        // No range, just a single value
        return { min: parts[0], max: parts[0] };
    } else {
        // A range of values
        return { min: Math.min(...parts), max: Math.max(...parts) };
    }
}

function highlightUserDimensions(userDimensions) {
    const rows = document.querySelectorAll(
        "#sizeChartTable tr:not(:first-child)"
    );

    // Track the closest cell for each dimension
    let closestCells = {
        bust: { cell: null, distance: Infinity },
        hips: { cell: null, distance: Infinity },
        waist: { cell: null, distance: Infinity },
    };

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        const headers = document.querySelectorAll("#sizeChartTable th");

        cells.forEach((cell, index) => {
            const headerText = headers[index].textContent
                .trim()
                .replace(/\s+/g, "")
                .toLowerCase();
            let userDimensionKey = null;

            // Identify the dimension
            if (headerText === "bust" || headerText === "chest") {
                userDimensionKey = "bust";
            } else if (headerText === "hips" || headerText === "hip") {
                userDimensionKey = "hips";
            } else if (headerText === "waist") {
                userDimensionKey = "waist";
            }

            if (userDimensionKey && userDimensions[userDimensionKey] !== undefined) {
                const cellDimensionRange = parseDimensionRange(cell.textContent.trim());
                const userDimensionValue = parseFloat(userDimensions[userDimensionKey]);

                // Check if the user dimension is within the range
                if (
                    userDimensionValue >= cellDimensionRange.min &&
                    userDimensionValue <= cellDimensionRange.max
                ) {
                    // If there's an exact match, highlight immediately and stop looking for this dimension
                    closestCells[userDimensionKey].cell = cell;
                    closestCells[userDimensionKey].distance = 0;
                    cell.classList.add("highlight");
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
    Object.keys(closestCells).forEach((dimension) => {
        const { cell, distance } = closestCells[dimension];
        if (cell && distance !== 0) {
            cell.classList.add("highlight");
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showLoading") {
        showLoadingPopup("Generating Virtual Try-On, Please Wait...");
    } else if (message.action === "replaceImage") {
        // hideLoadingPopup();

        fetchAndRenderSizeChart(
            message.productUrl,
            message.pageTitle,
            message.srcUrl,
            message.pageTitle
        ).then((sizeChartData) => {
            createPopup(
                message.newImageBase64,
                sizeChartData,
                message.userDimensions
            );
        });
        rightClickedElement = null; // Reset the right-clicked element
    } else if (message.action === "getRecommendations") {
        // createOverlay(true, message.userDimensions);
        fetchRecommendations(
            message.userDimensions,
            message.base64ScreenShot,
            message.tabUrl
        );
    } else if (message.action === "createOverlay") {
        createOverlay(false);
    } else if (message.action === "processCapturedImage") {
        cropImage(
            message.dataUrl,
            message.selection,
            message.isSizeChart,
            message.userDimensions,
            message.tabUrl
        );
    } else if (message.action === "showHelpfulVids") {
    }
});

function cropImage(dataUrl, selection, isSizeChart, userDimensions, tabUrl) {
    const pixelRatio = window.devicePixelRatio || 1;
    const scaleFactor = 0.5; // Reduce the image size to 50% of the original
    const img = new Image();
    img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Apply the scale factor to the canvas dimensions
        canvas.width = selection.width * pixelRatio * scaleFactor;
        canvas.height = selection.height * pixelRatio * scaleFactor;

        ctx.drawImage(
            img,
            selection.x * pixelRatio, // Source X
            selection.y * pixelRatio, // Source Y
            selection.width * pixelRatio, // Source Width
            selection.height * pixelRatio, // Source Height
            0, // Destination X
            0, // Destination Y
            selection.width * pixelRatio * scaleFactor, // Destination Width
            selection.height * pixelRatio * scaleFactor // Destination Height
        );
        const croppedDataUrl = canvas.toDataURL("image/png");
        if (isSizeChart) {
            fetchRecommendations(userDimensions, croppedDataUrl, tabUrl);
        } else {
            chrome.runtime.sendMessage({
                action: "finishedCrop",
                croppedDataUrl: croppedDataUrl,
            });
        }
    };
    img.src = dataUrl;
}

function fetchRecommendations(bodyMeasurements, base64ScreenShot, tabUrl) {
    showLoadingPopup("Generating size recommendation for you...");
    const apiUrl = "https://api.tianlong.co.uk/get-size-recommendation";

    // Prepare the data to be sent in the POST request
    const postData = {
        base64_image: base64ScreenShot,
        body_measurements: bodyMeasurements,
        showing_chart: true,
        tabUrl: tabUrl,
    };

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            createPopup(null, data, bodyMeasurements);
        })
        .catch((error) => console.error("Error:", error))
        .finally(() => {
            hideLoadingPopup(); // Hide the loading popup regardless of the outcome
        });
}

function fetchAndRenderSizeChart(currentUrl, pageTitle, srcUrl, pageTitle) {
    // showLoadingPopup('Generating size recommendation for you...');
    const apiUrl = "https://api.tianlong.co.uk/get-size-guide";

    // Prepare the data to be sent in the POST request
    const postData = {
        category_id: "bottoms-women",
        product_url: currentUrl,
        page_title: pageTitle,
        img_src_url: srcUrl,
        page_title: pageTitle,
    };

    return fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status === 404) {
                    console.log("Size guide not found");
                    return null; // Return null to indicate no data
                }
                console.log("Failed to get size guide");
                return null;
            }
            return response.json();
        })
        .then((data) => {
            // This data will now be used in createPopup
            console.log(data);
            return data;
        })
        .catch((error) => {
            console.error("Error:", error);
            return null; // Return null to indicate an error
        })
        .finally(() => {
            hideLoadingPopup(); // Hide the loading popup regardless of the outcome
        });
}

function showLoadingPopup(loadingText) {
    const loadingPopup = document.createElement("div");
    loadingPopup.id = "my-extension-loading-popup";
    loadingPopup.style.position = "fixed";
    loadingPopup.style.top = "50%";
    loadingPopup.style.left = "50%";
    loadingPopup.style.transform = "translate(-50%, -50%)";
    loadingPopup.style.zIndex = "10000000";
    loadingPopup.style.padding = "20px";
    loadingPopup.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    loadingPopup.style.borderRadius = "8px";
    loadingPopup.style.display = "flex";
    loadingPopup.style.justifyContent = "center";
    loadingPopup.style.alignItems = "center";
    loadingPopup.style.flexDirection = "column";
    loadingPopup.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";

    // Spinner container to center text inside the spinner
    const spinnerContainer = document.createElement("div");
    spinnerContainer.style.position = "relative";
    spinnerContainer.style.width = "50px"; // Match spinner size
    spinnerContainer.style.height = "50px"; // Match spinner size

    const spinner = document.createElement("div");
    spinner.style.border = "5px solid #f3f3f3";
    spinner.style.borderTop = "5px solid #3498db";
    spinner.style.borderRadius = "50%";
    spinner.style.width = "40px";
    spinner.style.boxSizing = "content-box";
    spinner.style.height = "40px";
    spinner.style.animation = "spin 1s linear infinite";

    // Create a div for the progress text
    const progressText = document.createElement("div");
    progressText.style.position = "absolute"; // Position text over spinner
    progressText.style.top = "50%"; // Position text over spinner
    progressText.style.left = "50%"; // Position text over spinner
    progressText.style.transform = "translate(-50%,-50%)"; // Position text over spinner
    progressText.textContent = "0%"; // Initial progress
    progressText.style.fontWeight = "bold";
    progressText.style.color = "#000";

    const spinnerText = document.createElement("div");
    spinnerText.textContent = loadingText;

    spinnerText.style.marginTop = "10px";
    spinnerText.style.textTransform = "none";
    spinnerText.style.color = "#000";
    spinnerText.style.fontFamily = "sans-serif";

    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(progressText); // Add progress text inside the spinner container

    loadingPopup.appendChild(spinnerContainer); // Add spinner container to the popup
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

    // Simulate progress update
    const intervalId = setInterval(() => {
        progress += 1;
        progressText.textContent = `${progress}%`;

        if (progress >= 99) {
            clearInterval(intervalId);
        }
    }, (10 * 1000) / 100); // Adjust the timing as needed
}

// Function to hide the loading popup
function hideLoadingPopup() {
    progress = 99;
    const loadingPopup = document.getElementById("my-extension-loading-popup");
    if (loadingPopup) {
        setTimeout(() => {
            document.body.removeChild(loadingPopup);
            progress = 0;
        }, 250);
    }
}

function createOverlay(isSizeChart, userDimensions) {
    console.log("creating overlay");
    selectionBox = null;
    isSelecting = true;

    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.cursor = "crosshair";
    overlay.style.zIndex = "99999999";
    overlay.style.clipPath = "inset(0)"; // Initially no clipping
    document.body.appendChild(overlay);

    overlay.addEventListener("mousedown", startSelection);
    overlay.addEventListener("mousemove", resizeSelection);
    overlay.addEventListener("mouseup", function (event) {
        endSelection(event, isSizeChart, userDimensions);
    });
    document.addEventListener("keydown", cancelSelection); // Add keydown listener
}

function cancelSelection(event) {
    if (event.key === "Escape") {
        overlay.remove();
        isSelecting = false;
        selectionBox = null;
        document.removeEventListener("keydown", cancelSelection); // Remove the listener
    }
}

function startSelection(event) {
    startX = event.clientX;
    startY = event.clientY;
    selectionBox = document.createElement("div");
    selectionBox.style.position = "absolute";
    selectionBox.style.border = "2px solid red";
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
    console.log(isSizeChart);
    if (selectionBox) {
        overlay.removeEventListener("mousedown", startSelection);
        overlay.removeEventListener("mousemove", resizeSelection);
        overlay.removeEventListener("mouseup", endSelection);

        const selectionCoordinates = {
            x: parseInt(selectionBox.style.left, 10),
            y: parseInt(selectionBox.style.top, 10),
            width: parseInt(selectionBox.style.width, 10),
            height: parseInt(selectionBox.style.height, 10),
        };

        chrome.runtime.sendMessage({
            action: "captureSelectedArea",
            coordinates: selectionCoordinates,
            isSizeChart: isSizeChart,
            userDimensions: userDimensions,
        });
        // Clean up
        overlay.remove();
        isSelecting = false;
    }
}

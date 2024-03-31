   // 检查页面中是否已经出现了弹窗, 如果出现了不再重复弹出;
   var existingElement = document.getElementById("vidsPopupContent");
   if (!existingElement) {
       showHelpfulVidsPopup();
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
                <p>All-In-One RightClick Solution</p>
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
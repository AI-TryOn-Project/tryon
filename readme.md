# Installation
You can test the extention in your own browser, just go to ```chrome://extensions/``` in chrome and click ```Load Unpacked``` to load the entire folder.

If you want to test the login function, either tell Tianlong the extention ID Chrome generated for you(e.g. ommjpdpphbobbcnjkfdmfekajmhdiijf), or create your own auth0 account and app then configure `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` in the code.

The current code needs refactoring, would appreciate if you can refactor the code as you go. (e.g. break big file to smaller chunks)

Chrome extention has some limitations on what you can do, so you can see background.js and content.js communicate with each other by sending messages. 

To use the extention, click the extention icon, then upload a picture with one human face and configre your body dimensions.

The extension has following functions:
1. When right click, parse the image url then generate virtual tryon and call backend to get size chart.
2. Match body dimension with size chart and highlight. (currently has some bugs)
3. Make the screenshot of the entire screen, and try to find sizechart and visulize
4. When image url is not available, a dragging UI will appear allow you to take a screenshot for virtual tryon. 



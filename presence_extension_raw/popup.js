const socket = io("http://localhost:5000");
console.log(chrome);

chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
});

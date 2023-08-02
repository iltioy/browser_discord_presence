const socket = io("http://localhost:5000");
console.log(chrome);

chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
});

console.log(socket);

console.log(
    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
        console.log(tab);
    })
);

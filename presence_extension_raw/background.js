chrome.tabs.onActivated.addListener(async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    const tab = tabs[0];
    console.log(tab);

    const res = await fetch("http://localhost:5000/check", {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",

        body: JSON.stringify(tab),
    });

    console.log(res);
});

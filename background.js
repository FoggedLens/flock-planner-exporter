const camerasRegex = /^https:\/\/beefeater\.flocksafety\.com\/api\/v1\/public\/deployments\/[a-z0-9-]+$/;

let fetchedData = null;

hasRunForURL = new Set();

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.webRequest.onCompleted.addListener(
  (details) => {

    if (camerasRegex.test(details.url) && details.method === 'GET') {
      if (hasRunForURL.has(details.url))
      return;

      hasRunForURL.add(details.url);

      // Fetch the response body using the same method and headers
      fetch(details.url, {
      method: details.method,
      headers: new Headers(details.requestHeaders)
      })
      .then(response => response.json())
      .then(data => {
        console.log("Data received for URL: ", details.url);
        console.log("tabId", details.tabId);
        fetchedData = data?.resolvedCameras;
        chrome.tabs.sendMessage(details.tabId, { action: 'dataFetched', data: fetchedData, agencyName: data?.name });
      })
      .catch(console.error)
      .finally(() => {
        hasRunForURL.delete(details.url);
      });
    }
  },
  { urls: ['*://beefeater.flocksafety.com/api/v1/public/deployments/*'] },
  ['responseHeaders', 'extraHeaders']
);


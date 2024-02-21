/**** onInstalled 이벤트 리스너 ****/
//chrome.runtime.onInstalled.addListener(() => {});

/**** storage.onChanged 이벤트 리스너 ****/
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];

    console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);

    if (key.includes('mark')) {
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, 'refresh');
        });
      });
    }

    switch (key) {
      // 유튜브 영상 변경사항
      case "mark_youvid":
        chrome.storage.sync.get(['mark_youvid'], function (result) {
          mark_youvid = result['mark_youvid']
        })
        break
    }
  }
});

/**** tabs.onUpdated 이벤트 리스너 ****/
chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
    let id = tabId
    let url = new URL(tab.url)

    if (changeInfo.status == "complete" && url.hostname.includes("www.youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: id },
        files: ["contentscripts/youtubeOnBrowse.js",
                "contentscripts/youtubeOnWatch.js",
                "contentscripts/youtubeOnResults.js"]
      })
    }

    if (changeInfo.status == "complete" && url.hostname.includes("www.netflix.com")) {
      chrome.scripting.executeScript({
        target: { tabId: id },
        files: ["contentscripts/netflix.js"]
      })
    }
  }
);

/**** onStartup 이벤트 리스너 ****/
//chrome.runtime.onStartup.addListener()

/**** onMessage 이벤트 리스너 ****/
//chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {});


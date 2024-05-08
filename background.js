import {initCache, refreshCache, setCache}  from "./api/client.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['mark_youvid', 'mark_netflix', 'mark_watcha', 'selectedIndex',], function(result){
    if(!result['mark_youvid']){
      chrome.storage.sync.set({mark_youvid : []})
      .then(()=>{
        const query = initCache()
        query(refreshCache, setCache)
      })
    }
    if(!result['mark_netflix']){
      chrome.storage.sync.set({mark_netflix : []})
      chrome.storage.sync.set({mark_netflix_data : []})
    }
    if(!result['mark_watcha']){
      chrome.storage.sync.set({mark_watcha : []})
      chrome.storage.sync.set({mark_watcha_data : []})
    }
    if(!result['selectedIndex']){
      chrome.storage.sync.set({selectedIndex : 0})
    }
  })
});

//@params
/*
  changes: {
    key : {
      newValue: ...
      oldValue: ...
    }
  }

  namespace : string
*/
chrome.storage.onChanged.addListener(function (changes, namespace) {

  for (var key in changes) {
    var storageChange = changes[key];

    console.log(
      key,
      storageChange.newValue
    );

    if (key.includes('mark')) {
      chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, 'refresh');
        });
      });

      chrome.storage.sync.get(['cache']).then(storage =>{
        chrome.storage.sync.set({cache : {...storage.cache, isStaled:true}});
      })
    }

    switch (key) {
      case 'cache' :
        if(storageChange.newValue.isStaled){
          // 매 호출마다 initCache()를 해줘야 합니다.
          const query = initCache(storageChange.newValue)
          query(refreshCache, setCache)
        }
        break;
    }
  }
});

/*
  @params

  tabId : number
  changeInfo : {
    status : string,
  }
  tab:{
    ...
    url : string
  }
*/
chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
    let id = tabId
    let url = new URL(tab.url)

    if (changeInfo.status == "complete" && url.hostname.includes("www.youtube.com")) {
      chrome.scripting.executeScript({
        target: { tabId: id },
        files: ["contentscripts/youtube.js"]
      })
    }

    if (changeInfo.status == "complete" && url.hostname.includes("www.netflix.com")) {
      chrome.scripting.executeScript({
        target: { tabId: id },
        files: ["contentscripts/netflix.js"]
      })
    }

    if (changeInfo.status == "complete" && url.hostname.includes("watcha.com")) {
      chrome.scripting.executeScript({
        target: { tabId: id },
        files: ["contentscripts/watcha.js"]
      })
    }
  }
);


chrome.runtime.onStartup.addListener(async ()=>{
  const storage = await chrome.storage.sync.get(['cache'])
  const query = initCache(storage.cache)
  query(refreshCache,setCache)
});

//chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {});


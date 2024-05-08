import {initCache, refreshCache, setCache}  from "./api/client.js";
/**** onInstalled 이벤트 리스너 ****/
/*
  크롬 확장프로그램 설치 시에 chrome.storage.sync 초기화
*/
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

/**** storage.onChanged 이벤트 리스너 ****/
/*

*/
chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];

    console.log('::: Storage 변경사항 ::: DATA: "%s" , NAMESPACE: "%s" 변경' +
      '이전 값: "%s", 변경된 값: "%s".',
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

      chrome.storage.sync.get(['cache']).then(storage =>{
        chrome.storage.sync.set({cache : {...storage.cache, isStaled:true}});
      })
    }

    switch (key) {
      
      // 사용자 데이터는 https 를 통한 전송만 허용하기 때문에
      // 서버에 데이터를 전송하지 않는 것으로 바꾸면서 삭제한 부분.
      // case "mark_youvid":
      // break

      case 'cache' :
        if(storageChange.newValue.isStaled){
          const query = initCache(0, storageChange.newValue)
          query(refreshCache, setCache)
        }
        break;
    }
  }
});

/**** tabs.onUpdated 이벤트 리스너 ****/
chrome.tabs.onUpdated.addListener(
  function (tabId, changeInfo, tab) {
    let id = tabId
    let url = new URL(tab.url)
    // chrome.tabs.query({}, tabs => {
    //   tabs.forEach(tab => {
    //     chrome.tabs.sendMessage(tab.id, 'refresh');
    //   });
    // });

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
  const result = await chrome.storage.sync.get(['cache'])
  console.log(result.cache)
  const query = initCache(result.cache)
  query(refreshCache,setCache)
});

// 필요할 경우 추가할 부분
/**** onMessage 이벤트 리스너 ****/
//chrome.runtime.onMessage.addListener(function (message, sender, senderResponse) {});


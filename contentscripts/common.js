console.log("common.js")

/** 공통 함수 및 변수 **/

// containers list

youtubeContainersList = [];
youtubeResultContainersList = [];  
youtubeWatchContainersList = [];
youtubeRefreshContainersList = [];
youtubeErrList = []
//youtubeShortsContainers = []
//youtubeMixContainers = []

/************************************************************************************************/
function waitForElement(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }
  
      const observer = new MutationObserver(() => {
        if (document.querySelector(selector)) {
          resolve(document.querySelector(selector));
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        subtree: true,
        childList: true,
      });
    });
}

function waitForHref(selector) {
    return new Promise(resolve => {
      if (document.querySelector(selector).href) {
        return resolve(document.querySelector(selector).href);
      }
  
      const observer = new MutationObserver(() => {
        if (document.querySelector(selector).href) {
          resolve(document.querySelector(selector).href);
          observer.disconnect();
        }
      });
       
      observer.observe(document.body, {
        subtree: true,
        childList: true,
      });
    });
}


/*** Youtube video Storage Add/Delete ***/

function addYouvidMarked(youvidid){
  chrome.storage.sync.get(['mark_youvid'], function(result){
      mark_youvid = result['mark_youvid']
      if(mark_youvid === undefined){
        mark_youvid = []
      }
      mark_youvid.push(youvidid)
      chrome.storage.sync.set({mark_youvid : mark_youvid})
  })
}

function deleteYouvidMarked(index){
  chrome.storage.sync.get(['mark_youvid'], function(result){
      mark_youvid = result['mark_youvid']
      mark_youvid.splice(index,1)
      chrome.storage.sync.set({mark_youvid : mark_youvid})
  })
}

/***** Netflix Content Storage Add/Delete *******/
function addNetflixMarked(id, imgUrl, title, watchUrl){

  content = {
    'imgUrl' : imgUrl,
    'title' : title,
    'watchUrl' : watchUrl
  }

  chrome.storage.sync.get(['mark_netflix', 'mark_netflix_data'], function(result){
    mark_netflix = result['mark_netflix']
    mark_netflix_data = result['mark_netflix_data']

    if(mark_netflix === undefined){
      mark_netflix = []
    }
    if(mark_netflix_data === undefined){
      mark_netflix_data = []
    }

    mark_netflix.push(id)
    mark_netflix_data.push(content)

    chrome.storage.sync.set({
      mark_netflix : mark_netflix,
      mark_netflix_data : mark_netflix_data
    })
  })
}

function deleteNetflixMarked(id){
  chrome.storage.sync.get(['mark_netflix'], function(result){
      mark_netflix = result['mark_netflix']
      for(i in arr){
        if(arr[i].id === id){
          mark_netflix.splice(i,1)
          mark_netflix_data.splice(i,1)
          chrome.storage.sync.set({
            mark_netflix : mark_netflix,
            mark_netflix_data : mark_netflix_data
          })
        }
      }
  })
}

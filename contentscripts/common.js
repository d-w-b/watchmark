console.log("common.js")
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


/*** Youtube Content Storage Add/Delete ***/

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

function addWatchaMarked(id, imgUrl, title, watchUrl){

  content = {
    'imgUrl' : imgUrl,
    'title' : title,
    'watchUrl' : watchUrl
  }
  console.log(content)

  chrome.storage.sync.get(['mark_watcha', 'mark_watcha_data'], function(result){
    mark_watcha = result['mark_watcha']
    mark_watcha_data = result['mark_watcha_data']

    if(mark_watcha === undefined){
      mark_watcha = []
    }
    if(mark_watcha_data === undefined){
      mark_watcha_data = []
    }

    mark_watcha.push(id)
    mark_watcha_data.push(content)

    chrome.storage.sync.set({
      mark_watcha : mark_watcha,
      mark_watcha_data : mark_watcha_data
    })
  })
}

function deleteWatchaMarked(index){
  console.log(index)
  chrome.storage.sync.get(['mark_watcha', 'mark_watcha_data'], function(result){
    mark_watcha = result['mark_watcha']
    mark_watcha_data = result['mark_watcha_data']
    
    mark_watcha.splice(index,1)
    mark_watcha_data.splice(index,1)

    chrome.storage.sync.set({
      mark_watcha : mark_watcha,
      mark_watcha_data : mark_watcha_data
    })
  })
}


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
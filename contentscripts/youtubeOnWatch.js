// btn-mark 클릭 이벤트
function youtubeWatchOnClickMarkHandler(e){
    vid = window.location.href.split('=')[1]
    chrome.storage.sync.get(['mark_youvid'], function(result){
        mark_youvid = result['mark_youvid']
        if (mark_youvid.includes(vid)){
            // 이미 추가된 콘텐트라면
            del = mark_youvid.indexOf(vid)
            deleteYouvidMarked(del)
            e.target.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }else{
            // 아직 추가되지 않은 콘텐트라면
            addYouvidMarked(vid)
            e.target.src = chrome.runtime.getURL("/images/check.png")
        } 
    })
}

// btn-mark 마우스 오버 이벤트
function youtubeWatchOnMouseOverHandler(e){
    e.target.style.boxShadow = "0 0 0 4px #a7a7a7 inset"
}


// btn-mark 마우스 아웃 이벤트
function youtubeWatchOnMouseOutHandler(e){
    e.target.style.boxShadow = "none"
}



// Refresh UI
function youtubeOnWatchRefresh(){
    // url 에 /watch 가 포함되었는지 확인 후 refresh
    if(!window.location.href.includes('watch')){
        let container = document.body.querySelector('div#owner.item.style-scope.ytd-watch-metadata')
        if(container.querySelector('a.yt-simple-endpoint.style-scope.ytd-video-owner-renderer').href.split('/')[3].includes('@')){
            channelName= container.querySelector('a.yt-simple-endpoint.style-scope.ytd-video-owner-renderer').href.split('/')[3].slice(1,)
        }else{
            channelName= container.querySelector('a.yt-simple-endpoint.style-scope.ytd-video-owner-renderer').href.split('/')[3]
        }
        let vid = window.location.href.split('=')[1]   
    
        chrome.storage.sync.get(['mark_youvid'], function(result){
            mark_youvid = result['mark_youvid']
    
            if(mark_youvid.includes(vid)){
                btnImg = container.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('/images/check.png')
            }else{
                btnImg = container.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('/images/plus-sign2.png')
            }
        })
    }
}


chrome.runtime.onMessage.addListener(msg => {
    if(msg === "refresh" && window.location.href.includes('watch')){
        console.log("youtube on watch refresh")
        youtubeOnWatchRefresh()
    }
});

function youtubeWatchRecognizeContainer(){
    container = document.body.querySelector('div#owner.item.style-scope.ytd-watch-metadata')
    if(container.querySelector('a.yt-simple-endpoint.style-scope.ytd-video-owner-renderer')?.href.split('/')[3].includes('@')){
        channelName= container.querySelector('a.yt-simple-endpoint.style-scope.ytd-video-owner-renderer')?.href.split('/')[3].slice(1,)
    }else{
        channelName= container.querySelector('a.yt-simple-endpoint.style-scope.ytd-video-owner-renderer')?.href.split('/')[3]
    }
    vid = window.location.href.split('=')[1]

    if(!youtubeWatchContainersList.includes(container) && channelName && vid){

        // 영상 추가 버튼 생성+-
        BtnMarkInner = document.createElement("img");
    
        chrome.storage.sync.get(['mark_youvid'], function(result){
            mark_youvid = result['mark_youvid']
            if( mark_youvid.includes(vid) ){
                // 이미 추가된 항목이라면 체크 표시
                BtnMarkInner.src = chrome.runtime.getURL("/images/check.png")
            }else{
                //아직 추가되지 않은 항목이라면 추가 표시
                BtnMarkInner.src = chrome.runtime.getURL("/images/plus-sign2.png")
            }
        })
    
        // 버튼 스타일링
        BtnMarkInner.style.transition = "all 0.5s"
        BtnMarkInner.style.borderRadius = "18px"
    
        const BtnMark = document.createElement('button');
        BtnMark.classList.add("btn-mark");
        BtnMark.style.position = "absolute";
        BtnMark.style.right = "0px";
        BtnMark.style.top = "-7px";
        BtnMark.style.background = "none";
        BtnMark.style.border = "none"
        BtnMark.style.zIndex = 9999;
        BtnMark.style.cursor = "pointer"
    
        BtnMarkInner.addEventListener('mouseover', youtubeWatchOnMouseOverHandler, false);
        BtnMarkInner.addEventListener('mouseout', youtubeWatchOnMouseOutHandler, false);
        BtnMark.addEventListener('click', youtubeWatchOnClickMarkHandler, false);
    
        BtnMark.appendChild(BtnMarkInner)
        container.appendChild(BtnMark)
    
        youtubeWatchContainersList.push(container)
    }    
    
}
function youtubeBrowseMutationHandler(mutationList, observer) {
    if(!window.location.href.includes('watch')){ observer.disconnect() }
    else{youtubeWatchRecognizeContainer();}
}

/***********************************************************************************************************************/
/* Config */
observerConfig={
    childList : true,
    subtree: true
}

waitForElement('div#columns').then((mountPoint)=>{
    observer = new MutationObserver(youtubeBrowseMutationHandler);
    observer.observe(mountPoint, observerConfig);
})




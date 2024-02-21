console.log("youtube on results")

/* Config */
observerConfig={
    childList : true,
    subtree: true
}

/* 버튼 추가 함수 */ 
// 유튜브 영상 추가 버튼
function youtubeResultCreateBtnMarkElement(node, vid){
    const BtnInner = document.createElement("img");
    chrome.storage.sync.get(['mark_youvid'], function(result){

        mark_youvid = result['mark_youvid']
        if( mark_youvid.includes(vid) ){
            // 이미 추가된 항목이라면 체크 표시
            BtnInner.src = chrome.runtime.getURL("/images/check.png")
        }else{
            //아직 추가되지 않은 항목이라면 추가 표시
            BtnInner.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }
    })

    // 버튼 스타일링
    BtnInner.style.transition = "all 0.5s"
    BtnInner.style.borderRadius = "18px"

    const BtnMark = document.createElement('button');
    BtnMark.classList.add('btn-mark')
    BtnMark.style.position = "absolute";
    BtnMark.style.right = "32px"
    BtnMark.style.top = "-7px"
    BtnMark.style.background = "none";
    BtnMark.style.border = "none"
    BtnMark.style.zIndex = 10;
    BtnMark.style.cursor = "pointer"

    BtnInner.addEventListener('mouseover', youtubeResultOnMouseOverHandler, false);
    BtnInner.addEventListener('mouseout', youtubeResultOnMouseOutHandler, false);
    BtnMark.addEventListener('click', youtubeResultOnClickMarkHandler, false);
    
    BtnMark.appendChild(BtnInner)
    node.appendChild(BtnMark)
}

/* 버튼 이벤트 핸들러 */

//클릭 이벤트
function youtubeResultOnClickMarkHandler(e){
    thumbnail = e.target.closest('#dismissible').querySelector("a#thumbnail")
    url = thumbnail?.href
    if(url){
        // 쇼츠를 제외한 영상만 처리
        if(!url.includes("shorts")){
            vid = url.split('/')[3].split('=')[1].slice(0,-3)
        }
    }
    chrome.storage.sync.get(['mark_youvid'], function(result){
        mark_youvid = result['mark_youvid']
        if (mark_youvid.includes(vid)){
            // 이미 추가된 콘텐트라면
            idx = mark_youvid.indexOf(vid)
            deleteYouvidMarked(idx)
            e.target.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }else{
            // 아직 추가되지 않은 콘텐트라면
            addYouvidMarked(vid)
            e.target.src = chrome.runtime.getURL("/images/check.png")
        } 
    })
}


// 마우스 오버 이벤트
function youtubeResultOnMouseOverHandler(e){
    e.target.style.boxShadow = "0 0 0 4px #a7a7a7 inset"
}


// 마우스 아웃 이벤트
function youtubeResultOnMouseOutHandler(e){
    e.target.style.boxShadow = "none"
}


/* 컨테이너 DOM Recognition */
function youtubeResultRecognizeContainers() {
    cards = document.querySelectorAll('div#dismissible.style-scope.ytd-video-renderer');
    // 각 container 별로 버튼 추가 및 배열에 저장
    for (c of cards){
        if (!youtubeResultContainersList.includes(c)){
            thumbnail = c.querySelector('a#thumbnail')
            url = thumbnail?.href
            if(c.querySelector('a#channel-thumbnail')?.href.includes('@')){
                channelName = c.querySelector('a#channel-thumbnail')?.href.split('@')[1]
            }else{
                channelName = c.querySelector('a#channel-thumbnail')?.href.split('/')[4]
            }
            
            if(!url.includes("shorts") && channelName ){
                vid = url.split('/')[3].split('=')[1].slice(0,-3)
                youtubeResultCreateBtnMarkElement(c, vid)
                youtubeResultContainersList.push(c)
            }
        }
    }
}

function youtubeOnResultRefresh(){
    //onResult 화면의 카드의 알림 버튼 업데이트
    //url 에 /result 가 포함되어있는지 확인 후 refresh
    if(!window.location.href.includes('/result')){
        chrome.storage.sync.get(['mark_youvid'], function(result){
            mark_youvid = result['mark_youvid']
            
            for(c of youtubeResultContainersList){
                channelUrl = c.querySelector("a#channel-thumbnail").href
                if(channelUrl.split('/')[3].includes('@')){
                    channelName= channelUrl.split('/')[3].slice(1,)
                }else{
                    channelName= channelUrl.split('/')[4]
                }
                vid = c.querySelector('a#thumbnail').href.split('/')[3].split('=')[1].slice(0,-3)
                if(mark_youvid.includes(vid)){
                    btnImg = c.querySelector('button.btn-mark > img')
                    btnImg.src = chrome.runtime.getURL('/images/check.png')
                }else{
                    btnImg = c.querySelector('button.btn-mark > img')
                    btnImg.src = chrome.runtime.getURL('/images/plus-sign2.png')
                }
            }
        })
    }
}

// mutationObserver 이벤트 핸들러
function youtubeResultMutationHandler(mutationList, observer) {
    let u = new URL(window.location.href)
    if(u.pathname !== '/results' || u.host !== "www.youtube.com"){ observer.disconnect() }
    else{
        youtubeResultRecognizeContainers();
        //youtubeOnResultRefresh()
    }
}

/***********************************************************************************************************************/
chrome.runtime.onMessage.addListener(msg => {
    if(msg === "refresh"){
        youtubeOnResultRefresh()
    }
});
appMountPoint = document.querySelector('div#content');
observer = new MutationObserver(youtubeResultMutationHandler);
observer.observe(appMountPoint, observerConfig)
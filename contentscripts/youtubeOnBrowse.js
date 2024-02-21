/** 유튜브 Browse 페이지 크롬 확장 프로그램 스크립트 **/
console.log('youtube.com/')

/* 버튼 추가 함수 */ 
// 유튜브 영상 추가 버튼
function youtubeBrowseCreateBtnMark(node, vid){
    const BtnInner = document.createElement("img");
    chrome.storage.sync.get(['mark_youvid'], function(result){
        //storage.sync process
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
    BtnMark.classList.add("btn-mark");
    BtnMark.style.position = "absolute";
    BtnMark.style.top = "-50px"
    BtnMark.style.right = "0px"
    BtnMark.style.background = "none";
    BtnMark.style.border = "none"
    BtnMark.style.zIndex = 999;
    BtnMark.style.cursor = "pointer"
    
    BtnInner.addEventListener('mouseover', youtubeBrowseOnMouseOverHandler, false);
    BtnInner.addEventListener('mouseout', youtubeBrowseOnMouseOutHandler, false);
    BtnMark.addEventListener('click', youtubeBrowseOnClickMarkHandler, false);
    
    BtnMark.appendChild(BtnInner)
    node.parentNode.querySelector('div#details').appendChild(BtnMark)
    
}

/* 버튼 이벤트 핸들러 */
//btn-mark 클릭 이벤트
function youtubeBrowseOnClickMarkHandler(e){
    console.log( e.target.closest('#details') )
    thumbnail = e.target.closest('#details').querySelector("a#video-title-link")
    vid = thumbnail?.href.split('/')[3].split('=')[1]
    chrome.storage.sync.get(['mark_youvid'], function(result){
        mark_youvid = result['mark_youvid']
        if (mark_youvid.includes(vid)){
            // 이미 추가된 콘텐트라면
            del = mark_youvid.indexOf(vid)
            deleteYouvidMarked(del)
            //e.target.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }else{
            // 아직 추가되지 않은 콘텐트라면
            addYouvidMarked(vid)
            //e.target.src = chrome.runtime.getURL("/images/check.png")
        } 
        youtubeOnBrowseRefresh()
    })
}

// btn-mark 마우스 오버 이벤트
function youtubeBrowseOnMouseOverHandler(e){
    thumbnail = e.target.parentNode.parentNode.querySelector("a#video-title-link")
    url = thumbnail?.href
    if(url){
        url = url.split('/')
        // 쇼츠를 제외한 영상만 처리
        if(!url.includes("shorts") && url[3]){
            vid = url[3].split('=')[1]
            e.target.style.boxShadow = "0 0 0 3px #d0d0d0 inset"
            youtubeOnBrowseRefresh()
        }
    }
}


// 마우스 아웃 이벤트
function youtubeBrowseOnMouseOutHandler(e){
    thumbnail = e.target.parentNode.parentNode.querySelector("a#video-title-link")
    url = thumbnail?.href
    if(url){
        url = url.split('/')
        // 쇼츠를 제외한 영상만 처리
        if(!url.includes("shorts") && url[3]){
            vid = url[3].split('=')[1]
            youtubeOnBrowseRefresh()
            e.target.style.boxShadow = "none"
        }
    }
}


/* 컨테이너 DOM Recognition */
function youtubeBrowseRecognizeContainers() {
    console.log("onBrowseRecognizeContainers")
    cards = document.querySelectorAll('div#content.style-scope.ytd-rich-item-renderer');
    //각 container 별로 '+' 버튼 추가 및 배열에 저장
    for (c of cards){
        if (!youtubeContainersList.includes(c)){
            youtubeContainersList.push(c)
            thumbnail = c.querySelector('a#thumbnail')

            url = thumbnail?.href

            // 채널 이름 가져오기
            if(c.querySelector('a#avatar-link')?.href.includes('@')){
                channelName = c.querySelector('a#avatar-link')?.href.split('@')[1]
            }else{
                channelName = c.querySelector('a#avatar-link')?.href.split('/')[4]
            }

            if(url && channelName ){  // 유튜브 광고는 a.href 가 없습니다.
                url = url.split('/')
                // 쇼츠를 제외한 영상만 처리, 쇼츠 영상 url 에는 "shorts" 가 포함됩니다.
                if(!url.includes("shorts") && url[3]){
                    vid = url[3].split('=')[1]
                    youtubeBrowseCreateBtnMark(c, vid)
                    youtubeContainersList.push(c)
                }
            }else{  // 쇼츠, 믹스, 설문조사 등... 은 채널 이름이 없습니다.
                

            }
        }
    }
}


// Refresh UI
function youtubeOnBrowseRefresh(){
    console.log("onBrowseRefresh")
    // REFRESH
    chrome.storage.sync.get(['mark_channel_name', 'mark_youvid'], function(result){
        mark_channel_name = result["mark_channel_name"]
        mark_youvid = result['mark_youvid']

        // refresh cards in Containers List 
        for(c of youtubeContainersList){

            if(c.querySelector('a#avatar-link')?.href.includes('@')){
                channelName = c.querySelector('a#avatar-link')?.href.split('@')[1]
            }else{
                channelName = c.querySelector('a#avatar-link')?.href.split('/')[4]
            }
            url = c.querySelector('a#thumbnail')?.href

            if( url && !url.includes('shorts') ){
                vid = url.split('/')[3].split('=')[1]
                title = (c.querySelector("a#avatar-link")?.title === "undefined")
    
                if(title){
                    //유튜브 믹스
                    //youtubeBrowseCreateBtnMarkMix(c)
                }
    
                btnMarkImg = c.querySelector('button.btn-mark > img')
                if( btnMarkImg  ){
                    if( mark_youvid.includes(vid) && vid ){
                        console.log('vid included')
                        btnMarkImg.src = chrome.runtime.getURL('/images/check.png')
                    }else{
                        btnMarkImg.src = chrome.runtime.getURL('/images/plus-sign2.png')
                    }
                }else{
                    youtubeBrowseCreateBtnMark(c, vid)
                }
            }
        }
    })
}



/***********************************************************************************************************************/
chrome.runtime.onMessage.addListener(msg => {
    if(msg === "refresh"){
        youtubeOnBrowseRefresh()
    }
});

/* Mutation Observer */
/* Config */
observerConfig={
    childList : true,
    subtree: true
}
// mutationObserver 이벤트 핸들러
function youtubeBrowseMutationHandler(mutationList, observer) {
    let u = new URL(window.location.href)
    if(u.pathname.length > 1 || u.host !== "www.youtube.com"){ observer.disconnect() }
    else{
        youtubeBrowseRecognizeContainers();
        //youtubeOnBrowseRefresh()
    }
}

onBrowseAppMountPoint = document.querySelector('div#content');
observer = new MutationObserver(youtubeBrowseMutationHandler);
observer.observe(onBrowseAppMountPoint, observerConfig);

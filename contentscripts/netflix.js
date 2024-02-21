/** 넷플릭스 Browse 페이지 크롬 확장 프로그램 스크립트 **/

/* Config */
observerConfig={
    childList : true,
    subtree: true
}

/* 버튼 추가 함수 */ 
function netflixCreateBtnMark(pNode,ottid){
    const BtnInner = document.createElement("img");
    chrome.storage.local.get(['mark_ott'], function(result){
        mark_ott = result['mark_ott']
        if( mark_ott.includes(ottid) ){
            // 이미 추가된 항목이라면 체크 표시
            BtnInner.src = chrome.runtime.getURL("/images/check.png")
        } else{
            //아직 추가되지 않은 항목이라면 추가 표시
            BtnInner.src = chrome.runtime.getURL("/images/plus-sign.png")
        }
    })

    // 버튼 이미지 스타일링
    BtnInner.style.transition = "all 0.5s"
    BtnInner.style.borderRadius = "18px"

    // 버튼 스타일링
    const BtnMark = document.createElement('button');
    BtnMark.classList.add("btn-mark");
    BtnMark.style.position = "absolute";
    BtnMark.style.right = "0px";
    BtnMark.style.top = "2px";
    BtnMark.style.background = "none";
    BtnMark.style.border = "none"
    BtnMark.style.zIndex = 9999;

    BtnInner.addEventListener('mouseover', netflixBrowseOnMouseOverHandler, false);
    BtnInner.addEventListener('mouseout', netflixBrowseOnMouseOutHandler, false);
    BtnMark.addEventListener('click', netflixBrowseOnClickMarkHandler, false);
    
    BtnMark.appendChild(BtnInner)
    pNode.appendChild(BtnMark)
}

/* 버튼 이벤트 핸들러 */
function netflixBrowseOnClickMarkHandler(e){

    let container = e.target.parentNode.parentNode
    let title = container.querySelector('.fallback-text-container').innerText
    let imgUrl = container.querySelector('img').src
    let watchUrl = container.querySelector('a').href
    let ottid = url.split('/')[4].split('?')[0] 

    chrome.storage.local.get(['mark_ott'], function(result){
        mark_ott = result['mark_ott']
        // 이미 추가된 콘텐트는 목록에서 삭제합니다.
        if( mark_ott.includes(ottid) ){ 
            deleteNetflixMarked(ottid)
        }else {
        // 아직 추가되지 않은 콘텐트는 목록에 추가합니다.
            addNetflixMarked(ottid, imgUrl, title, watchUrl)
        }
        netflixOnBrowseRefresh()
    })
}

function netflixBrowseOnMouseOverHandler(e){
    let container = e.target.parentNode.parentNode
    let url = container.querySelector('a').href
    let ottid = url.split('/')[4].split('?')[0] 
    e.target.style.boxShadow = "0 0 0 3px #FFF inset"
    chrome.storage.local.get(['mark_ott'], function(result){
        mark_ott = result['mark_ott']
        if (!mark_ott.includes(ottid)){
            e.target.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }
    })
}

function netflixBrowseOnMouseOutHandler(e){
    let container = e.target.parentNode.parentNode
    let url = container.querySelector('a').href
    let ottid = url.split('/')[4].split('?')[0] 
    e.target.style.boxShadow = "none"

    chrome.storage.local.get(['mark_ott'], function(result){
        mark_ott = result['mark_ott']
        // 아직 추가되지 않은 콘텐트라면,
        if (!mark_ott.includes(ottid)){
            e.target.src = chrome.runtime.getURL("/images/plus-sign.png")
        }else{
        // 이미 추가된 콘텐트라면,
            e.target.src = chrome.runtime.getURL("/images/checkmark.png")
        }
    })
}

/* 컨테이너 DOM Recognition */
function recognizeContainers() {
    
    card_containers = document.getElementsByClassName('title-card-container ltr-0');
    // 각 container 별로 '+' 버튼 추가 및 배열에 저장
    for (c of card_containers){
        if (!netflixContainersList.includes(c)){
            //리스트에 추가되지 않은 card-container 내에 있는 content 인식
            title = c.querySelector('.fallback-text-container').innerText
            img = c.querySelector('img').src
            url = c.querySelector('a').href
            ottid = url.split('/')[4].split('?')[0]
            
            //버튼 생성 및 추가
            netflixCreateBtnMark(c,ottid);
            //배열에 추가
            netflixContainersList.push(c);
        }
    }
}

//Refresh UI
function netflixOnBrowseRefresh(){
    chrome.storage.local.get(['mark_netflix'], function(result){
        mark_netflix = result['mark_netflix']
        for(c of netflixContainersList){
            url = c.querySelector('a').href
            ottid = url.split('/')[4].split('?')[0]
            if(mark_netflix.includes(ottid)){
                btnImg = c.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('images/check.png')
            }else{
                btnImg = c.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('images/plus-sign.png')
            }
        }
    })
}

//mutationObserver 이벤트 핸들러
function onBrowseMutationHandler(mutationList, observer) {
    recognizeContainers();
}



/***********************************************************************************************************************/
chrome.runtime.onMessage.addListener(msg => {
    if(msg === "refresh"){
        netflixOnBrowseRefresh()
    }
});

appMountPoint = document.querySelector("div#appMountPoint");
observer = new MutationObserver(onBrowseMutationHandler);
observer.observe(appMountPoint, observerConfig)

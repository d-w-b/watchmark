watchaContainersList = []
/* Config */
observerConfig={
    childList : true,
    subtree: true
}
chrome.runtime.onMessage.addListener(msg => {
    if(msg === "refresh"){
        watchaOnBrowseRefresh()
        watchaOnContentsRefresh()
    }
});

appMountPoint = document.querySelector("main");
watchaObserver = new MutationObserver(onWatchaMutationHandler);
watchaObserver.observe(appMountPoint, observerConfig)

// mutationObserver 이벤트 핸들러
function onWatchaMutationHandler(mutationList, observer) {
    recognizeContainers();
}

/* watcha content page */

waitForElement('section.e1kgye4v2').then( container => {
    l = window.location.pathname
    console.log(l)
    ottid = l.split('/').at(-1)
    watchaContentsCreateBtnMark(container, ottid)
})



/* 버튼 추가 함수 */ 
function watchaBrowseCreateBtnMarkElement(pNode,ottid){
    const BtnInner = document.createElement("img");
    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        if( mark_watcha.includes(ottid) ){
            // 이미 추가된 항목이라면 체크 표시
            BtnInner.src = chrome.runtime.getURL("/images/check.png")
        } else{
            //아직 추가되지 않은 항목이라면 추가 표시
            BtnInner.src = chrome.runtime.getURL("/images/plus-sign.png")
        }
    })

    // 버튼 스타일링
    BtnInner.style.transition = "all 0.5s"
    BtnInner.style.borderRadius = "18px"

    const BtnMark = document.createElement('button');
    BtnMark.classList.add("btn-mark");
    BtnMark.style.position = "absolute";
    BtnMark.style.right = "17px";
    BtnMark.style.top = "2px";
    BtnMark.style.background = "none";
    BtnMark.style.border = "none"
    BtnMark.style.zIndex = 9999;

    BtnInner.addEventListener('mouseover', watchaBrowseOnMouseOverHandler, false);
    BtnInner.addEventListener('mouseout', watchaBrowseOnMouseOutHandler, false);
    BtnMark.addEventListener('click', watchaBrowseOnClickMarkHandler, false);

    BtnMark.appendChild(BtnInner)
    pNode.appendChild(BtnMark)
}


function watchaBrowseOnClickMarkHandler(e){
    let container = e.target.parentNode.parentNode
    let img = container.querySelector('img')
    let imgsrc = img.src
    let title = "null"
    let ottid = container.querySelector('a')?.href.split('/')[4]
    if(ottid.includes('?')){ ottid = ottid.split('?')[0]}
    let url = "https://watcha.com/watch/"+ ottid

    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        // 이미 추가된 콘텐트는 목록에서 삭제합니다.
        if( mark_watcha.includes(ottid) ){
            index = mark_watcha.indexOf(ottid)
            deleteWatchaMarked(index)
        }else {
        // 아직 추가되지 않은 콘텐트는 목록에 추가합니다.

            addWatchaMarked(ottid, imgsrc, title, url)
        }

        //refresh UI
        watchaOnBrowseRefresh()
    })
}

function watchaBrowseOnMouseOverHandler(e){
    let container = e.target.parentNode.parentNode
    let ottid = container.querySelector('a')?.href.split('/')[4]
    if(ottid.includes('?')){ ottid = ottid.split('?')[0]}
    e.target.style.boxShadow = "0 0 0 3px #FFF inset"
    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        if (!mark_watcha.includes(ottid)){
            e.target.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }
    })
}

function watchaBrowseOnMouseOutHandler(e){
    let container = e.target.closest('li')
    let ottid = container.querySelector('a')?.href.split('/')[4]
    if(ottid.includes('?')){ ottid = ottid.split('?')[0]}
    e.target.style.boxShadow = "none"

    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        // 아직 추가되지 않은 콘텐트라면,
        if (!mark_watcha.includes(ottid)){
            e.target.src = chrome.runtime.getURL("/images/plus-sign.png")
        }else{
        // 이미 추가된 콘텐트라면,
            e.target.src = chrome.runtime.getURL("/images/checkmark.png")
        }
    })
}

/* 컨테이너 DOM Recognition */
function recognizeContainers() {

    card_containers = document.getElementsByClassName('custom-uvitkv-Cell etpnybg0');
    // 각 container 별로 '+' 버튼 추가 및 배열에 저장
    for (c of card_containers){
        if (!watchaContainersList.includes(c)){
            //리스트에 추가되지 않은 card-container 내에 있는 content 인식
            ottid = c.querySelector('a')?.href.split('/')[4]
            if(ottid){
                if(ottid.includes('?')){ ottid = ottid.split('?')[0]}
                //버튼 생성 및 추가
                watchaBrowseCreateBtnMarkElement(c,ottid);
                //배열에 추가
                watchaContainersList.push(c);
            }
        }
    }
}

//Refresh UI
function watchaOnBrowseRefresh(){
    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        for(c of watchaContainersList){
            let ottid = c.querySelector('a')?.href.split('/')[4]
            if(ottid.includes('?')){ ottid = ottid.split('?')[0]}
            
            if(mark_watcha.includes(ottid)){
                btnImg = c.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('images/check.png')
            }else{
                btnImg = c.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('images/plus-sign.png')
            }
        }
    })
}


/* watcha content page */


/* 버튼 추가 함수 */ 
function watchaContentsCreateBtnMark(pNode,ottid){
    const BtnInner = document.createElement("img");
    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        if( mark_watcha.includes(ottid) ){
            // 이미 추가된 항목이라면 체크 표시
            BtnInner.src = chrome.runtime.getURL("/images/check.png")
        } else{
            //아직 추가되지 않은 항목이라면 추가 표시
            BtnInner.src = chrome.runtime.getURL("/images/plus-sign.png")
        }
    })

    // 버튼 스타일링
    BtnInner.style.transition = "all 0.5s"
    BtnInner.style.borderRadius = "18px"

    const BtnMark = document.createElement('button');
    BtnMark.classList.add("btn-mark");
    BtnMark.style.position = "absolute";
    BtnMark.style.left = "313px";

    BtnMark.style.background = "none";
    BtnMark.style.border = "none"
    BtnMark.style.zIndex = 9999;

    BtnInner.addEventListener('mouseover', watchaContentsOnMouseOverHandler, false);
    BtnInner.addEventListener('mouseout', watchaContentsOnMouseOutHandler, false);
    BtnMark.addEventListener('click', watchaContentsOnClickMarkHandler, false);
    
    BtnMark.appendChild(BtnInner)
    pNode.appendChild(BtnMark)
}

function watchaContentsOnClickMarkHandler(e){
    let img = document.body.querySelector('img.custom-4uwt2b.eoa6tv712')
    let title = img.alt
    let imgsrc = img.src
    let l = window.location.pathname
    let ottid = l.split('/').at(-1)
    let url = "https://watcha.com/watch/"+ottid

    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        // 이미 추가된 콘텐트는 목록에서 삭제합니다.
        if( mark_watcha.includes(ottid) ){ 
            
            index = mark_watcha.indexOf(ottid)
            deleteWatchaMarked(index)


            //상세 페이지 화면의 버튼을 더하기 표시로 변경
            e.target.src = chrome.runtime.getURL("/images/plus-sign.png")
        }else {  
            // 아직 추가되지 않은 콘텐트는 목록에 추가합니다.
            addWatchaMarked(ottid)

            //상세 페이지 화면의 버튼을 체크 표시로 변경
            e.target.src = chrome.runtime.getURL("/images/check.png")
        }
    })
}


function watchaContentsOnMouseOverHandler(e){
    e.target.style.boxShadow = "0 0 0 3px #FFF inset"

    let l = window.location.pathname
    let ottid = l.split('/').at(-1)
        
    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        if (!mark_watcha.includes(ottid)){
            e.target.src = chrome.runtime.getURL("/images/plus-sign2.png")
        }
    })

}

function watchaContentsOnMouseOutHandler(e){
    e.target.style.boxShadow = "none"

    let l = window.location.pathname
    let ottid = l.split('/').at(-1)

    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        // 아직 추가되지 않은 콘텐트라면,
        if (!mark_watcha.includes(ottid)){
            e.target.src = chrome.runtime.getURL("/images/plus-sign.png")
        }else{
        // 이미 추가된 콘텐트라면,
            e.target.src = chrome.runtime.getURL("/images/checkmark.png")
        }
    })

}

//Refresh UI
function watchaOnContentsRefresh(){
    chrome.storage.sync.get(['mark_watcha'], function(result){
        mark_watcha = result['mark_watcha']
        let l = window.location.pathname
        let ottid = l.split('/').at(-1)
        container = document.body.querySelector('section.custom-1gcurak.e1kgye4v2')
        if(container){
            if(mark_watcha.includes(ottid)){
                btnImg = container.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('images/check.png')
            }else{
                btnImg = container.querySelector('button.btn-mark > img')
                btnImg.src = chrome.runtime.getURL('images/plus-sign.png')
            }
        }
    })
}


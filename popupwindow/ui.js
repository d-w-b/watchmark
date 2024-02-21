// 요소에 CSS 속성을 부여하는 함수
function setStyle(element, props){
  Object.assign(element.style, props)
  return element
}
/********************************************************************************/
//a 태그 생성 
function createAnchor ( href, className, clickEventHandler ){
    a = document.createElement('a')
    if(className) { a.className = className }
    a.href = href
    a.addEventListener('click', function(e){
      clickEventHandler(e)
    });
  
    return a
  }
  
//img 태그 생성 
function createImg( src , alt, className ){
  img = document.createElement('img')
  img.src = src
  img.alt = alt
  if(className) { img.className = "thumbnail" }

  return img
}

//div 태그 생성
function createDiv(className, id){
  wrapper = document.createElement('div')
  wrapper.style.position = 'relative'
  if(className) {wrapper.className = className}
  if(id) {wrapper.dataset.id = id}

  return wrapper
}

//button 태그 생성
function createButton(img, eventHandler, className){
  btn = document.createElement('button')

  if ( img ) {
    btn.appendChild(img)
  }
  
  if ( className ){
    btn.className = className
  }
  
  btn.addEventListener("click", function(e){
    console.log(e)
    eventHandler(e)
  })

  return btn
}
/******************************** 사용자 정의 컴포넌트 *********************************/
//순서 바꾸기 버튼 생성
function createSwapButton(imgStyle, btnStyle){
  // 버튼 이미지 생성
  img = createImg('icons/check_box_black.png', '순서 변환 버튼',null)
  img = setStyle(img, imgStyle)

  btnSwap = createButton(
    img,
    onClickSwap, 
    'btn_swap'
  )

  btnSwap = setStyle(btn,btnStyle)

  return btnSwap
}

//삭제 버튼 생성
function createDeleteButton(imgStyle, btnStyle){
  // 버튼 이미지 생성
  img = createImg('icons/delete_black.png', '순서 변환 버튼',null)
  img = setStyle(img, imgStyle)

  btnDelete = createButton(
    img,
    onClickDelete, 
    'btn_delete'
  )

  btnSwap = setStyle(btn,btnStyle)

  return btnSwap
}

//카드 컴포넌트 생성
function createCard(img,   //카드 썸네일로 보여질 이미지
                    anchor,//카드 클릭시 페이지 이동을 위한 anchor
                    title, //카드 제목으로 보여질 텍스트
                    id){   //카드에 부여할 아이디

  card = createDiv("card", id)

  //카드 내에서 보여질 제목
  txt = document.createElement('h3')
  txt.innerText = title

  //적용할 CSS
  BTN_DELETE_IMG_CSS ={
    width: "15px",
    height: "15px"
  }

  BTN_DELETE_CSS = {
    position : 'absolute',
    top: '2px',
    right: '3px',
    width: "15px",
    height: "15px",
    border : 'none',
    background : '#fefefe',
    'border-radius': '19px',  
    transition : 'all 0.7s'
  }

  BTN_SWAP_IMG_CSS ={
    width: "17px",
    height: "17px",
    "border-radius" : "19px"
  }

  BTN_SWAP_CSS = {
    position: "absolute",
    width: "17px",
    height: "17px",
    bottom : "0px",
    right : "2px"
  }

  //카드에 추가할 버튼 생성
  btnDelete = createDeleteButton(BTN_DELETE_IMG_CSS,BTN_DELETE_CSS)
  btnSwap = createSwapButton(BTN_SWAP_IMG_CSS, BTN_SWAP_CSS)

  //append
  anchor.append(
    img,
    txt
  )
  card.append(
    anchor,
    btnDelete,
    btnSwap
  )

  return card
}

/******************************  클릭 이벤트 핸들러   ******************************/
function onClickCard(e){
  chrome.tabs.create(
    {url: e.target.closest('a').href}
  );
}

//리스트에서 삭제 버튼 클릭 이벤트
function onClickDelete(e){

  // mark_youvid 불러오기
  chrome.storage.sync.get(['mark_youvid'], function(result){
    //cardWrapper, vid 찾기
    parentNode = e.target.closest('.card')
    vid = parentNode.dataset.id
    vidList = result['mark_youvid']

    //인덱스를 찾은 후 리스트에서 해당 인덱스 아이템 제거
    idx = vidList.indexOf(vid)
    vidList.splice(idx,1)
    state.items.splice(idx,1)

    chrome.storage.sync.set({
      mark_youvid : vidList
    }).then( () =>{
        const container = document.body.querySelector('.contents-container')
        //기존에 있던 하위 요소들 모두 삭제
        var last;
        while (last = container.lastChild) container.removeChild(last);

        //다시 렌더링
        renderItems( container , state.items, 3 )
      })
  })
}
//리스트에서 순서 변경 버튼 클릭 이벤트
function onClickSwap(e){
  console.log(state.temp)
  getStorage(['mark_youvid']).then(result=>{

    a = result['mark_youvid']
    pNode = e.target.closest('.card')

    if (state.temp === undefined){
      state.temp = pNode
      e.target.src = 'icons/checked_box_black.png'
    }else{
      let idx1 = a.indexOf(pNode.dataset.id)
      let idx2 = a.indexOf(state.temp.dataset.id)
      
      let dummy = document.createElement("span")
      state.temp.before(dummy)
      pNode.before(state.temp)
      dummy.replaceWith(pNode)

      //이전에 클릭된 버튼 이미지 변경
      state.temp.querySelector('.btn_swap > img').src = 'icons/check_box_black.png'
      //초기화
      state.temp = undefined

      swap(a, idx1, idx2)
      chrome.storage.sync.set({mark_youvid : a})
    }
  })
}

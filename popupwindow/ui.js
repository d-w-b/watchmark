
//a 요소 생성 
function createAnchor ( href, className, clickEventHandler ){
    a = document.createElement('a')
    if(className) { a.className = className }
    a.href = href
    a.addEventListener('click', function(e){
      clickEventHandler(e)
    });
  
    return a
  }
  
//img 요소 생성 
function createImg( src , alt, className ){
  img = document.createElement('img')
  img.src = src
  img.alt = alt
  if(className) { img.className = className }

  return img
}

//div 요소 생성
function createDiv(className, id){
  wrapper = document.createElement('div')
  wrapper.style.position = 'relative'
  if(className) {wrapper.className = className}
  if(id) {wrapper.dataset.id = id}

  return wrapper
}

//button 요소 생성
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
// 체크 박스 버튼 생성
function createCheckBox(){
  // 버튼 이미지 생성
  img = createImg('icons/check_box_black.png', '선택 버튼','btn_check_img')

  btnCheck = createButton(
    img,
    onClickDelete, 
    'btn_check'
  )

  return btnCheck
}


// 순서 바꾸기 버튼 생성
function createSwapButton(){
  // 버튼 이미지 생성
  img = createImg('icons/check_box_black.png', '순서 변환 버튼','btn_swap_img')

  btnSwap = createButton(
    img,
    onClickSwap, 
    'btn_swap'
  )

  return btnSwap
}

// 삭제 버튼 생성
function createDeleteButton(){
  // 버튼 이미지 생성
  img = createImg('icons/delete_black.png', '삭제 버튼', 'btn_delete_img')

  btnDelete = createButton(
    img,
    onClickDelete, 
    'btn_delete'
  )

  return btnDelete
}

// 카드 컴포넌트 생성
function createCard(img,   //카드 썸네일로 보여질 이미지
                    anchor,//카드 클릭시 페이지 이동을 위한 anchor
                    title, //카드 제목으로 보여질 텍스트
                    id){   //카드에 부여할 아이디

  card = createDiv("card", id)

  // 카드 내에서 보여질 제목
  txt = document.createElement('h3')
  txt.innerText = title


  btnWrapper = createDiv("arrange", null)
  // 카드에 추가할 버튼 생성
  btnDelete = createDeleteButton()
  btnWrapper.append(btnDelete)

  //append
  anchor.append(
    img,
    txt
  )
  card.append(
    anchor,
    btnWrapper
  )

  return card
}

/******************************  클릭 이벤트 핸들러   ******************************/
function onClickCard(e){
  chrome.tabs.create(
    {url: e.target.closest('a').href}
  );
}

// 삭제 버튼 클릭 이벤트
function onClickDelete(e){

  // mark_youvid 불러오기
  chrome.storage.sync.get(['mark_youvid'], function(result){
    //cardWrapper, vid 찾기
    parentNode = e.target.closest('.card')
    vid = parentNode.dataset.id
    vidList = result['mark_youvid']

    // Update Model
    // 인덱스를 찾은 후 리스트에서 해당 인덱스 아이템 제거
    idx = vidList.indexOf(vid)
    vidList.splice(idx,1)
    state.items.splice(idx,1)

    chrome.storage.sync.set({
      mark_youvid : vidList
    }).then( () =>{
      // Update View
        if(e.target.closest('.content_row').childElementCount == 1){
          e.target.closest('.content_row').remove()
        }else{
          e.target.closest('.card').remove()
        }
      })
  })
}

// 순서 변경 버튼 클릭 이벤트
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

      // Update View
      state.temp.querySelector('.btn_swap > img').src = 'icons/check_box_black.png'
      let dummy = document.createElement("span")
      state.temp.before(dummy)
      pNode.before(state.temp)
      dummy.replaceWith(pNode)
      
      // Update Model
      state.temp = undefined
      swap(a, idx1, idx2)
      swap(state.items, idx1, idx2)
      chrome.storage.sync.set({mark_youvid : a})
    }
  })
}

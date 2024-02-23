document.body.onload = function () {
  init()
}

var state = Object()
state.temp = undefined
state.count = 0
state.items = []

// init
function init() {
  //저장된 데이터 불러오기
  chrome.storage.sync.get(
    ['mark_youvid'], function (result) {

        mark_youvid = result['mark_youvid']  // vid 리스트

        const container = document.body.querySelector('.mark_youtube_video')
        if( mark_youvid.length ){
          //영상 정보 요청  vid -> ( thumbnail, title, vid )
          fetch("http://43.201.187.250:8000/api/id="+ mark_youvid.toString(), {
            method: 'GET',
          }).then(res => {
            console.log(res)
            return res.json()
          }).then(res => {
            console.log(res)
            // state에 items 저장
            state.items = [...res.items]
            
            renderItems( container , res.items, 1 )
          })
        }else{
          const youvidGreetings = document.createElement('h4')
          youvidGreetings.textContent = "추가된 콘텐츠가 없습니다. 콘텐츠를 추가해주세요."
          container.appendChild(youvidGreetings)
        }
  })

  // mypage EventListeners
  document.querySelectorAll('.btn_tab').forEach((e =>{
    e.addEventListener('click', btnmypageClickEventHandler)
  }))

}


/*********************************  이벤트 핸들러 *********************************/

// 각 탭 이동 버튼 클릭 이벤트 핸들러

// 마이페이지 아이콘 클릭 이벤트
function btnmypageClickEventHandler(e) {
  window.scrollTo(0, 0)
  renderTab(1)
}

// 각 탭으로 이동 버튼 클릭 이벤트
function btntabClickEventHandler(e) {
  m = e.target.closest(".contents")
  index = Array.from(m.parentNode.children).indexOf(m)
  console.log(e.target, index)
  window.scrollTo(0, 0)
  renderTab(index + 2); // 해당 탭으로 이동
  console.log('이전 클릭');
}

// 홈 화면으로 이동 클릭 이벤트 핸들러
const prevBtns = document.querySelectorAll(".prev");
prevBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    window.scrollTo(0, 0)
    renderTab(0)
  });
});

/*****************************************************************************************/

function renderItems(container , items, numColumn) {
  state.count = 0
  for (item of items){
    //3개씩 끊기
    if (state.count % numColumn == 0){
      var row = createDiv('content_row', null)
      row.classList.add('handover')
      row.classList.add('handover_gray')
    }

    // Youtube data api 로부터 받아온 데이터
    let title = item.snippet.title
    let thumbnail = item.snippet.thumbnails.maxres.url

    //카드 생성
    card = createCard(
                      createImg(thumbnail, title, "thumbnail"),                                     
                      createAnchor("https://www.youtube.com/watch?v=" + item.id, null, onClickCard),
                      title, 
                      item.id                                                                       
                    )

    //행에 카드 추가
    row.appendChild(card)
    container.appendChild(row)
    state.count++
  }

  return container
}

function renderTab(index) {
  const screens = Array.from(document.body.querySelector('.container').children)
  for (i in screens) {
    if (i == index) { screens[i].style.display = "block" }
    else { screens[i].style.display = "none" }
  }
}


function getStorage(list){
  return chrome.storage.sync.get(list)
}

function swap(a, one, two){
  [a[one], a[two]] = [a[two], a[one]]
}

/**********************************************************************************/

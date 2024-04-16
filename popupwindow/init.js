document.body.onload = function () {
  init()
}

var state = Object()
state.temp = undefined
state.items = []

// init
function init() {

  document.querySelectorAll('.btn_tab').forEach((e =>{
    e.addEventListener('click', btntabClickEventHandler)
  }))

  //저장된 데이터 불러오기
  chrome.storage.sync.get(
    ['mark_youvid', 'mark_netflix_data', 'mark_watcha','mark_watcha_data', 'selectedIndex'], 
    function (result) {
      // Init container list view
      const containerLists = document.querySelectorAll('li.contents_container')
      containerLists[result['selectedIndex']].style.display = "block"

      // Rendering content
      // Render youtube video content
      mark_youvid = result['mark_youvid'] 
      console.log(mark_youvid)
      const youtubeVideoContainer = document.body.querySelector('.mark_youtube')

      // Request for server for youtube video data  @GET { vid } / @Return  ...{ thumbnails, title, vid }
      // CORS 오류를 해결하기 위해 프록시 서버로 우회해서 youtube api 요청
      fetch("http://43.201.187.250:8000/api/id="+ mark_youvid.toString(), {
        method: 'GET',
      }).then(res => {
        console.log(res)
        return res.json()
      }).then(res => {
        console.log(res)
        // deep copy to global var
        state.items = [ ...res.items ]
        renderYoutubeItems( youtubeVideoContainer , state.items, 1 )
      })
      
      /* netflix */
      mark_netflix_data = result['mark_netflix_data']
      const netflixVideoContainer = document.body.querySelector('.mark_netflix')
      renderItems( netflixVideoContainer , mark_netflix_data, 2 )

      /* watcha */
      mark_watcha_data = result['mark_watcha_data'] 
      const watchaVideoContainer = document.body.querySelector('.mark_watcha')
      renderItems( watchaVideoContainer , mark_watcha_data, 2)
      //console.log(mark_watcha_data)
  })
}


/*********************************  이벤트 핸들러 *********************************/

/* @param { PointerEvent } e */
function btntabClickEventHandler(e) {
  const p = e.target.closest("button")
  index = Array.from(p.parentNode.children).indexOf(p)
  console.log(index)
  window.scrollTo(0, 0)
  renderTab(index ); // 해당 탭으로 이동
}

/*****************************************************************************************/

/* @param { DOM Node } container, { Array<YoutubeVideoData> } items, { int } numColumn */
function renderYoutubeItems(container, items, numColumn) {
  let count = 0
  for (item of items){
    // numColum 개수마다 행 끊기
    if (count % numColumn == 0){
      var row = createDiv('content_row', null)
      row.classList.add('handover')
      row.classList.add('handover_gray')
    }
    
    // Youtube data api 로부터 받아온 데이터
    let title = item.snippet.title
    let thumbnail
    item.snippet.thumbnails.maxres ?  thumbnail = item.snippet.thumbnails.maxres.url :  thumbnail = item.snippet.thumbnails.standard.url;

  
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
    count++
  }

  return container
}

/* @param { DOMNode } container, { Array<ContentsContainer> } items, { int } numColumn */
function renderItems(container, items, numColumn) {
  let count = 0
  for (item of items){
    // numColum 개수마다 행 끊기
    if (count % numColumn == 0){
      var row = createDiv('content_row', null)
      row.classList.add('handover')
      row.classList.add('handover_gray')
    }
    
    // Youtube data api 로부터 받아온 데이터
    let title = item.title
    let thumbnail = item.imgUrl

  
    //카드 생성
    card = createWatchaCard(
                      createImg(thumbnail, title, "thumbnail"),                                     
                      createAnchor(item.watchUrl, null, onClickCard),
                      item.id                                                                       
                    )

    //행에 카드 추가
    row.appendChild(card)
    container.appendChild(row)
    count++
  }

  return container
}


/* @param {int} index */
function renderTab(index) {
  // Update Model
  chrome.storage.sync.set({selectedIndex : index})
  // Update View
  const li = Array.from(document.body.querySelector('.container').children)
  for (i in li) {
    if (i == index) { li[i].style.display = "block" }
    else { li[i].style.display = "none" }
  }
}

function swap(a, one, two){
  [a[one], a[two]] = [a[two], a[one]]
}

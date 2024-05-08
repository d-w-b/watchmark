export class YoutubeClient{
  // Request server for youtube video data  
  // @GET { vid } 
  // return  {... thumbnails, title, vid }
  constructor() {
    this.urlWithParam = 'http://43.201.187.250:8000/id='
  }

  async videos(vids){
    const res = await fetch(this.urlWithParam + vids , {
        method: 'GET',
    }).then(res=>{
        if(res.ok){
            return res.json()
        }else{
            alert('서버 요청 실패')
        }
    }).catch(err=>alert('서버 요청 실패'))
    return res
  }
}

export function initCache( initialProps = undefined, staleTime = 0 ){
  let props;

  if(initialProps){
    const {cacheTimer} = initialProps
    let now = new Date().getTime()

    // chrome.storage does NOT ALLOW to store function 
    // ( or method even if it's encapsulated in Object )
    // so we need to overwrite {client} when we initiate cache because {client} has methods.
    props = {
      ...initialProps, 
      client: new YoutubeClient(), 
      isStaled : (now >= cacheTimer ? true : false) 
    };
  }else{
    props = {
      client : new YoutubeClient(),
      staleTime,
      cache: [],
      cacheTimer : new Date().getTime(),
      isStaled: true,
    };
  }
  
  return (action, cb) => {
    action(props)
    .then((resolved)=>{
      props = {...resolved}
      return props
    })
    .then(props => cb(props))
    .catch(e => console.log('err',e))
  }
}

export async function refreshCache(props){
  const { client, staleTime, isStaled } = props
  const now = new Date().getTime()

  if( isStaled ){
    const storage = await chrome.storage.sync.get(['mark_youvid'])
    return client.videos(storage.mark_youvid.toString())
    .then( res => {
      const cached = []
      res.items.map((item)=>{
        cached.push({
          thumbnails : item.snippet.thumbnails,
          title : item.snippet.title
        })
      })

      return ({
        ...props,
        cacheTimer : parseInt(now) + parseInt(staleTime),
        cache : [...cached],
        isStaled : false,
      })
    })
  }else{
    throw ('CACHE::EXCEPTION::NOT_UPDATED', props);
  }
}

export async function updateTimer(props) {
  const { staleTime } = props
  return {...props, cacheTimer: new Date().getTime() + staleTime}
}

export async function setCache(props){
  chrome.storage.sync.set({cache: {...props}})
  return props
}
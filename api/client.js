export class YoutubeClient{
  // Request server for youtube video data  
  // @GET param: { id } 
  // return  res : {... , Array<Object> items}
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

/*
  @params
  props : {
    client : YoutubeClient
    staleTime : number
    items : Array<YoutubeApiResponseItem>
    cacheTimer : number
    isStaled : boolean
  }
*/
export function initCache( initialProps = undefined, staleTime = 5* 60 * 1000 ){
  let props;

  if(initialProps){
    // chrome.storage does NOT ALLOW to store function 
    // ( or method even if it's encapsulated in Object )
    // so we need to overwrite {client} when we initiate cache because {client} has methods.
    props = {
      ...initialProps, 
      client: new YoutubeClient(), 
      staleTime,
    };
  }else{
    props = {
      client : new YoutubeClient(),
      staleTime,
      items: [],
      cacheTimer : undefined,
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
    .catch(props => console.log('CACHE::EXCEPTION::NOT_STALED_YET',props))
  }
}

export async function refreshCache(props){
  const { cacheTimer,client, staleTime, isStaled } = props

  if( isStaled ){
    const storage = await chrome.storage.sync.get(['mark_youvid'])
    return client.videos(storage.mark_youvid.toString())
    .then( res => {
      const cached = []
      res.items.map((item)=>{
        cached.push({
          vid : item.id,
          thumbnails : item.snippet.thumbnails,
          title : item.snippet.title
        })
      })

      clearTimeout(cacheTimer)
      const timerId = setTimeout(async ()=>{
        const storage = await chrome.storage.sync.get(['cache'])
        chrome.storage.sync.set({cache : {...storage.cache, isStaled: true}})
      },staleTime)

      return ({
        ...props,
        cacheTimer: timerId,
        items : [...cached],
        isStaled : false,
      })
    })
  }else{
    throw ('CACHE::EXCEPTION::NOT_STALED_YET', props);
  }
}

export async function setCache(props){
  chrome.storage.sync.set({cache: {...props}})
  return props
}
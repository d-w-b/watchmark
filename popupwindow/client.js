export class YoutubeClient{
  // Request server for youtube video data  
  // @GET { vid } 
  // return  {... thumbnails, title, vid }
  constructor() {
    this.urlWithParam = 'http://43.201.187.250:8000/id='
  }

  async videos(vids){
    const res = await fetch(this.urlWithParam + vids, {
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

export function createCache(staleTime, initialProps = undefined){
  let props;

  if(initialProps){
    props = {...initialProps, client: new YoutubeClient()};
  }else{
    props = {
      client : new YoutubeClient(),
      staleTime : staleTime,
      cache: [],
      cacheTimer : new Date().getTime(),
    };
  }
  
  return (action, cb) => {
    action(props)
    .then((resolved)=>{
      props = {...resolved}
      return props
    })
    .then(props => cb(props))
    .catch(e => console.log(e))
  }
}

export async function updateCache(props){
  const { client, staleTime, cacheTimer } = props
  const now = new Date().getTime()
  if(cacheTimer <= now){
    //TODO : 'tFklPnA0EDo' is a MOCK data. It should be replaced later.
    return client.videos('tFklPnA0EDo')
    .then( res => {
      return ({
        ...props,
        cacheTimer : now + staleTime,
        cache : [...res.items]
      })
    })
  }else{
    throw ('CACHE::EXCEPTION::NOT_YET');
  }
}

export async function updateTimer(props) {
  const { staleTime } = props
  return {...props, cacheTimer: new Date().getTime() + staleTime}
}

export async function setCache(props){
  console.log(props)
  chrome.storage.sync.set({cache: {...props}})
  return props
}
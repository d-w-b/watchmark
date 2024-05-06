export default class YoutubeClient{
    // Request for server for youtube video data  
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

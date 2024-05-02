export default class YoutubeClient{
    // Request for server for youtube video data  
    // @GET { vid } / @Return  {... thumbnails, title, vid }
    // [CORS] 프록시 서버 이용 youtube api 요청
    constructor() {
        this.urlWithParam = 'http://43.201.187.250:8000/id='
    }

    async videos(vids){
        const res = await fetch(this.urlWithParam + vids, {
            method: 'GET',
        })
        return res.json()
    }
}

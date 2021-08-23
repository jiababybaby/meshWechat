//app.js
App({
  data: {
    openid:"",
    ws_flag: false,
    service_uuid: "0000FFFF-0000-1000-8000-00805F9B34FB",
    characteristic_write_uuid: "0000FF01-0000-1000-8000-00805F9B34FB",
    characteristic_read_uuid: "0000FF02-0000-1000-8000-00805F9B34FB",
    name: "BLUFI",
    md5Key: "",
    isInit: 1,
    rssi: -120,
    ip: "",
    port: "",
  },
  onLaunch: function () {
    console.log("app lanuch");
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env: 'a-123-0gpvs22e9ee0fdea',
        traceUser: true,
      })
    }
    wx.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      decs:"获取用户标识信息",
      success: res => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          if(1){
              // 可以将 res 发送给后台解码出 unionId
              // this.globalData.userInfo = res.userInfo

              wx.cloud.callFunction({
                name:'getOpenID',
                complete:res=>{
                  console.log('openid--',res.result)
                  this.openid = res.result.openid
                  // page.setData({
                  //   openid:openid
                  // })
                  if(this.ws_flag){
                    var send_json={method: "get_sn",opid: this.openid};
                    var jsonstr =JSON.stringify(send_json );//获取网关列表
                    wx.sendSocketMessage({
                      data: jsonstr,
                      success: (res) => {},
                      fail: (res) => {},
                      complete: (res) => {},
                    })
                  }
                  this.onShow();
                }
              })
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            
          }
        }
      }
    })
    wx.removeStorageSync('deviceList');
    this.getUserProfile();
    console.log("wss://jiababybaby.work:82");
    this.connect_ws();
    self=this;
    wx.onSocketOpen((result) => {
      this.ws_flag=true;
      var i=0;
       function heart(){
         
        var message='ping'+i.toString();
        i++;
        try{
        wx.sendSocketMessage({
          data: message,
          fail: (res) => {
            console.log(res);
            this.ws_flag=false;
            wx.closeSocket({
              code: 0,
              reason: 'reason',
              success: (res) => {},
              fail: (res) => {},
              complete: (res) => {},
            });
            self.connect_ws();
          },
        });
      }catch(e){

      }
      };
      if(this.ws_flag)
        setInterval(heart, 1000*60*5);
    });
 
    wx.onSocketClose((result) => {
      this.ws_flag=false;
      console.log(result)
    })
    wx.onSocketError((result) => {
      this.ws_flag=false;
      console.log(result)
    })
  },
  connect_ws:function(){
    wx.connectSocket({
      url: 'wss://jiababybaby.work:10087',
      //url: 'wss://192.168.0.102:8899',
      //  url: 'wss://119.29.196.53:8899',
      header:{
       'content-type': 'application/json'
      },
      perMessageDeflate: true,
      protocols: [],
      tcpNoDelay: true,
      timeout: 1000,
      success: (res) => {
        console.log(res);
        
      },
      fail: (res) => {
        console.log(res);
        this.ws_flag=false;
      },
      complete: (res) => {
        console.log(res);
      },
    });    
  },
  getUserProfile: function () {
    const self = this;
    wx.getUserProfile({
      success(res) {
        console.log(res);
        self.globalData.userInfo = res.userInfo;
      }
    })
  },
  globalData: {
    userInfo: null,
    udp: ""
  }
})
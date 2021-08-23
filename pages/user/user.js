// pages/user/user.js
const app = getApp();
const util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wifiName: "",
    userInfo: { nickName: "游客", avatarUrl: "/images/default_avatar.png"},
    isAuthorization: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false
  },
  initWifi: function() {
    const self = this;
    wx.startWifi();
    wx.getConnectedWifi({
      success: function (res) {
        self.setData({
          wifiName: res.wifi.SSID
        });
      },
      fail: function (res) {
        self.setData({
          wifiName: ""
        });
      }
    });
    wx.onWifiConnected(function (res) {
      self.setData({
        wifiInfo: res.wifi.SSID
      });
    })
  },
  showProblem: function() {
    if (this.data.isAuthorization) {
      wx.navigateTo({
        url: "/pages/problem/problem"
      })
    }
    
  },
  showSetting: function() {
    wx.navigateTo({
      url: "/pages/settingDevices/settingDevices"
    })
  },
  showPosition: function() {
    // wx.navigateTo({
    //   url: "/pages/positionList/positionList"
    // })
  },
  showTopology: function () {
    wx.navigateTo({
      url: "/pages/topology/topology"
    })
  },
  bindGetUserInfo: function(e) {
    const self = this;
    if (e.detail.userInfo) {
      self.getUserInfo();
    } else {
      console.log("拒绝了");
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    self=this;
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        app.globalData.userInfo = res.userInfo;
        self.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          isAuthorization: true,
        })
      }
    })
  },
  // getUserInfo(e) {
  //   // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
  //   this.setData({
  //     userInfo: e.detail.userInfo,
  //     hasUserInfo: true
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this;
    wx.setNavigationBarTitle({
      title: '我的'
    });
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
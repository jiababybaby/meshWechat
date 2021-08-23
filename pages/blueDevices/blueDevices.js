
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({
  data: {
    blueList: [],
    searchList: [],
    searchName: "",
    selected: 0,
    saveScanList: [],
    isProblem: false,
    isMesh: false,
    macs: [],
    ip: "",
    rssiValue: -100,
    isfilter: false,
    isSave: false,
    btnTitle: "下一步"
  },
  //显示过滤条件
  showFilter: function() {
    this.setData({
      isfilter: !this.data.isfilter
    })
  },
  
  //搜索
  bindViewSearch: function (e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  
  onLoad: function (options) {
    var self = this;
    self.setTitle();
    util.showLoadingMask('设备扫描中...');
    var isMesh = options.flag,
      macs = [], btnTitle = "下一步", ip = "";
    if (isMesh == "true") {
      isMesh = true;
      btnTitle = "加入网络";
      ip = options.ip;
      macs = JSON.parse(options.macs);
    } else {
      isMesh = false;
    }
    self.setData({
      blueList: [],
      isMesh: isMesh,
      macs: macs,
      ip: ip,
      rssiValue: app.data.rssi,
      btnTitle: btnTitle,
     
    })
    setTimeout(function() {
      wx.hideLoading();
    }, 10000)
    util.getBluDevice(self, true); 
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
    const self = this;
    wx.startBluetoothDevicesDiscovery({
      
    })
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
wx.onBluetoothDeviceFound(function(res) {
  var devices = res.devices;
  console.log('new device list has founded')
  console.dir(devices)
  console.log(ab2hex(devices[0].advertisData))
})
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

})

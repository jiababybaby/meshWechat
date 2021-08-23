// pages/setPosition/setPosition.js
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    device: "",
    floorArray: ["1F", "2F", "3F", "4F", "5F", "6F", "7F", "8F", "9F", "10F", "11F", "12F",
      "13F", "14F", "15F", "16F"],
    floorIndex: 6,
    position: "",
    areaArray: ["A", "B", "C", "D", "E", "F", "G"],
    areaIndex: 0,
    floor: "",
    name: "001",
    oldFloor: "",
    oldArea: "",
    oldCode: "",
    oldMac: "",
    mac: "",
    flag: true,
    isEdit: false,
    btnTitle: "下一步"
  },
  bindViewArea: function(e) {
    const self = this;
    var position = e.detail.value;
    self.setData({
      position: position,
      // floorIndex: self.data.floorArray.indexOf(position)
    })

  },
  // bindFloorChange: function(e) {
  //   const self = this;
  //   var index = e.detail.value;
  //   this.setData({
  //     floorIndex: index,
  //     position: self.data.floorArray[index]
  //   })
  // },
  bindViewFloor: function(e) {
    const self = this;
    var floor = e.detail.value;
    self.setData({
      floor: floor
    })
  },
  bindViewCode: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindViewMac: function(e) {
    this.setData({
      mac: e.detail.value.toLowerCase()
    })
  },
  qrCode: function() {
    const self = this;
    wx.scanCode({
      success(res) {
        var qr = res.result;
        if (!util._isEmpty(qr)) {
          self.setData({
            mac: qr.toLowerCase()
          })
        };
      }
    })
  },
  savePosition: function() {
    const self = this;
    if (util._isEmpty(self.data.position)) {
      util.showToast("请输入小区位置");
      return false;
    }
    if (util._isEmpty(self.data.area)) {
      util.showToast("请输入楼层");
      return false;
    }
    if (util._isEmpty(self.data.name)) {
      util.showToast("请输入房间名称");
      return false;
    }
    if (util._isEmpty(self.data.mac)) {
      util.showToast("请输入设备SN地址");
      return false;
    }
      self.setNewPosition();
  },
  isDeviceExist: function (mac, flag) {
    const self = this;
    var isDevice = false;
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    console.log(list)
    for (var i in list) {
      var item = list[i];
      if (item.mac == mac) {
        isDevice = true;
        self.setData({
          device: item
        })
        if (flag) {
          item.position = "";
          list.splice(i, 1, item);
          util.setStorage(constant.DEVICE_LIST, list);
        }
        break;
      }
    }
    return isDevice;
  },
  setRequestPair: function (position, macs, ip, fun, desc) {
    var data = '{"request": "' + constant.SET_POSITION + '",' + '"position":"' + position + '"}}';
    util.setRequest(constant.DEVICE_REQUEST, data, macs.join(), macs.length, ip, true, fun, desc);
  },
  setSuc: function() {
    const self = this;
    var list = wx.getStorageSync(constant.DEVICE_LIST);
    for (var i in list) {
      var item = list[i];
      if (item.mac == self.data.mac) {
        list.splice(i, 1, self.data.device);
        break;
      }
    }
    this.setPosition();
    util.setStorage(constant.DEVICE_LIST, list);
  },
  setNewPosition: function() {
    const self = this;
    var position = self.data.position + "-" + self.data.area + "-" + self.data.name;
    if (self.isDeviceExist(self.data.mac, false)) {
      var device = self.data.device,
        macs = [device.mac];
      device.position = position;
      self.setData({
        device: device
      })
      util.showLoading("");
      self.setRequestPair(position, macs, device.ip, self.setSuc, "设置失败");
    } else {
      util.showLoading("");
      self.setPosition();
    }
  },
  setPosition: function() {
    const self = this;
    var data = {
      "sn": self.data.mac, "name": self.data.name, "position": self.data.position, "floor": self.data.floor
    };
    if (self.data.mac != self.data.oldMac) {
      var position = wx.getStorageSync(constant.POSITION_LIST);
      console.log(position);
      for (var i = 0; i < position.length; i++) {
        
        if (position[i].mac == self.data.oldMac) {
          position.splice(i, 1);
          break;
        }
      }
      util.setStorageSync(constant.POSITION_LIST, position);
      var send_json={method: "add_sn",opid: app.openid, sn: data};
      var jsonstr =JSON.stringify(send_json );
      console.log(jsonstr);
      if(app.ws_flag){
        wx.sendSocketMessage({
          data: jsonstr,
          success: (res) => {
            console.log("add success");
          },
          fail: (res) => {},
          complete: (res) => {},
        })
      }
    }
    util.savePosition(data);
    setTimeout(function () {
      wx.hideLoading();
      wx.navigateBack({
        delta: 1
      })
      util.showToast("添加网关设备成功");
      if (self.data.flag || self.data.isEdit) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        console.log("save success");
        self.setData({
          mac: "",
          name: self.getNum()
        })
      }
    }, 1000)
  },
  getNum: function () {
    var self = this,
      len = self.data.name.length,
      num = parseInt(self.data.name);
    num++;
    if (num <= 9) {
      var str = "";
      if (len > 1) {
        for (var i = 0; i < (len - 1); i++) {
          str += "0";
        }
      }
      num = str + num;
    } else if (num <= 99) {
      var str = "";
      if (len > 2) {
        for (var i = 0; i < (len - 2); i++) {
          str += "0";
        }
      }
      num = str + num;
    }
    return num;
  },
  initData: function (options) {
    var device = options.device,
      positionInfo = options.position,
      floorIndex = 0, position = "1F", areaIndex = 0, area = "A", name = "001", mac = "", oldFloor = "", oldArea = "", oldCode = "", isEdit = false, flag = true;
    if (!util._isEmpty(device)) {
      device = JSON.parse(device);
      mac = device.mac;
      var position = device.position;
      if (!util._isEmpty(position)) {
        position = position.split("-");
        position = oldFloor = position[0];
        area = oldArea = position[1];
        name = oldCode = position[2];
        floorIndex = this.data.floorArray.indexOf(position);
        areaIndex = this.data.areaArray.indexOf(area);
        isEdit = true;
      }
    } else if (!util._isEmpty(positionInfo)) {
      positionInfo = JSON.parse(positionInfo);
      mac = positionInfo.mac;
      position = oldFloor = positionInfo.position;
      area = oldArea = positionInfo.area;
      name = oldCode = positionInfo.name;
      floorIndex = this.data.floorArray.indexOf(position);
      areaIndex = this.data.areaArray.indexOf(area);
      isEdit = true;
    }
    if (options.flag == "true") {
      flag = true;
    } else {
      flag = false;
    }
    var btnTitle = "下一步";
    if (options.flag == "true" || isEdit) {
      btnTitle = "确定";
    }
    this.setData({
      flag: flag,
      device: device,
      isEdit: isEdit,
      mac: mac,
      oldMac: mac,
      floorIndex: floorIndex,
      position: position,
      areaIndex: areaIndex,
      area: area,
      name: name,
      oldFloor: oldFloor,
      oldArea: oldArea,
      oldCode: oldCode,
      btnTitle: btnTitle
    })
  },
  _isExist: function (mac) {
    const self = this;
    var flag = false,
      positionList = wx.getStorageSync(constant.POSITION_LIST);
    for (var i in positionList) {
      var item = positionList[i];
      if (item.mac == mac && mac != self.data.oldMac) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  _isCodeExist: function (name) {
    const self = this;
    var flag = false,
      positionList = wx.getStorageSync(constant.POSITION_LIST)
    for (var i in positionList) {
      var item = positionList[i];
      if (item.position == self.data.position && item.area == self.data.area && item.name == name) {
        flag = true;
        break;
      }
    }
    return flag;
  },
  _isEditExist: function (name) {
    const self = this;
    var flag = false;
    if (self.data.position != self.data.oldFloor || self.data.area != self.data.oldArea || name != self.data.oldCode) {
      flag = true;
    }
    return flag;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData(options);
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
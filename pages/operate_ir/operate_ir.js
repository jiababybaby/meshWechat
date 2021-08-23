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

    list_air: [{ color: "#90EE90", name: "开机/关机" }, { color: "#FF0000", name: "风速" }, { color: "#ff0", name: "增大温度" }, { color: "#00ff03", name: "减小温度" }, { color: "#0ff", name: "扫风" }, { color: "#0003ff", name: "风向" }, { color: "#f0f", name: "模式" }],
    list_tv: [{ color: "#90EE90", name: "开机/关机" }, { color: "#FF0000", name: "静音" }, { color: "#ff0", name: "下一频道" }, { color: "#00ff03", name: "上一频道" }, { color: "#0ff", name: "增大音量" }, { color: "#0003ff", name: "减小音量" }, { color: "#f0f", name: "菜单" }],
    list_fan: [{ color: "#90EE90", name: "开" }, { color: "#FF0000", name: "关" }, { color: "#ff0", name: "增大" }, { color: "#00ff03", name: "减小" }, { color: "#f0f", name: "摇头" }],
    list_light: [{ color: "#90EE90", name: "开" }, { color: "#FF0000", name: "关" }, { color: "#ff0", name: "增大" }, { color: "#00ff03", name: "减小" }, { color: "#f0f", name: "模式" }],
   
    coldList: [{ color: "#808080", name: "10%", value: 10 }, { color: "#919191", name: "20%", value: 20 }, { color: "#9f9f9f", name: "30%", value: 30 }, { color: "#bababa", name: "40%", value: 40 }, { color: "#c3c3c3", name: "50%", value: 50 }, { color: "#d6d6d6", name: "70%", value: 70 }, { color: "#e3e3e3", name: "100%", value: 100 }],
    floorIndex: 0,
    floorArray: ["1F", "2F", "3F", "4F", "5F", "6F", "7F", "8F", "9F", "10F", "11F", "12F",
    "13F", "14F", "15F", "16F"],
    kindIndex: 0,
    kindArray: ["空调", "电视", "风扇", "灯具"],   
    name: "",
    position: "",
    kind: "",
    areaArray: ["A", "B", "C", "D", "E", "F", "G"],
    areaIndex: 0,
    floor: "",
    oldFloor: "",
    oldArea: "",
    oldCode: "",
    oldMac: "",
    mac: "",
    flag: true,
    isEdit: false,
    btnTitle: "返回"
  },
  bindViewFloor: function(e) {
    const self = this;
    var position = e.detail.value;
    self.setData({
      position: position,
      floorIndex: self.data.floorArray.indexOf(position)
    })

  },
  bindkindChange: function(e) {
    const self = this;
    var index = e.detail.value;
    var list;
    if(index==0){
      list=self.data.list_air;
    }else if(index==1){
      list=self.data.list_tv;
    }else if(index==2){
      list=self.data.list_fan;
    }else if(index==3){
      list=self.data.list_light;
    }
    this.setData({
      list: list,
      kindIndex: index,
      kind: self.data.kindArray[index]
      // position: self.data.floorArray[index]
    })
  },
  bindNameFloor: function() {
    const self = this;
    var name = e.detail.value;
    self.setData({
      name: name
    })
  },
  setDeviceData: function(num){
    const self=this;
    var device=self.data.device;
    var data={};
    data.data_method="o";
    data.data_num=String(num+1);
    device.device_data=data;
    var send_json={method: "set_device",opid: app.openid, 
    device: device};
    var jsonstr =JSON.stringify(send_json);
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
  },
  setkey: function(e){
    const self = this;
    var num=e.currentTarget.dataset.index;
    self.setDeviceData(num);

  },
  savePosition: function() {
    const self = this;
    self.setNewPosition();//保存
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
    const self = this;
    const eventChannel = self.getOpenerEventChannel()
    eventChannel.on('acceptData', function (data) {
      console.log(data);
      var device = data.data;
      self.setData({
        device: device,
      })
      console.log(self.data.device);
      var kind=parseInt(self.data.device.device_kind)-502,
      name = self.data.device.device_name;
      var list;
      if(kind==0){
        list=self.data.list_air;
      }else if(kind==1){
        list=self.data.list_tv;
      }else if(kind==2){
        list=self.data.list_fan;
      }else if(kind==3){
        list=self.data.list_light;
      }
      self.setData({
        kind: self.data.kindArray[kind],
        list: list,
        name: name,
      })
      var title=device.device_name+device.device_mac;
      wx.setNavigationBarTitle({
        title: title
      });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
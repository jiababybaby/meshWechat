//automationDevices.js
//获取应用实例
const app = getApp();
const util = require('../../../utils/util.js');
import {BLEData} from '../settingDevices.js';
Page({
  data: {
    mesh_id:"",
    mesh_channel:0,
    mode:0,
    ssid: "",
    pwd: "",
    searchName: [],
    deviceList: [],
    searchList: [],
    index:1,
    array: ['WIFI模式', '以太网模式', '4G模式'],
    btnTitle:"下一步",

  },
        //string转ab
  stringToArrayBuffer:  function (str) {
    var bytes = new Array(); 
    var len,c;
    len = str.length;
    for(var i = 0; i < len; i++){
      c = str.charCodeAt(i);
      if(c >= 0x010000 && c <= 0x10FFFF){
        bytes.push(((c >> 18) & 0x07) | 0xF0);
        bytes.push(((c >> 12) & 0x3F) | 0x80);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      }else if(c >= 0x000800 && c <= 0x00FFFF){
        bytes.push(((c >> 12) & 0x0F) | 0xE0);
        bytes.push(((c >> 6) & 0x3F) | 0x80);
        bytes.push((c & 0x3F) | 0x80);
      }else if(c >= 0x000080 && c <= 0x0007FF){
        bytes.push(((c >> 6) & 0x1F) | 0xC0);
        bytes.push((c & 0x3F) | 0x80);
      }else{
        bytes.push(c & 0xFF);
      }
    }
    var array = new Int8Array(bytes.length);
    for(var i in bytes){
      array[i] =bytes[i];
    }
    return array.buffer;
  },
        //ab转string
  arrayBufferToString :function(arr){
    if(typeof arr === 'string') {  
        return arr;  
    }  
    var dataview=new DataView(arr);
    var ints=new Uint8Array(arr.byteLength);
    for(var i=0;i<ints.length;i++){
      ints[i]=dataview.getUint8(i);
    }
    arr=ints;
    var str = '',  
        _arr = arr;  
    for(var i = 0; i < _arr.length; i++) {  
        var one = _arr[i].toString(2),  
            v = one.match(/^1+?(?=0)/);  
        if(v && one.length == 8) {  
            var bytesLength = v[0].length;  
            var store = _arr[i].toString(2).slice(7 - bytesLength);  
            for(var st = 1; st < bytesLength; st++) {  
                store += _arr[st + i].toString(2).slice(2);  
            }  
            str += String.fromCharCode(parseInt(store, 2));  
            i += bytesLength - 1;  
        } else {  
            str += String.fromCharCode(_arr[i]);  
        }  
    }  
    return str; 
  },
  savePosition: function(){
    console.log(this.data.mesh_id);
      // 向蓝牙设备发送一个0x00的16进制数据
    var send_json={mesh_id: this.data.mesh_id,mesh_channel:this.data.mesh_channel,
       mode: this.data.index,ssid:this.data.ssid,pwd:this.data.pwd};
    var jsonstr =JSON.stringify(send_json );
    console.log(send_json);
    console.log(jsonstr);
    var send_mes=this.stringToArrayBuffer(jsonstr);
    console.log(send_mes);
    wx.writeBLECharacteristicValue({
      // 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
      deviceId:BLEData.deviceId,
      // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
      serviceId: BLEData.serviceId,
      // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
      characteristicId: BLEData.write_characteristicId,
      // 这里的value是ArrayBuffer类型
      value: send_mes,
      success (res) {
        console.log('writeBLECharacteristicValue success', res.errMsg)
      },
      fail (res){
        console.log(res);
      }
    })
    wx.closeBLEConnection({
      deviceId:BLEData.deviceId,
      success (res) {
        console.log(res)
      }
    });
    wx.navigateTo({
      url: "/pages/settingDevices/settingDevices",
      success() {
        var page = getCurrentPages().pop();
        if (page == undefined || page == null) return;
        page.onLoad();
      }
    })
  },
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  qrCode: function() {
    const self = this;
    wx.scanCode({
      success(res) {
        var qr = res.result,
          lastNum = qr.lastIndexOf(":");
        if (lastNum > -1) {
          qr = qr.substr((lastNum + 1));
        }
        if (!util._isEmpty(qr)) {
          self.setData({
            meshid: qr.toLowerCase()
          })
        };
      }
    })
  },
  bindMeshId: function(res){
    this.setData({
      mesh_id: res.detail.value
    })
  },
  bindMeshChannel: function(res){
    this.setData({
      mesh_channel: parseInt(res.detail.value)
    })
  },
  bindMode: function(res){
    this.setData({
      mode: res.detail.value,
      index: parseInt(res.detail.value)
    })
  },
  bindSSID: function(res){
    this.setData({
      ssid: res.detail.value
    })
  },
  bindPwd: function(res){
    this.setData({
      pwd: res.detail.value
    })
  },
  onLoad: function () {
    console.log("onLoad")
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("show")
    self=this;
  
    wx.onBLECharacteristicValueChange(function(res) {
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      console.log(res.value)
      var receive_mes=self.arrayBufferToString(res.value);
      console.log(receive_mes);
      var obj = JSON.parse(receive_mes);
      console.log(obj);
      BLEData.mesh_id=obj.mesh_id;
      BLEData.mesh_channel=obj.mesh_channel;
      BLEData.ssid=obj.ssid;
      BLEData.pwd=obj.pwd;
      BLEData.mode=obj.mode;
      console.log(BLEData)  
      self.setData({
        mesh_id:BLEData.mesh_id,
        mesh_channel: BLEData.mesh_channel,
        index:BLEData.mode,
        flag: BLEData.device_class_num,
        pwd:BLEData.pwd,
        ssid:BLEData.ssid,
      });
    });
    this.setData({
      mesh_id:BLEData.mesh_id,
      mesh_channel: BLEData.mesh_channel,
      index:BLEData.mode,
      flag: BLEData.device_class_num
    });
    // wx.openBluetoothAdapter();
    // wx.startBluetoothDevicesDiscovery({
    //   //services: ['FF00'],
    //   success (res) {
    //     console.log(res)
    //   }
    // })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("pull")
  },
  onUnload: function(){
    console.log("setting hide");
    wx.closeBLEConnection({
      deviceId:BLEData.deviceId,
      success (res) {
        console.log(res)
      },
      fail(res){
        console.log(res)
      }
    })
  },
})

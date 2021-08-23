//automationDevices.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const constant = require('../../utils/constant.js');
var BLEData={
  deviceId: "",
  serviceId: "",
  characteristicId: "",
  write_characteristicId: "",
  device_class_num:0,
  mode: 0,
  mesh_id:"",
  mesh_channel:0,
  ssid: "",
  pwd: "",
};
export {BLEData};
Page({
  data: {
    searchName: [],
    deviceList: [],
    searchList: [],
    deviceId: "",
  },
  
  automation: function(event){
    var self = this;
    var index = event.currentTarget.dataset.index;
    var deviceInfo = self.data.searchList[index];
    var deviceId=deviceInfo.deviceId;
    BLEData.device_class=deviceInfo.d_class_num;
    var serviceId;
    var characteristicId;
    var write_characteristicId;
    console.log(index);
    console.log(deviceInfo);
    console.log(deviceId);
    wx.stopBluetoothDevicesDiscovery({
      success (res) {
        console.log(res)
      }
    })
    wx.createBLEConnection({
      deviceId: deviceId,
      success (res) {
        console.log(res);
        wx.setBLEMTU({deviceId: deviceId,
          mtu: 500,
          success(res){
            console.log(res);
          },
          fail(res){
            console.log(res);
          }
        });
        wx.getBLEDeviceServices({
          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
          deviceId: deviceId,
          success (res) {
            console.log('device services:', res.services)
            var i=0;
            var services=res.services;
            for( i in services){
              console.log(services[i]);
              if(services[i].uuid.search("0000FF00")!=-1){
                serviceId=services[i].uuid;
                console.log('device service uuid:', serviceId)
                wx.getBLEDeviceCharacteristics({
                  // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                  deviceId: deviceId,
                  // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
                  serviceId: serviceId,
                  fail (res) {
                    console.log(res);
                  },
                  success (res) {
                    console.log('device getBLEDeviceCharacteristics:', res.characteristics)
                    for(var i in res.characteristics){
                      if(res.characteristics[i].uuid.search("0000FF04")!=-1){
                        characteristicId=res.characteristics[i].uuid;
                        console.log('char  uuid:', characteristicId)
                      }
                      if(res.characteristics[i].uuid.search("0000FF01")!=-1){
                        write_characteristicId=res.characteristics[i].uuid;
                        console.log('write char  uuid:', write_characteristicId)
                      }
                    }
                      BLEData.deviceId=deviceId,
                      BLEData.serviceId=serviceId,
                      BLEData.characteristicId=characteristicId,
                      BLEData.write_characteristicId=write_characteristicId,
                    wx.notifyBLECharacteristicValueChange({
                      state: true, // 启用 notify 功能
                      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                      deviceId: deviceId,
                      // 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
                      serviceId: serviceId,
                      // 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
                      characteristicId: characteristicId,
                      success (res) {
                        console.log('notifyBLECharacteristicValueChange success', res.errMsg)
                        
                      }
                    });
                  }
                  
                });
                break;
              }
            }
          }
        });
       
       
        
      }
    })
    // ArrayBuffer转16进制字符串示例
    function ab2hex(buffer) {
      let hexArr = Array.prototype.map.call(
        new Uint8Array(buffer),
        function(bit) {
          return ('00' + bit.toString(16)).slice(-2)
        }
      )
      return hexArr.join('');
    }
    //string转ab
    function stringToArrayBuffer(str) {
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
    }
    //ab转string
    function arrayBufferToString(arr){
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
  }
    wx.onBLECharacteristicValueChange(function(res) {
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      console.log(res.value)
      var receive_mes=arrayBufferToString(res.value);
      console.log(receive_mes);
      var searchList = [];
      var obj = JSON.parse(receive_mes);
      console.log(obj);
      BLEData.mesh_id=obj.mesh_id;
      BLEData.mesh_channel=obj.mesh_channel;
      BLEData.ssid=obj.ssid;
      BLEData.pwd=obj.pwd;
      BLEData.mode=obj.mode;
      console.log(BLEData)
    })
    wx.navigateTo({
      url: "/pages/settingDevices/settingznwg/settingznwg"
    })
  },
  //搜索
  bindViewSearch: function (e) {
    this.setData({
      searchName: e.detail.value
    })
    this.getSearchList();
  },
  onLoad: function () {
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const self = this;
    wx.openBluetoothAdapter();
    wx.startBluetoothDevicesDiscovery({
      //services: ['FF00'],
      success (res) {
        console.log(res)
      }
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
  const that=this;
  
  wx.onBluetoothDeviceFound(function(res) {
    wx.getBluetoothDevices({
      success: function (res) {
        console.log(res)
        console.log('new device list has founded')
        var searchList=[];
        var devices=res.devices;
        for(var num in devices){
          console.log(devices[num].name);
          console.log(devices[num].localName);
          console.log(devices[num].advertisServiceUUIDs);  
          console.log(ab2hex(devices[num].advertisData))
          var name=devices[num].name;
          var advertisData=ab2hex(devices[num].advertisData);
          var deviceId=devices[num].deviceId;
          var d_class = "";
          var d_class_num=0;
          d_class_num=parseInt(advertisData.slice(4,6),16);
          if(d_class_num==0){
            var icon="icon-wifi";
            var rgb="green";
          }else{
            var icon="icon-dianqi";
            var rgb="blue";
          }
          switch(d_class_num){
            case 0: d_class="网关";
              break;
            case 1: d_class="DHT11温湿度";
              break;
            case 2: d_class="ZP13烟雾";
              break;
            case 3: d_class="ZP15一氧化碳";
              break;
            case 4: d_class="ZH06 PM2.5";
              break;
            case 5: d_class="SGP30 甲醛二氧化碳";
              break;
            case 6: d_class="BLUX30光照度";
              break;
            case 7: d_class="电表";
              break;
            case 8: d_class="水表";
              break;
            case 501: d_class="继电器控制板";
              break;
            case 502: d_class="红外控制板";
              break;

            default:break;
          }
          var manufacture_id=advertisData.slice(0,4);
          console.log(manufacture_id);
          if(name!=""&&manufacture_id=="ffff"){
            var device={class_num:d_class_num,class:d_class,name:name,deviceId:deviceId,
                        icon:icon,rgb: rgb};
            searchList.push(device);
            that.setData({
              searchList: searchList,
            })
          }
          console.log(that.data.searchList);
        }
      }
    })
    // var devices 
    // for(devices in res.devices){
    //   console.log('new device list has founded')
    //   console.log(devices.name);
    //   console.log(devices.localName);
    //   console.log(devices.advertisServiceUUIDs);  
    //   console.log(ab2hex(devices.advertisData))
    //   var name=devices.name;
    //   var advertisData=ab2hex(devices.advertisData);
    //   var searchList =that.data.searchList;
    //   var deviceId=devices.deviceId;
    //   var d_class = "";
    //   var d_class_num=0;
    //   d_class_num=parseInt(advertisData.slice(4,6),16);
    //   switch(d_class_num){
    //     case 0: d_class="网关";
    //       break;
    //     case 1: d_class="DHT11温湿度";
    //       break;
    //     case 2: d_class="ZP13烟雾";
    //       break;
    //     case 3: d_class="ZP15一氧化碳";
    //       break;
    //     case 4: d_class="ZH06 PM2.5";
    //       break;
    //     case 5: d_class="SGP30 甲醛二氧化碳";
    //       break;
    //     case 6: d_class="BLUX30光照度";
    //       break;
    //     case 7: d_class="电表";
    //       break;
    //     case 8: d_class="水表";
    //       break;
    //     default:break;
    //   }
    //   var manufacture_id=advertisData.slice(0,4);
    //   console.log(manufacture_id);
    //   if(name!=""&&manufacture_id=="ffff"){
    //     var device={class_num:d_class_num,class:d_class,name:name,deviceId:deviceId};
    //     searchList.push(device);
    //     that.setData({
    //       searchList: searchList,
    //     })
    //   }
    //   console.log(that.data.searchList);
    // }
  })
  },
  onHide: function(){
    wx.stopBluetoothDevicesDiscovery({
      success (res) {
        console.log(res)
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
   
  }
})

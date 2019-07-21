import WxValidate from '../../utils/WxValidate'
Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    isHideRegistered: false,
    send: false,
    alreadySend: false,
    second: 60,
    disabled: true,
    buttonType: 'default',
    phoneNum: '',
    code: '',
  },
  onLoad: function() {
    var that = this;
    this.initValidate()
    console.log(this.WxValidate)
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          that.getUserInfo()
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          that.setData({
            isHide: true
          });
        }
      }
    });
  },

  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
      that.getUserInfo();
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  getUserInfo() {
    var that = this;
    wx.login({
      success: function(res) {
        var code = res.code; //登录凭证
        if (code) {
          //2、调用获取用户信息接口
          wx.getUserInfo({
            success: function(res) {
              console.log({
                encryptedData: res.encryptedData,
                iv: res.iv,
                code: code
              })
              //3.请求自己的服务器，解密用户信息 获取unionId等加密信息
              wx.request({
                url: 'https://wxapp.zlsf365.com/getOpenId', //自己的服务接口地址
                method: 'POST',
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: {
                  encryptedData: res.encryptedData,
                  iv: res.iv,
                  code: code
                },
                success: function(data) {
                  //4.解密成功后 获取自己服务器返回的结果
                  if (data.data.status == 2) {
                    var userInfo_ = data.data.userInfo;
                    console.log(userInfo_)
                    console.log(data.data.msg)
                    wx.setStorageSync('openId', data.data.openId)
                    that.setData({
                      isHideRegistered: true
                    });
                  } else if (data.data.status == 3) {
                    console.log(data.data.msg)
                    wx.setStorageSync('openId', data.data.openId)
                    wx.setStorageSync('who', data.data.who)
                    wx.redirectTo({
                      url: "../pickup/pickup",
                    })
                  } else {
                    console.log(data.data.msg)
                  }
                },
                fail: function() {
                  console.log('系统错误')
                }
              })
            },
            fail: function() {
              console.log('获取用户信息失败')
            }
          });
        } else {
          console.log('获取用户登录态失败！' + r.errMsg)
        }
      },
      fail: function() {
        console.log('登陆失败')
      }
    })
  },
  // 手机号部分
  inputPhoneNum: function(e) {
    let phoneNum = e.detail.value
    if (phoneNum.length === 11) {
      let checkedNum = this.checkPhoneNum(phoneNum)
      if (checkedNum) {
        this.setData({
          phoneNum: phoneNum
        })
        this.showSendMsg()
        this.activeButton()
      }
    } else {
      this.setData({
        phoneNum: ''
      })
      this.hideSendMsg()
    }
  },

  checkPhoneNum: function(phoneNum) {
    let str = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/
    if (str.test(phoneNum)) {
      return true
    } else {
      wx.showToast({
        title: '手机号不正确',
        image: '../../images/error.png'
      })
      return false
    }
  },

  showSendMsg: function() {
    if (!this.data.alreadySend) {
      this.setData({
        send: true
      })
    }
  },

  hideSendMsg: function() {
    this.setData({
      send: false,
      disabled: true,
      buttonType: 'default'
    })
  },

  sendMsg: function() {
    var phoneNum = this.data.phoneNum;
    var openId = wx.getStorageSync('openId');
    wx.request({
      url: 'https://wxapp.zlsf365.com/sendSMS', //自己的服务接口地址
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        phoneNum: phoneNum,
        openId: openId
      },
      success: function(res) {
        if (res.data.status != 1) {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/error.png'
          })
          return false
        } else {
          this.setData({
            alreadySend: true,
            send: false
          })
          this.timer()
        }
      }
    })
  },

  timer: function() {
    let promise = new Promise((resolve, reject) => {
      let setTimer = setInterval(
        () => {
          this.setData({
            second: this.data.second - 1
          })
          if (this.data.second <= 0) {
            this.setData({
              second: 60,
              alreadySend: false,
              send: true
            })
            resolve(setTimer)
          }
        }, 1000)
    })
    promise.then((setTimer) => {
      clearInterval(setTimer)
    })
  },

  // 其他信息部分
  addOtherInfo: function(e) {
    this.setData({
      otherInfo: e.detail.value
    })
    this.activeButton()
  },

  // 验证码
  addCode: function(e) {
    this.setData({
      code: e.detail.value
    })
    this.activeButton()
  },

  // 按钮
  activeButton: function() {
    let {
      phoneNum,
      code,
      otherInfo
    } = this.data
    if (phoneNum && code && otherInfo) {
      this.setData({
        disabled: false,
        buttonType: 'primary'
      })
    } else {
      this.setData({
        disabled: true,
        buttonType: 'default'
      })
    }
  },

  onSubmit: function(e) {
    const params = e.detail.value;
    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      wx.showToast({
        title: error.msg,
        image: '../../images/error.png',
        // duration:2000,
        mask: true
      })
      return false
    }

    var name = this.data.otherInfo;
    var phone = this.data.phoneNum;
    var vcode = this.data.code;
    var openId = wx.getStorageSync('openId');
    wx.request({
      url: 'https://wxapp.zlsf365.com/vrtifyVode', //自己的服务接口地址
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: name,
        phone: phone,
        vcode: vcode,
        openId: openId
      },
      success: function(res) {
        if (res.data.status != 1) {
          wx.showToast({
            title: res.data.msg,
            image: '../../images/error.png'
          })
          return false
        } else {
          wx.showToast({
            title: res.data.msg
          })
          wx.setStorageSync('who', res.data.who)
          wx.redirectTo({
            url: "../pickup/pickup",
          })

        }
      }
    })
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      name: {
        required: true,
      },
      phone: {
        required: true,
        tel: true
      },
      vcode: {
        required: true,
        minlength: 6,
        maxlength: 6
      }
    }

    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      name: {
        required: '请输入姓名',
      },
      phone: {
        required: '请输入手机号',
        tel: '手机号错误'
      },
      vcode: {
        required: '请输入验证码',
        minlength: '验证码错误',
        maxlength: '验证码错误',
      }
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  }
})
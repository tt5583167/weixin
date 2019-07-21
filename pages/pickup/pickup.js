import WxValidate from '../../utils/WxValidate'

Page({
  data: {
    multiArray: [
      [1],
      [1]
    ],
    val: [ // 数据列表
      [{
        "k": "0021SH",
        "v": "上海"
      }, {
        "k": "0020GZ1",
        "v": "广州白云区"
      }],
      [{
        "k": "0514YZ",
        "v": "扬州市"
      }, {
        "k": "0511ZJ",
        "v": "镇江市"
      }]
    ],
    value: [0, 0],
    index: 0,
    focus: false,
    inputValue: '',
    stopStart: '',
    stopTerminal: '',
    showWin: true,
    showStop: '点击选择起始站到达站'
  },
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },
  finishHandler(e) {
    this.setData({
      showStop: e.detail[0].v + "到" + e.detail[1].v,
      stopStart: e.detail[0].k,
      stopTerminal: e.detail[1].k
    })
  },
  selsect: function() {
    this.setData({
      showWin: false //控制弹窗隐藏显示
    })
  },
  onLoad: function() {
    this.getdata();
    this.initValidate()
    console.log(this.WxValidate)

  },
  getdata: function() { //定义函数名称
    var that = this; // 这个地方非常重要，重置data{}里数据时候setData方法的this应为以及函数的this, 如果在下方的sucess直接写this就变成了wx.request()的this了
    wx.request({
      url: 'https://wxapp.zlsf365.com/getStopList', //请求地址
      // data: { //发送给后台的数据
      //   name: "bella",
      //   age: 20
      // },
      header: { //请求头
        "Content-Type": "applciation/json"
      },
      method: "GET", //get为默认方法/POST
      success: function(res) {
        // console.log(res.data); //res.data相当于ajax里面的data,为后台返回的数据
        that.setData({ //如果在sucess直接写this就变成了wx.request()的this了.必须为getdata函数的this,不然无法重置调用函数
          val: [res.data, res.data]
        })
      },
      fail: function(err) {}, //请求失败
      complete: function() {} //请求完成后执行的函数
    })
  },
  formSubmit: function(e) {
    const params = e.detail.value;
    console.log(params)

    // 传入表单数据，调用验证方法
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    params.who = wx.getStorageSync('who');
    
    wx.request({
      // url: 'http://zlsf365.com:8081/sumbitPickUp',
      url: 'https://wxapp.zlsf365.com/sumbitPickUp',
      data: params,
      method: 'POST',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        console.log(res)
        this.showModal({
          msg: '提交成功',
        })
      }
    })
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      van_key: {
        required: true,
      },
      // doc_pcs: {
      //   required: true,
      // },
      // doc_wgt: {
      //   required: true,
      // },
      // doc_cube: {
      //   required: true,
      // },
      stop_start: {
        required: true,
      },
      stop_terminal: {
        required: true,
      },
      shipperaddress: {
        required: true,
      },
      consigneeaddress: {
        required: true,
      },

    }

    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      van_key: {
        required: '请输入车牌',
      },
      // doc_pcs: {
      //   required: '请输入件数',
      // },
      // doc_wgt: {
      //   required: '请输入重量',
      // },
      // doc_cube: {
      //   required: '请输入体积',
      // },
      stop_start: {
        required: '请选择起始站',
      },
      stop_terminal: {
        required: '请选择到达站',
      },
      shipperaddress: {
        required: '请输入发货地址',
      },
      consigneeaddress: {
        required: '请输入收货地',
      },
    }

    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  }
})
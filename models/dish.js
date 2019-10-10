let mongoose = require('mongoose')
let Schema = mongoose.Schema
require('mongoose-currency').loadType(mongoose)
const Currency = mongoose.Types.Currency
const config = require('../config')

let commentSchema = new Schema({
  videoRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  odourRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  tasteRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 200
  },
  auther: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
{
  timestamps: true
})

let dishSchema = new Schema({
  // 图片 * 3
  // 名称
  // 说明
  // 口味
  // 价格
  // 配料
  // 评论
  // 在架状态
  // 删除状态
  // 种类
  // 菜系
  // images: {
  //   type: Array,
  //   default: []
  // },
  // 3个图片至少有一个
  imageBig: {
    type: String,
    default: ''
  },
  imageMiddle: {
    type: String,
    default: ''
  },
  imageSmall: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  taste: {
    type: Number,
    required: true,
    validate: value => {
      return config.tasteGrade.some(item => {
        return item.value === value
      })
    }
  },
  price: {
    type: Currency,
    required: true,
    min: 0
  },
  compose: {
    type: String,
    required: true,
    default: ''
  },
  comments: [commentSchema],
  status: {
    type: Boolean,
    required: true,
    default: false
  },
  delete: {
    type: Boolean,
    default: false
  },
  category: {
    type: Number,
    required: true,
    validate: value => {
      return config.dishCategory.some(item => {
        return item.value === value
      })
    }
  },
  series: {
    type: Number,
    required: true,
    validate: value => {
      return config.dishSeries.some(item => {
        return item.value === value
      })
    }
  },
}, {
  timestamps: true
})

const Dishes = mongoose.model('Dish', dishSchema)
module.exports = Dishes
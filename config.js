module.exports = {
  'secretKey': '12345-67890-09876-54321',
  'mongoUrl': 'mongodb://localhost:27017/dish',
  dishCategory: [ // 预计有999种菜品
    {
      label: '热菜',
      value: 100
    },
    {
      label: '冷菜',
      value: 200
    }
  ],
  dishSeries: [
    {
      label: '鲁菜',
      value: 100
    },
    {
      label: '川菜',
      value: 200
    },
    {
      label: '粤菜',
      value: 300
    },
    {
      label: '苏菜',
      value: 400
    },
    {
      label: '闽菜',
      value: 500
    },
    {
      label: '浙菜',
      value: 600
    },
    {
      label: '湘菜',
      value: 700
    },
    {
      label: '徽菜',
      value: 800
    }
  ],
  tasteGrade: [
    {
      label: '轻度酸',
      value: 100
    },
    {
      label: '中度酸',
      value: 101
    },
    {
      label: '重度酸',
      value: 102
    },
    {
      label: '轻度甜',
      value: 200
    },
    {
      label: '中度甜',
      value: 201
    },
    {
      label: '重度甜',
      value: 202
    },
    {
      label: '轻度苦',
      value: 300
    },
    {
      label: '中度苦',
      value: 301
    },
    {
      label: '重度苦',
      value: 302
    },
    {
      label: '轻度辣',
      value: 400
    },
    {
      label: '中度辣',
      value: 401
    },
    {
      label: '重度辣',
      value: 402
    },
    {
      label: '轻度咸',
      value: 500
    },
    {
      label: '中度咸',
      value: 501
    },
    {
      label: '重度咸',
      value: 502
    }
  ],
  imageExtend: ['jpg', 'jpeg', 'png', 'gif']
}
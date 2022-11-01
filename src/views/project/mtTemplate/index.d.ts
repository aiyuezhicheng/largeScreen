export type Chartype = {
  id:  string
  projectName: string // 标题
  image: string, // 预览图地址
  content: Object // 画布内容
}

export type ChartList = Chartype[]
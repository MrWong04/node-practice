/**
 * @description: 格式化价格类型
 * @param {string} type - 格式化类型：'price'或'unit'
 * @param {number} value - 价格类型编号
 * @return {string} 格式化后的文本
 */
export const formatPriceType = (type: 'price' | 'unit', value: number): string => {
  const format: Record<'price' | 'unit', Record<number, string>> = {
    price: {
      1: '一次性费用',
      2: '月租费用',
      3: '年费费用'
    },
    unit: {
      1: '元',
      2: '元/月',
      3: '元/年'
    }
  }
  return format[type]?.[value] || ''
}

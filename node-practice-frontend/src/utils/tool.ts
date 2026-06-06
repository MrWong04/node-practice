/**
 * @author jiangxiaoling
 * @date   22.11.30
 * @description   内容块/栏目工具
 */

// import request from './request'

// 内容块的组件映射
// 组件名字改成Ecui的已经完成迁移
const BLOCK_MAP = {
  1: 'EcuiHeaderIcon',
  2: 'EcuiBlockNavigation',
  3: 'EcuiBanner',
  4: 'EcuiToDo',
  5: 'EcuiNotice',
  6: 'EcuiSpecialArea',
  7: 'EcuiActivitySingle',
  8: 'EcuiActivitySet',
  9: 'EcuiActivityGoods',
  10: 'EcuiTextTitle',
  11: 'EcuiNewsPanel',
  12: 'EcuiLabourUnionActivity', // 已下线
  13: 'EcuiQuestionnaire', // 已下线
  14: 'EcuiSeat',
  15: 'EcuiMyTips',
  16: 'EcuiMyHeader',
  17: 'EcuiMyCarePoint',
  18: 'EcuiMyGrowPoint',
  19: 'EcuiMyUnionPoint',
  20: 'EcuiMyOrder',
  21: 'EcuiWelfarePoint',
  22: 'EcuiPhotoWall',
  23: 'EcuiPageImgWall',
  24: 'EcuiActivityList',
  25: 'EcuiClubInfo',
  26: 'EcuiClubWindow',
  27: 'EcuiPointRank',
  28: 'EcuiHotShelf',
  29: 'EcuiShoppingArea',
  30: 'EcuiMyUnionSaasPoint',
  31: 'EcuiListNavigation',
  32: 'EcuiActivitySingleHongjiu',
  33: 'EcuiActivityGoodsHongjiu',
  34: 'EcuiHotShelfHongjiu',
  35: 'EcuiShoppingAreaHongjiu',
  36: 'EcuiActivitySingleFupin',
  37: 'EcuiActivityGoodsFupin',
  38: 'EcuiHotShelfFupin',
  39: 'EcuiShoppingAreaFupin',
  40: 'EcuiSelectionList',
  41: 'EcuiUnionPointsRanking',
  44: 'EcuiGoodsCard',
  45: 'EcuiContent'
}

// 主题背景图
const THEME_BG = {
  1: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/default-theme-bg-1.png', // 默认首页
  2: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/default-theme-bg-2.png', // 默认通用
  3: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/default-theme-bg-3.png', // 默认我的
  4: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/festival-theme-bg-1.png', // 春节首页
  5: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/festival-theme-bg-2.png', // 春节通用
  6: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/festival-theme-bg-3.png', // 春节我的
  7: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/blue-theme-bg-1.png', // 工会首页
  8: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/blue-theme-bg-2.png', // 工会通用
  9: 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/blue-theme-bg-3.png' // 工会我的
}

// 默认内容块
// const BLOCK_MAP_DEFAULT = 'BlockUnknow'
// // 默认内容块编辑器
// const BLOCK_EDITOR_MAP_DEFAULT = 'BlockEditor'
// 默认栏目
const COLUMN_MAP_DEFAULT = 'ColumnOne'

// 根据id获取栏目component 目前就只有一个
export function getColumnById() {
  return COLUMN_MAP_DEFAULT
}

// 根据id获取内容块component
export function getBlockById(id: keyof typeof BLOCK_MAP) {
  return BLOCK_MAP[id] ? BLOCK_MAP[id] : COLUMN_MAP_DEFAULT
}

// 根据门户主题获取对应主题背景图
export function getBackgroundTemplate(id: keyof typeof THEME_BG) {
  return THEME_BG[id]
    ? THEME_BG[id]
    : 'https://bucket-aplus-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/care/default-theme-bg-1.png'
}

// 根据id获取内容块编辑器component
// export function getBlockEditorById (id) {
//     // console.log('getBlockEditorById called, id', id)
//     return BLOCK_EDITOR_MAP[id] ? BLOCK_EDITOR_MAP[id] : BLOCK_EDITOR_MAP_DEFAULT
// }

// 解析获取block数据
// export function getBlock (data) {
//     const res = {
//         blockType: '',
//         blockConfig: []
//     }
//     if (data.blockVo && data.blockVo[0]) {
//         res.blockType = data.blockVo[0].blockType
//         res.blockConfig = data.blockVo
//     }
//     return res
// }

// 站点管理 - 解析出UI模块
export function getContentBlock(data, portalTheme) {
  console.log('解析', data)
  const res = {
    blockType: '',
    blockConfig: []
  }
  if (data && data.columnType) {
    res.blockType = data.columnType
    // 给每个组件数据带上门户主题
    data.blockList[0].portalThemeId = portalTheme
    res.blockConfig = data.blockList
  }
  return res
}

// 站点管理 - 根据栏目数据获取编辑器数据（编辑）
// export function getColumnConfig (columnData) {
//     const res = {
//         columnType: columnData.columnType,
//         blockList: []
//     }
//     try {
//         columnData.blockList.map((item) => {
//             const blockConfig = item.blockConfig || ''
//             const dataJSON = JSON.parse(blockConfig)
//             const editorConfig = dataJSON.editorConfig || {}
//             // res.editorConfig = editorConfig
//             // const models = { ...item }
//             // delete models.blockConfig
//             const models = {}
//             // 补充个性化字段
//             if (editorConfig.models && editorConfig.models.length > 0) {
//                 editorConfig.models.map((item) => {
//                     models[item.prop] = item.value
//                 })
//             }
//             // item.models = models
//             res.blockList.push(models)
//         })
//     } catch (err) {
//         // console.warn('getEditorConfig JSON.parse err, blockData =', blockData)
//         // const models = { ...blockData }
//         // delete models.blockConfig
//         // res.models = models
//     }
//     return res
// }

// 根据id获取内容块styleConfig
// export function getBlockStyle (id) {

// }

// 根据内容块数据获取编辑器数据（编辑）
// export function getEditorConfig (blockData) {
//     const res = {
//         blockType: blockData.blockType,
//         models: {}
//     }
//     try {
//         const blockConfig = blockData.blockConfig || ''
//         const dataJSON = JSON.parse(blockConfig)
//         const editorConfig = dataJSON.editorConfig || {}
//         res.editorConfig = editorConfig

//         const models = { ...blockData }
//         delete models.blockConfig

//         // 补充个性化字段
//         if (editorConfig.models && editorConfig.models.length > 0) {
//             editorConfig.models.map((item) => {
//                 models[item.prop] = item.value
//             })
//         }
//         res.models = models
//     } catch (err) {
//         console.warn('getEditorConfig JSON.parse err, blockData =', blockData)
//         const models = { ...blockData }
//         delete models.blockConfig
//         res.models = models
//     }
//     return res
// }

// 根据内容块数据获取编辑器数据（新增）
// export function getModelByFormItems (blockType, formItems) {
//     let res = {}
//     const models = {
//     // colId: '',
//     // blockId: '',
//     // onlineInd: '',
//     // pageId: '',
//         blockDesc: '',
//         blockName: '',
//         blockType: blockType,
//         image: '',
//         url: ''
//     }
//     try {
//     // 处理表单的个性化字段
//         res = handleFormCustomItems(formItems, models)
//     } catch (err) {
//         console.warn('getEditorConfig JSON.parse err', err)
//     }
//     return res
// }

// 处理表单的个性化字段 移动到modeles.extend属性下
// export function handleFormCustomItems (formItems, models) {
//     // 补充个性化字段
//     if (formItems && formItems.length > 0) {
//         models.extend = []

//         formItems.map((item) => {
//             // 排除基础字段
//             if (models[item.prop] === undefined) {
//                 models[item.prop] = ''
//                 models.extend.push({
//                     prop: item.prop,
//                     value: ''
//                 })
//             }
//         })
//     }
//     return models
// }

// 处理model个性化字段 移动到modeles.extend属性下
// export function handleModelCustomItems (models) {
//     // 默认字段Map
//     const baseItemMap = [
//         'extend',
//         'blockId',
//         'blockName',
//         'blockType',
//         'colId',
//         'image',
//         'onlineInd',
//         'pageId',
//         'url'
//     ]
//     // 补充个性化字段
//     models.extend = []

//     for (const key in models) {
//         if (baseItemMap.indexOf(key) === -1 && models[key]) {
//             models.extend.push({
//                 prop: key,
//                 value: models[key]
//             })
//         }
//     }
//     if (models.extend.length === 0) {
//         delete models.extend
//     }

//     return models
// }

// 根据内容块数据解析blockConfig并返回内容块数据
// export function getBlockConfig (blockData) {
//     const res = { ...blockData }
//     const blockConfig = {
//         styleConfig: {},
//         dataConfig: {}
//     }
//     try {
//         const dataJSON = JSON.parse(blockData.blockConfig)
//         const styleConfig = dataJSON.styleConfig
//         const dataConfig = dataJSON.dataConfig
//         blockConfig.styleConfig = styleConfig
//         blockConfig.dataConfig = dataConfig
//     } catch (err) {
//         console.warn('getBlockConfig JSON.parse err', err)
//     }
//     res.blockConfig = blockConfig
//     return res
// }

// 请求外部接口
// export function apiRequest ({ url, method, headers, data, params }) {
//     const requestData = {
//         url,
//         method
//     }
//     if (data) requestData.data = data
//     if (params) requestData.params = params
//     if (headers) requestData.headers = headers
//     return request(requestData)
// }

export function isIE() {
  return !!window.ActiveXObject || 'ActiveXObject' in window
}

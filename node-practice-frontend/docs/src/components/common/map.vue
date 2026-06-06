<template>
  <div id="container" v-show="false"></div>
</template>

<script setup lang="js">
import { onMounted, onUnmounted } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
const emit = defineEmits(['LComplete','LError'])
window._AMapSecurityConfig = {
  securityJsCode: '281b69c469626796e9060776d6025da7'
}
let map = null
onMounted(() => {
  AMapLoader.load({
    key: '22c5e20af07191e59c49faa4dbaeec7d', // 申请好的Web端开发者Key，首次调用 load 时必填
    version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then((AMap) => {
      map = new AMap.Map('container', {
        // 设置地图容器id
        // viewMode: '3D', // 是否为3D地图模式
        zoom: 11 // 初始化地图级别
        // center: [116.397428, 39.90923] // 初始化地图中心点位置
        //
      })
      // AMap.plugin('AMap.CitySearch', function () {
      //   const citySearch = new AMap.CitySearch()
      //   citySearch.getLocalCity((status, result) => {
      //     // alert(result)
      //     console.log(status)
      //     console.log()
      //     if (status === 'complete' && result.info === 'OK') {
      //       // 查询成功，result即为当前所在城市信息
      //     }
      //   })
      // })
      AMap.plugin('AMap.Geolocation', function () {
        var geolocation = new AMap.Geolocation({
          enableHighAccuracy: false, // 是否使用高精度定位，默认：true
          timeout: 3000, // 设置定位超时时间，默认：无穷大
          needAddress: true, //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          // position: 'RB', //  定位按钮的排放位置,  RB表示右下
        })

        geolocation.getCurrentPosition(function (status, result) {
          if (status == 'complete') {
            onComplete(result)
          } else {
            onError(result)
          }
        })

        function onComplete(data) {
          emit('LComplete',data.addressComponent)
          console.log(data.addressComponent)
          // data是具体的定位信息
        }

        function onError(data) {
          emit('LError',data)
          // 定位出错
        }
      })
    })
})
// const openLocation = () => {
//
// }
onUnmounted(() => {
  map?.destroy()
})
</script>

<style scoped>
#container {
  width: 100%;
  height: 800px;
}
</style>

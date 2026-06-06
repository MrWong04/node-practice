<template>
  <div class="list">
    <div class="list__item">
      <div
        class="list__item--info"
        v-for="(item, index) in goodsList"
        :key="index"
        @click="handleGoDetail(item.goodsId)"
      >
        <img
          :src="item.productPics ? item.productPics[0] : ''"
          class="list__item--info__img"
          alt=""
        />
        <div class="list__item--info__text">
          <p class="title">{{ item.goodsName }}</p>
          <div class="price" v-if="item.priceNegotiable !== 1">
            <i>￥</i>{{ item.price }}<span>{{ $priceTypeFormat('unit', item.chargeMethod) }}</span>
          </div>
          <div class="price" v-else>面议</div>
          <!--              <div class="type">{{ item.category }}</div>-->
          <div class="desc">收费模式：{{ $priceTypeFormat('price', item.chargeMethod) }}</div>
          <div></div>
        </div>
        <div class="list__item--info__btn" @click="handleGoDetail(item.goodsId)">提交意向</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const router = useRouter()
const props = defineProps(['goodsList'])

// 商品详情跳转
const handleGoDetail = (id: any) => {
  router.push({
    path: '/productDetail',
    query: {
      id: id
    }
  })
}
</script>

<style lang="scss">
.list {
  display: block;
  margin: 0 auto;
  width: 702px;
  .list__item {
    display: flex;
    flex-wrap: wrap;
    gap: 24px 22px;
    &--info {
      width: 340px;
      position: relative;
      background: #fff;
      border-radius: 12px;
    }
    &--info__img {
      width: 340px;
      height: 340px;
    }
    &--info__text {
      padding: 20px 0 16px 24px;

      .title {
        display: block;
        font-weight: 400;
        font-size: 28px;
        color: #000000;
        line-height: 38px;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .price {
        padding-top: 12px;
        color: #f62c30;
        font-size: 32px;
        font-weight: 600;
        padding-bottom: 10px;
        i {
          color: #f62c30;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 0;
        }
      }
      .type {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 112px;
        height: 38px;
        margin: 12px 0;
        background: #fef8e1;
        border-radius: 8px;
        font-weight: 400;
        font-size: 22px;
        color: var(--primary-color);
      }
      .desc {
        font-weight: 400;
        font-size: 22px;
        color: #999999;
      }
    }
    &--info__btn {
      display: block;
      width: 200px;
      height: 48px;
      line-height: 47px;
      float: right;
      margin: 0 24px 32px 0;
      background: var(--primary-color);
      font-weight: 400;
      font-size: 26px;
      color: #ffffff;
      text-align: center;
      border-radius: 38px;
    }
  }
}
</style>

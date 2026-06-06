<template>
  <div class="recommend-section">
    <div class="product-list">
      <div
        class="product-item"
        v-for="item in products"
        :key="item.id"
        @click="handleItemClick(item)"
      >
        <img :src="item.image" :alt="item.name" class="product-image" />
        <div class="product-info">
          <div class="product-name">{{ item.name }}</div>
          <div class="product-price">
            <span class="price">{{ item.price }}元/月</span>
            <div class="stats">
              <span class="comment">{{ item.commentCount }}条评论</span>
              <span class="rate">{{ item.likeRate }}%好评</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <van-loading v-if="loading" class="loading">加载中...</van-loading>
    <van-empty v-if="!loading && products.length === 0" description="暂无推荐商品" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

interface Product {
  id: number | string
  name: string
  description: string
  image: string
  price: string | number
  commentCount: number
  likeRate: number
  tag?: string
}

interface Props {
  showMore?: boolean
  initialProducts?: Product[]
}

const props = withDefaults(defineProps<Props>(), {
  showMore: false,
  initialProducts: () => []
})

const emit = defineEmits(['more', 'item-click'])

const router = useRouter()
const loading = ref(false)
const products = ref<Product[]>([
  {
    id: 'spu0000370',
    name: 'ITS悦享包',
    description: 'ITS悦享包',
    image:
      'https://bucket-zxq-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/diancan/upload/2025-04-29/e5da51ebf15f44cc9919cd0a48e8acf3.jpg',
    price: '400.00',
    commentCount: 100,
    likeRate: 93,
    tag: 'IT服务专家'
  },
  {
    id: 'spu0000369',
    name: 'ITS必享包',
    description: 'ITS必享包',
    image:
      'https://bucket-zxq-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/diancan/upload/2025-04-29/1dc243661890433bb6b4293b4799b138.jpg',
    price: '265.00',
    commentCount: 100,
    likeRate: 98,
    tag: 'ITS必享包'
  },
  {
    id: 'spu0000367',
    name: 'ITS专享包',
    description: 'ITS专享包',
    image:
      'https://bucket-zxq-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/diancan/upload/2025-04-29/3ffb14c254414bf9a5786907f3ea10e1.jpg',
    price: '85.00',
    commentCount: 100,
    likeRate: 99,
    tag: 'ITS专享包'
  },
  {
    id: 'spu0000368',
    name: 'ITS尊享包',
    description: 'ITS尊享包',
    image:
      'https://bucket-zxq-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/diancan/upload/2025-04-29/bbf8f87326684ba1b2290fa58e18c580.jpg',
    price: '130.00',
    commentCount: 100,
    likeRate: 99,
    tag: 'ITS尊享包'
  },
  {
    id: 'spu0000365',
    name: 'ITS体验包',
    description: 'ITS体验包',
    image:
      'https://bucket-zxq-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/diancan/upload/2025-04-29/39bdf0fe01444912821dc8f3c224ceb8.jpg',
    price: '16.00',
    commentCount: 100,
    likeRate: 99,
    tag: 'ITS体验包'
  },
  {
    id: 'spu0000366',
    name: 'ITS优享包',
    description: 'ITS优享包',
    image:
      'https://bucket-zxq-file-public-prod-1.oss-cn-shenzhen.aliyuncs.com/diancan/upload/2025-04-29/b9ff9ec1ad7e45239391e27fc3a0c6e7.jpg',
    price: '45.00',
    commentCount: 100,
    likeRate: 99,
    tag: 'ITS优享包'
  }
])

const page = ref(1)
const pageSize = 10
let hasMore = ref(true)

// 处理商品点击
const handleItemClick = (item: Product) => {
  emit('item-click', item)
  router.push({
    path: '/productDetail',
    query: {
      id: item.id
    }
  })
  // router.push(`/product/detail/${item.id}`)
}

// 加载更多数据
const loadMore = async () => {
  if (!hasMore.value || loading.value) return

  loading.value = true
  try {
    // 这里替换为实际的API调用
    // const res = await getRecommendProducts({ page: page.value, pageSize })
    // const newProducts = res.data.list
    // hasMore.value = newProducts.length === pageSize
    // products.value.push(...newProducts)
    // page.value++

    // 模拟加载更多数据
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newProducts = [...products.value]
    products.value.push(...newProducts)
    hasMore.value = products.value.length < 20 // 模拟最多加载20条数据
    page.value++
  } catch (error) {
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 监听滚动到底部
const setupInfiniteScroll = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    },
    { threshold: 0.1 }
  )

  const target = document.querySelector('.loading')
  if (target) {
    observer.observe(target)
  }

  onUnmounted(() => {
    observer.disconnect()
  })
}

onMounted(() => {
  if (props.initialProducts.length > 0) {
    products.value = props.initialProducts
  }
  setupInfiniteScroll()
})
</script>

<style lang="scss" scoped>
// 文本省略混入 - 移到最前面
@mixin text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 多行文本省略混入
@mixin text-ellipsis-multi($lines) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommend-section {
  border-radius: 16px;
  margin: 24px 0;

  .section-title {
    padding: 24px;
    font-size: 32px;
    font-weight: 500;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .product-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;

    .product-item {
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      border-radius: 12px;

      .product-image {
        position: relative;
        width: 100%;
        height: 342px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 12px 12px 0 0;
        overflow: hidden;
      }

      .product-info {
        padding: 16px;

        .product-name {
          font-weight: 400;
          font-size: 34px;
          color: #181818;
          @include text-ellipsis;
        }

        .product-price {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .price {
            font-size: 32px;
            margin: 18px 0;
            color: var(--primary-color);
          }

          .stats {
            display: flex;
            gap: 12px;
            color: #999;
            font-size: 22px;
            @include text-ellipsis;
          }
        }
      }

      &:active {
        transform: scale(0.98);
        transition: transform 0.2s ease;
      }
    }
  }

  .loading {
    padding: 24px;
    text-align: center;
    color: #999;
  }
}

// 添加响应式布局
@media screen and (max-width: 375px) {
  .recommend-section {
    margin: 12px;

    .product-list {
      padding: 0 8px;
      gap: 16px;
      padding-bottom: 16px;

      .product-item {
        .product-image {
          height: 280px;
        }

        .product-info {
          padding: 12px;

          .product-name {
            font-size: 26px;
          }

          .product-desc {
            font-size: 22px;
            min-height: 66px;
          }

          .product-price {
            .price {
              font-size: 28px;
            }

            .stats {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
}
</style>

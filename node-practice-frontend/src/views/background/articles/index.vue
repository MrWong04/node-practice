<template>
  <div class="articles-view">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章管理</span>
          <el-button type="primary" size="small" @click="goToCreate">新增文章</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="标题或描述"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="filters.categoryId" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select v-model="filters.tagId" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="item in tagOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="articles" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.category"
              size="small"
              type="info"
              class="clickable-tag"
              @click="openCategoryDialog(row)"
              >{{ row.category.name }}</el-tag
            >
            <span v-else class="text-gray clickable-tag" @click="openCategoryDialog(row)">—</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="120">
          <template #default="{ row }">
            <el-tag
              v-for="tag in row.tags"
              :key="tag.id"
              size="small"
              class="tag-item clickable-tag"
              @click="openTagDialog(row)"
            >
              {{ tag.name }}
            </el-tag>
            <span
              v-if="!row.tags || row.tags.length === 0"
              class="text-gray clickable-tag"
              @click="openTagDialog(row)"
              >—</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="180">
          <template #default="{ row }">
            {{ row.authorName }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goToEdit(row.id)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @current-change="fetchArticles"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 分类弹窗 -->
    <el-dialog v-model="categoryDialogVisible" title="修改分类" width="400px" destroy-on-close>
      <el-select
        v-model="selectedCategoryId"
        placeholder="请选择分类"
        clearable
        style="width: 100%"
      >
        <el-option
          v-for="item in categoryOptions"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateCategory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 标签弹窗 -->
    <el-dialog v-model="tagDialogVisible" title="修改标签" width="400px" destroy-on-close>
      <el-select v-model="selectedTagIds" multiple placeholder="请选择标签" style="width: 100%">
        <el-option v-for="item in tagOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <template #footer>
        <el-button @click="tagDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateTags">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllPostsApi, deletePostApi, updatePostApi, type Post } from '@/api/article'
import { getAllCategoriesApi, type Category } from '@/api/category'
import { getAllTagsApi, type Tag } from '@/api/tag'

const router = useRouter()
const route = useRoute()
const articles = ref<Post[]>([])
const categoryOptions = ref<Category[]>([])
const tagOptions = ref<Tag[]>([])
const loading = ref(false)

const filters = reactive({
  keyword: '',
  categoryId: undefined as number | undefined,
  tagId: undefined as number | undefined
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关状态
const categoryDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const currentEditRow = ref<Post | null>(null)
const selectedCategoryId = ref<number | null>(null)
const selectedTagIds = ref<number[]>([])

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN')
}

function buildQueryParams() {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {}),
    ...(filters.categoryId !== undefined ? { categoryId: filters.categoryId } : {}),
    ...(filters.tagId !== undefined ? { tagId: filters.tagId } : {})
  }
}

async function fetchFilterOptions() {
  try {
    const [categoryRes, tagRes] = await Promise.all([
      getAllCategoriesApi({ pageSize: 100 }),
      getAllTagsApi({ pageSize: 100 })
    ])
    if (categoryRes.success) {
      categoryOptions.value = categoryRes.data.items
    }
    if (tagRes.success) {
      tagOptions.value = tagRes.data.items
    }
  } catch {
    // 筛选项加载失败不阻塞列表
  }
}

async function fetchArticles() {
  loading.value = true
  try {
    const res = await getAllPostsApi(buildQueryParams())
    if (res.success) {
      articles.value = res.data.items
      pagination.total = res.data.pagination.total
    }
  } catch {
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchArticles()
}

function handleReset() {
  filters.keyword = ''
  filters.categoryId = undefined
  filters.tagId = undefined
  pagination.page = 1
  fetchArticles()
}

function handleSizeChange() {
  pagination.page = 1
  fetchArticles()
}

function goToCreate() {
  router.push('/background/content/articles/create')
}

function goToEdit(id: number) {
  router.push(`/background/content/articles/edit/${id}`)
}

async function handleDelete(row: Post) {
  try {
    await ElMessageBox.confirm('确认删除该文章？', '提示', { type: 'warning' })
    const res = await deletePostApi(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchArticles()
    }
  } catch {
    // 取消删除或删除失败
  }
}

// 打开分类弹窗
function openCategoryDialog(row: Post) {
  currentEditRow.value = row
  selectedCategoryId.value = row.category?.id ?? null
  categoryDialogVisible.value = true
}

// 打开标签弹窗
function openTagDialog(row: Post) {
  currentEditRow.value = row
  selectedTagIds.value = row.tags.map((tag) => tag.id)
  tagDialogVisible.value = true
}

// 确认更新分类
async function confirmUpdateCategory() {
  if (!currentEditRow.value) return
  try {
    const res = await updatePostApi(currentEditRow.value.id, {
      categoryId: selectedCategoryId.value
    })
    if (res.success) {
      ElMessage.success('分类更新成功')
      categoryDialogVisible.value = false
      fetchArticles()
    }
  } catch {
    ElMessage.error('分类更新失败')
  }
}

// 确认更新标签
async function confirmUpdateTags() {
  if (!currentEditRow.value) return
  try {
    const res = await updatePostApi(currentEditRow.value.id, {
      tagIds: selectedTagIds.value
    })
    if (res.success) {
      ElMessage.success('标签更新成功')
      tagDialogVisible.value = false
      fetchArticles()
    }
  } catch {
    ElMessage.error('标签更新失败')
  }
}

onMounted(async () => {
  await fetchFilterOptions()
  // 从 URL query 参数读取筛选条件
  const { categoryId, tagId } = route.query
  if (categoryId) {
    filters.categoryId = Number(categoryId)
  }
  if (tagId) {
    filters.tagId = Number(tagId)
  }
  fetchArticles()
})
</script>

<style scoped lang="scss">
.articles-view {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
  }

  .filter-form {
    margin-bottom: 16px;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .tag-item {
    margin-right: 4px;
    margin-bottom: 2px;
  }

  .text-gray {
    color: #909399;
  }

  .clickable-tag {
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>

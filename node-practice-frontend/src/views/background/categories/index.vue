<template>
  <div class="categories-view">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" size="small" @click="openCreateDialog">新增分类</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="名称或简称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="categories" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="分类名称" min-width="120" />
        <el-table-column prop="slug" label="简称" min-width="120" />
        <el-table-column prop="_count.posts" label="文章数" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToArticles(row.id)">
              {{ row._count?.posts || 0 }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)"
              >编辑</el-button
            >
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
          @current-change="fetchCategories"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="简称" prop="slug">
          <el-input v-model="form.slug" placeholder="可选，未填写则自动生成" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getAllCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  type Category
} from '@/api/category'

const router = useRouter()

const categories = ref<Category[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref<number | null>(null)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const filters = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  name: '',
  slug: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN')
}

function buildQueryParams() {
  return {
    page: pagination.page,
    pageSize: pagination.pageSize,
    ...(filters.keyword.trim() ? { keyword: filters.keyword.trim() } : {})
  }
}

async function fetchCategories() {
  loading.value = true
  try {
    const res = await getAllCategoriesApi(buildQueryParams())
    if (res.success) {
      categories.value = res.data.items
      pagination.total = res.data.pagination.total
    }
  } catch {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchCategories()
}

function handleReset() {
  filters.keyword = ''
  pagination.page = 1
  fetchCategories()
}

function handleSizeChange() {
  pagination.page = 1
  fetchCategories()
}

function openCreateDialog() {
  isEdit.value = false
  editId.value = null
  form.name = ''
  form.slug = ''
  dialogVisible.value = true
}

function openEditDialog(row: Category) {
  isEdit.value = true
  editId.value = row.id
  form.name = row.name
  form.slug = row.slug
  dialogVisible.value = true
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const params = {
        name: form.name,
        ...(form.slug ? { slug: form.slug } : {})
      }
      let res
      if (isEdit.value && editId.value) {
        res = await updateCategoryApi(editId.value, params)
      } else {
        res = await createCategoryApi(params)
      }
      if (res.success) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchCategories()
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined
      ElMessage.error(message || '操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

function goToArticles(categoryId: number) {
  router.push({
    path: '/background/content/articles',
    query: { categoryId: String(categoryId) }
  })
}

async function handleDelete(row: Category) {
  try {
    await ElMessageBox.confirm('确认删除该分类？关联的文章分类将被置空', '提示', {
      type: 'warning'
    })
    const res = await deleteCategoryApi(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchCategories()
    }
  } catch {
    // 取消删除或删除失败
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped lang="scss">
.categories-view {
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
}
</style>

<template>
  <div class="tags-view">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>标签管理</span>
          <el-button type="primary" size="small" @click="openCreateDialog">新增标签</el-button>
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

      <el-table :data="tags" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="name" label="标签名称" min-width="120" />
        <el-table-column prop="slug" label="简称" min-width="120" />
        <el-table-column prop="_count.postTags" label="文章数" width="100">
          <template #default="{ row }">
            <el-button link type="primary" @click="goToArticles(row.id)">
              {{ row._count?.postTags || 0 }}
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
          @current-change="fetchTags"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      width="500px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
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
import { getAllTagsApi, createTagApi, updateTagApi, deleteTagApi, type Tag } from '@/api/tag'

const router = useRouter()

const tags = ref<Tag[]>([])
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
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }]
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

async function fetchTags() {
  loading.value = true
  try {
    const res = await getAllTagsApi(buildQueryParams())
    if (res.success) {
      tags.value = res.data.items
      pagination.total = res.data.pagination.total
    }
  } catch {
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  fetchTags()
}

function handleReset() {
  filters.keyword = ''
  pagination.page = 1
  fetchTags()
}

function handleSizeChange() {
  pagination.page = 1
  fetchTags()
}

function openCreateDialog() {
  isEdit.value = false
  editId.value = null
  form.name = ''
  form.slug = ''
  dialogVisible.value = true
}

function openEditDialog(row: Tag) {
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
        res = await updateTagApi(editId.value, params)
      } else {
        res = await createTagApi(params)
      }
      if (res.success) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        dialogVisible.value = false
        fetchTags()
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

function goToArticles(tagId: number) {
  router.push({
    path: '/background/content/articles',
    query: { tagId: String(tagId) }
  })
}

async function handleDelete(row: Tag) {
  try {
    await ElMessageBox.confirm('确认删除该标签？关联的文章标签关联将被移除', '提示', {
      type: 'warning'
    })
    const res = await deleteTagApi(row.id)
    if (res.success) {
      ElMessage.success('删除成功')
      fetchTags()
    }
  } catch {
    // 取消删除或删除失败
  }
}

onMounted(() => {
  fetchTags()
})
</script>

<style scoped lang="scss">
.tags-view {
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

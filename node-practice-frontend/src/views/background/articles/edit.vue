<template>
  <div class="article-edit-view">
    <el-card shadow="never">
      <template #header>
        <div class="edit-header">
          <div class="header-left">
            <el-button link @click="goBack">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <span class="header-title">{{ isEdit ? '编辑文章' : '新增文章' }}</span>
          </div>
          <div class="header-right">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">保存</el-button>
          </div>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="摘要" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要（前台列表展示用）"
          />
        </el-form-item>
      </el-form>

      <div class="editor-container">
        <div class="editor-pane">
          <div class="pane-label">Markdown</div>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="20"
            placeholder="请输入 Markdown 格式文章内容"
            resize="none"
          />
        </div>
        <div class="preview-pane">
          <div class="pane-label">预览</div>
          <div class="markdown-preview" v-html="renderedHtml"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { marked } from 'marked'
import { getPostByIdApi, createPostApi, updatePostApi, type Post } from '@/api/article'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => Number(route.params.id))

const submitting = ref(false)
const formRef = ref()

const form = reactive({
  title: '',
  description: '',
  content: ''
})

const renderedHtml = computed(() => {
  return form.content
    ? marked.parse(form.content, { async: false })
    : '<p style="color:#999">暂无内容</p>'
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

function goBack() {
  router.push('/background/content/articles')
}

async function submitForm() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value && articleId.value) {
      const res = await updatePostApi(articleId.value, {
        title: form.title,
        content: form.content
      })
      if (res.success) {
        ElMessage.success('更新成功')
        goBack()
      }
    } else {
      const res = await createPostApi({
        title: form.title,
        content: form.content
      })
      if (res.success) {
        ElMessage.success('创建成功')
        goBack()
      }
    }
  } catch (err) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value && articleId.value) {
    try {
      const res = await getPostByIdApi(articleId.value)
      if (res.success) {
        form.title = res.data.title
        form.description = res.data.description || ''
        form.content = res.data.content
      }
    } catch (err) {
      ElMessage.error('获取文章详情失败')
      goBack()
    }
  }
})
</script>

<style scoped lang="scss">
@import '@/assets/styles/markdown.scss';

.article-edit-view {
  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .header-title {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .editor-container {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;

    .editor-pane,
    .preview-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 480px;

      .pane-label {
        padding: 8px 12px;
        font-size: 13px;
        font-weight: 500;
        color: #606266;
        background: #f5f7fa;
        border-bottom: 1px solid #dcdfe6;
      }
    }

    .editor-pane {
      :deep(.el-textarea__inner) {
        border: none;
        border-radius: 0;
        min-height: 480px;
        font-family: 'Courier New', monospace;
        line-height: 1.6;
      }
    }

    .preview-pane {
      border-left: 1px solid #dcdfe6;
      background: #fafafa;

      .markdown-preview {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        min-height: 480px;
      }
    }
  }
}
</style>

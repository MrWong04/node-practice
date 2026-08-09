import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import * as chatController from '../controllers/chatController'

// ==========================================================================
// 聊天路由 — 全部需要登录（JWT）
// ==========================================================================

const router = Router()

// 该路由组所有接口均需认证
router.use(authenticateToken)

// 会话 CRUD
router.post('/conversations', chatController.createConversation)
router.get('/conversations', chatController.listConversations)
router.get('/conversations/:id', chatController.getConversation)
router.patch('/conversations/:id', chatController.renameConversation)
router.delete('/conversations/:id', chatController.deleteConversation)

// 发送消息（SSE 流式）
router.post('/conversations/:id/messages', chatController.sendMessage)

export default router

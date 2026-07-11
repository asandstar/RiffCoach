// Cloudflare Function: AI Feedback API
// 未来可替换为真实 AI 后端（Workers AI / D1 数据库）
// 目前返回 mock 数据，供前端 API 调用测试

interface Env {
  AI: any // Workers AI binding (future)
  DB: any // D1 database binding (future)
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  try {
    const body = await request.json() as {
      triedBPM: number
      cleanBPM: number
      selfRating: number
      painPoints: string[]
      durationSeconds: number
    }

    // TODO: 替换为真实 AI 调用
    // const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', { ... })
    // TODO: 存储到 D1 数据库
    // await env.DB.prepare('INSERT INTO sessions ...').bind(...).run()

    return Response.json({
      success: true,
      message: 'API endpoint ready - currently using mock AI',
      data: body,
      hint: 'Replace this with Workers AI integration when ready',
    })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return Response.json({
    status: 'ok',
    service: 'RiffCoach API',
    version: '1.0.0',
    endpoints: {
      'POST /api/feedback': 'Generate AI feedback for practice session',
      'GET /api/feedback': 'API health check',
    },
  })
}

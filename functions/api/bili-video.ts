interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url)
  const bvid = url.searchParams.get('bvid')

  if (!bvid || !/^BV[a-zA-Z0-9]{10}$/.test(bvid)) {
    return Response.json(
      { success: false, error: 'Invalid bvid' },
      { status: 400 }
    )
  }

  try {
    const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com/',
      },
      cf: { cacheTtl: 3600 },
    })

    if (!response.ok) {
      return Response.json(
        { success: false, error: `Bilibili API error: ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json() as {
      code: number
      message?: string
      data?: {
        bvid: string
        title: string
        pic: string
        desc: string
        owner?: { name: string }
        stat?: { view: number; danmaku: number }
        pages?: Array<{ page: number; part: string; duration: number }>
      }
    }

    if (data.code !== 0 || !data.data) {
      return Response.json(
        { success: false, error: data.message || 'Unknown error' },
        { status: 502 }
      )
    }

    const video = data.data

    return Response.json({
      success: true,
      data: {
        bvid: video.bvid,
        title: video.title,
        cover: video.pic,
        description: video.desc,
        owner: video.owner?.name,
        viewCount: video.stat?.view,
        pages: (video.pages || []).map(p => ({
          page: p.page,
          title: p.part,
          duration: p.duration,
        })),
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    return Response.json(
      { success: false, error: 'Failed to fetch from Bilibili' },
      { status: 500 }
    )
  }
}

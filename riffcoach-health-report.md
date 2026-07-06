# RiffCoach 项目体检报告

生成时间: Mon Jul  6 19:07:10 CST 2026

## 1. 基础环境
```
Node: v22.23.1
npm: 10.9.8
当前目录: /Users/azq/Library/Application Support/TRAE SOLO CN/ModularData/ai-agent/work-mode-projects/6a486b37f296dc6b73da3fec/string-practice-compass
```

## 2. 项目结构检查
```
src/App.tsx
src/components/BottomNav.tsx
src/components/GlassCard.tsx
src/components/PageShell.tsx
src/components/QuickAddMaterialSheet.tsx
src/components/VideoPlayerCard.tsx
src/data/defaultData.ts
src/data/demoData.ts
src/index.css
src/main.tsx
src/pages/AIFeedbackPage.tsx
src/pages/CoverPage.tsx
src/pages/KnowledgePage.tsx
src/pages/MePage.tsx
src/pages/PracticePage.tsx
src/pages/ResourcePage.tsx
src/pages/ReviewPage.tsx
src/pages/TodayPage.tsx
src/pages/VideoStudyPage.tsx
src/store/useAppStore.ts
src/types/index.ts
src/utils/aiMock.ts
src/utils/bilibili.ts
src/utils/date.ts
```

## 3. 关键文件是否存在
- ✅ package.json
- ✅ vite.config.ts
- ✅ tsconfig.json
- ✅ src/main.tsx
- ✅ src/App.tsx
- ✅ src/store/useAppStore.ts
- ✅ src/types/index.ts
- ✅ src/utils/aiMock.ts
- ✅ src/utils/bilibili.ts
- ✅ src/pages/TodayPage.tsx
- ✅ src/pages/ResourcePage.tsx
- ✅ src/pages/KnowledgePage.tsx
- ✅ src/pages/VideoStudyPage.tsx
- ✅ src/pages/PracticePage.tsx
- ✅ src/pages/AIFeedbackPage.tsx

## 4. 依赖安装检查
node_modules 已存在。

## 5. TypeScript 类型检查
```
npm notice
npm notice New major version of npm available! 10.9.8 -> 11.18.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.18.0
npm notice To update run: npm install -g npm@11.18.0
npm notice
TypeScript 检查通过
```

## 6. 构建检查
```

> riffcoach@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
transforming...
✓ 1531 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.77 kB │ gzip:  0.47 kB
dist/assets/index-DI0a157d.css   19.35 kB │ gzip:  4.50 kB
dist/assets/index-CFjeCZA7.js   257.35 kB │ gzip: 76.50 kB
✓ built in 865ms
构建通过
```

## 7. 常见代码风险扫描
### any / ts-ignore / console / TODO / alert / confirm
```
src/utils/bilibili.ts:41:export function normalizeBiliEpisodes(apiResponse: any): BiliEpisode[] {
src/utils/bilibili.ts:43:  return apiResponse.data.pages.map((p: any) => ({
src/components/QuickAddMaterialSheet.tsx:40:      alert('请输入链接或标题');
src/components/QuickAddMaterialSheet.tsx:49:      type: materialType as any,
src/components/QuickAddMaterialSheet.tsx:60:    alert('已添加到素材篮');
src/components/QuickAddMaterialSheet.tsx:65:      alert('请输入链接或标题');
src/components/QuickAddMaterialSheet.tsx:84:        instrument: analysisResult.suggestedInstrument as any,
src/components/QuickAddMaterialSheet.tsx:92:      type: materialType as any,
src/components/QuickAddMaterialSheet.tsx:111:    alert('已转换为练习任务');
src/data/demoData.ts:36:      painPoints: painPoints as any[],
src/pages/MePage.tsx:39:          alert('文件格式不正确');
src/pages/MePage.tsx:42:        if (confirm('导入数据将覆盖当前数据，确定继续吗？')) {
src/pages/MePage.tsx:43:          alert('导入成功！');
src/pages/MePage.tsx:46:        alert('导入失败：文件格式错误');
src/pages/MePage.tsx:54:    if (confirm('加载演示数据将覆盖当前数据，确定继续吗？')) {
src/pages/MePage.tsx:56:      alert('演示数据加载成功！');
src/pages/PracticePage.tsx:81:          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
src/pages/PracticePage.tsx:149:    if (timeElapsed < 10 && !confirm('练习时间很短，确定要保存吗？')) {
src/pages/CoverPage.tsx:25:      alert('请输入歌曲名称');
src/pages/CoverPage.tsx:72:    alert('AI 已拆解练习路径');
src/pages/CoverPage.tsx:82:      alert('该段落还没有练习任务，请先点击 AI 拆解');
src/pages/CoverPage.tsx:193:                onChange={(e) => setNewProject({ ...newProject, instrument: e.target.value as any })}
src/pages/ResourcePage.tsx:47:    alert('AI 分析完成，已更新素材状态');
src/pages/ResourcePage.tsx:62:        instrument: extracted.suggestedInstrument as any,
src/pages/ResourcePage.tsx:71:    alert('已转换为练习任务');
src/store/useAppStore.ts:28:      const selfRating = s.selfRating ?? (s as any).rating ?? 0;
```

## 8. localStorage / demoData / B站工具相关扫描
```
src/types/index.ts:30:  bvid?: string
src/types/index.ts:78:  sourceLinks: { type: string; title: string; url: string; bvid?: string; page?: number }[]
src/types/index.ts:105:  bvid?: string
src/types/index.ts:135:  bvid?: string
src/types/index.ts:206:  coverProjects: CoverProject[]
src/types/index.ts:207:  currentEfficientPlan: EfficientPracticePlan | null
src/types/index.ts:208:  materialInbox: MaterialInboxItem[]
src/utils/aiMock.ts:8:  const projects = state.coverProjects || [];
src/utils/aiMock.ts:332:  const project = state.coverProjects.find((p) => p.id === lesson.projectId);
src/utils/bilibili.ts:7:export function buildBiliPlayerUrl(bvid: string, page: number = 1): string {
src/utils/bilibili.ts:8:  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1`;
src/utils/bilibili.ts:17:export async function fetchBiliEpisodes(bvid: string): Promise<BiliEpisode[] | null> {
src/utils/bilibili.ts:18:  const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
src/components/VideoPlayerCard.tsx:3:import { fetchBiliEpisodes, buildBiliPlayerUrl, getBiliFallbackEpisodes, type BiliEpisode } from '@/utils/bilibili';
src/components/VideoPlayerCard.tsx:6:  bvid: string;
src/components/VideoPlayerCard.tsx:12:export function VideoEpisodePicker({ bvid, currentPage, onPageChange, customEpisodes }: VideoEpisodePickerProps) {
src/components/VideoPlayerCard.tsx:19:    if (!bvid) return;
src/components/VideoPlayerCard.tsx:24:    fetchBiliEpisodes(bvid)
src/components/VideoPlayerCard.tsx:44:  }, [bvid, customEpisodes]);
src/components/VideoPlayerCard.tsx:108:  bvid: string;
src/components/VideoPlayerCard.tsx:115:export function VideoPlayerCard({ bvid, page, onPageChange, title, customEpisodes }: VideoPlayerCardProps) {
src/components/VideoPlayerCard.tsx:116:  const playerUrl = buildBiliPlayerUrl(bvid, page);
src/components/VideoPlayerCard.tsx:121:        <iframe
src/components/VideoPlayerCard.tsx:137:          bvid={bvid}
src/components/QuickAddMaterialSheet.tsx:36:  const { addMaterialToInbox, addLesson, coverProjects, sources } = useAppStore();
src/components/QuickAddMaterialSheet.tsx:44:    const bvid = extractBvid(linkOrTitle);
src/components/QuickAddMaterialSheet.tsx:51:      bvid: bvid || undefined,
src/components/QuickAddMaterialSheet.tsx:86:        bvid: extractBvid(linkOrTitle) || undefined,
src/components/QuickAddMaterialSheet.tsx:94:      bvid: extractBvid(linkOrTitle) || undefined,
src/data/demoData.ts:8:export function generateDemoData(): AppState {
src/data/demoData.ts:90:    sourceLinks: [{ type: 'bilibili', title: 'B站教程', url: 'https://www.bilibili.com/video/BV1Nb411i7gK', bvid: 'BV1Nb411i7gK', page: 1 }],
src/data/demoData.ts:113:      bvid: 'BV1Nb411i7gK',
src/data/demoData.ts:140:    coverProjects: [coverProject],
src/data/demoData.ts:141:    currentEfficientPlan: efficientPlan,
src/data/demoData.ts:142:    materialInbox: [],
src/data/defaultData.ts:45:      { id: 'les_6', sourceId: 'src_3', title: '风之诗 Wind Song', targetBPM: 70, tags: ['指弹'], instrument: 'acoustic' as const, targetDuration: 600, bvid: 'BV1GJ411x7h7', page: 1 },
src/data/defaultData.ts:46:      { id: 'les_7', sourceId: 'src_3', title: '黄昏 Twilight', targetBPM: 65, tags: ['指弹', '节奏'], instrument: 'acoustic' as const, targetDuration: 600, bvid: 'BV1GJ411x7h7', page: 1 },
src/data/defaultData.ts:290:    bvid: 'BV1NJVJzEEnn',
src/data/defaultData.ts:315:    bvid: 'BV1tb411i7aL',
src/data/defaultData.ts:334:    bvid: 'BV1sb411i7cK',
src/data/defaultData.ts:353:    bvid: 'BV1kb411i7eK',
src/data/defaultData.ts:372:    bvid: 'BV1zb411i7fK',
src/data/defaultData.ts:391:    bvid: 'BV1Nb411i7gK',
src/data/defaultData.ts:416:    bvid: 'BV1cb411i7hK',
src/data/defaultData.ts:435:    bvid: 'BV1db411i7jK',
src/data/defaultData.ts:469:  coverProjects: [],
src/data/defaultData.ts:470:  currentEfficientPlan: null,
src/data/defaultData.ts:471:  materialInbox: [],
src/pages/MePage.tsx:12:  const { sessions, coverProjects, loadDemoData, exportData } = useAppStore();
src/pages/MePage.tsx:101:            <p className="text-3xl font-bold text-amber-soft">{coverProjects.length}</p>
src/pages/VideoStudyPage.tsx:13:  const { videoResources, recentResources, coverProjects } = useAppStore();
src/pages/VideoStudyPage.tsx:35:  const relatedProject = coverProjects.find((p) =>
src/pages/VideoStudyPage.tsx:36:    p.sourceLinks.some((link) => link.bvid === video.bvid)
src/pages/VideoStudyPage.tsx:58:        bvid={video.bvid || ''}
src/pages/VideoStudyPage.tsx:59:        page={currentPage}
src/pages/PracticePage.tsx:24:  const { coverProjects, sessions, sources, addSession, updateCoverProject, setSessionFeedback, currentEfficientPlan } = useAppStore();
src/pages/PracticePage.tsx:41:  const currentProject = coverProjects[0];
src/pages/PracticePage.tsx:178:        coverProjects,
src/pages/PracticePage.tsx:182:        materialInbox: [],
src/pages/PracticePage.tsx:188:        currentEfficientPlan: null,
src/pages/PracticePage.tsx:234:      {currentEfficientPlan && (
src/pages/PracticePage.tsx:237:          <p className="font-semibold text-text-primary">{currentEfficientPlan.target}</p>
src/pages/ReviewPage.tsx:14:  const { sessions, coverProjects, sources } = useAppStore();
src/pages/ReviewPage.tsx:94:          {coverProjects.length > 0 && (
src/pages/ReviewPage.tsx:101:                {coverProjects.map((project) => {
src/pages/CoverPage.tsx:12:  const { coverProjects, addCoverProject, deleteCoverProject, sources, addLesson } = useAppStore();
src/pages/CoverPage.tsx:53:    const project = coverProjects.find((p) => p.id === projectId);
src/pages/CoverPage.tsx:76:    const project = coverProjects.find((p) => p.id === projectId);
src/pages/CoverPage.tsx:86:  const selectedProjectData = coverProjects.find((p) => p.id === selectedProject);
src/pages/CoverPage.tsx:102:      {coverProjects.length === 0 ? (
src/pages/CoverPage.tsx:115:          {coverProjects.map((project) => {
src/pages/AIFeedbackPage.tsx:11:  const { sessions, coverProjects } = useAppStore();
src/pages/TodayPage.tsx:17:  const { coverProjects, sessions, currentEfficientPlan, setCurrentEfficientPlan, videoResources, recentResources } = useAppStore();
src/pages/TodayPage.tsx:21:  const [showPlan, setShowPlan] = useState(!!currentEfficientPlan);
src/pages/TodayPage.tsx:23:  const currentProject = coverProjects[0];
src/pages/TodayPage.tsx:33:      { coverProjects, sessions, sources: [], knowledgeBase: { categories: [], items: [], videos: [], favorites: [] }, materialInbox: [], videoResources, recentResources, favoriteResources: [], instruments: [], painPointOptions: [], currentEfficientPlan: null, videoSize: 'compact' },
src/pages/TodayPage.tsx:116:      {showPlan && currentEfficientPlan && (
src/pages/TodayPage.tsx:119:          <p className="text-primary font-semibold mb-4">{currentEfficientPlan.target}</p>
src/pages/TodayPage.tsx:123:            <p className="text-sm text-text-primary">{currentEfficientPlan.reason}</p>
src/pages/TodayPage.tsx:129:              {currentEfficientPlan.steps.map((step, idx) => (
src/pages/TodayPage.tsx:146:          {currentEfficientPlan.avoid.length > 0 && (
src/pages/TodayPage.tsx:150:                {currentEfficientPlan.avoid.map((item, idx) => (
src/pages/TodayPage.tsx:159:            <p className="text-sm text-text-primary">{currentEfficientPlan.completion}</p>
src/pages/ResourcePage.tsx:14:  const { materialInbox, videoResources, sources, updateMaterialInbox, addLesson, recentResources, addRecentResource } = useAppStore();
src/pages/ResourcePage.tsx:31:    const material = materialInbox.find((m) => m.id === materialId);
src/pages/ResourcePage.tsx:51:    const material = materialInbox.find((m) => m.id === materialId);
src/pages/ResourcePage.tsx:64:        bvid: material.bvid || undefined,
src/pages/ResourcePage.tsx:173:          {materialInbox.length === 0 ? (
src/pages/ResourcePage.tsx:182:            materialInbox.map((material) => (
src/store/useAppStore.ts:5:import { generateDemoData } from '@/data/demoData';
src/store/useAppStore.ts:44:  if (result.coverProjects === undefined) {
src/store/useAppStore.ts:45:    result.coverProjects = [];
src/store/useAppStore.ts:48:  if (result.currentEfficientPlan === undefined) {
src/store/useAppStore.ts:49:    result.currentEfficientPlan = null;
src/store/useAppStore.ts:56:  if (!result.materialInbox) {
src/store/useAppStore.ts:57:    result.materialInbox = [];
src/store/useAppStore.ts:88:  updateCoverSection: (projectId: string, sectionId: string, updates: Partial<AppState['coverProjects'][0]['sections'][0]>) => void;
src/store/useAppStore.ts:138:        coverProjects: [...state.coverProjects, {
src/store/useAppStore.ts:147:        coverProjects: state.coverProjects.map((p) =>
src/store/useAppStore.ts:153:        coverProjects: state.coverProjects.filter((p) => p.id !== id),
src/store/useAppStore.ts:157:        coverProjects: state.coverProjects.map((p) =>
src/store/useAppStore.ts:171:        materialInbox: [...state.materialInbox, {
src/store/useAppStore.ts:180:        materialInbox: state.materialInbox.map((m) =>
src/store/useAppStore.ts:186:        materialInbox: state.materialInbox.filter((m) => m.id !== id),
src/store/useAppStore.ts:189:      setCurrentEfficientPlan: (plan) => set({ currentEfficientPlan: plan }),
src/store/useAppStore.ts:226:      loadDemoData: () => set(generateDemoData()),
src/store/useAppStore.ts:235:      storage: createJSONStorage(() => localStorage),
```

## 9. 页面入口和核心组件扫描
```
src/App.tsx:2:import { BottomNav } from '@/components/BottomNav';
src/App.tsx:4:import { QuickAddMaterialSheet } from '@/components/QuickAddMaterialSheet';
src/App.tsx:5:import { TodayPage } from '@/pages/TodayPage';
src/App.tsx:7:import { ResourcePage } from '@/pages/ResourcePage';
src/App.tsx:10:import { VideoStudyPage } from '@/pages/VideoStudyPage';
src/App.tsx:11:import { KnowledgePage } from '@/pages/KnowledgePage';
src/App.tsx:12:import { PracticePage } from '@/pages/PracticePage';
src/App.tsx:13:import { AIFeedbackPage } from '@/pages/AIFeedbackPage';
src/App.tsx:20:  const showBottomNav = !['practice', 'ai-feedback', 'video-study'].includes(currentPage);
src/App.tsx:25:        return <TodayPage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
src/App.tsx:29:        return <ResourcePage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
src/App.tsx:35:        return <VideoStudyPage onPageChange={setCurrentPage} />;
src/App.tsx:37:        return <KnowledgePage onPageChange={setCurrentPage} />;
src/App.tsx:39:        return <PracticePage onPageChange={setCurrentPage} />;
src/App.tsx:41:        return <AIFeedbackPage onPageChange={setCurrentPage} />;
src/App.tsx:43:        return <TodayPage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
src/App.tsx:64:      <PageShell title={getPageTitle()} showBottomNav={showBottomNav}>
src/App.tsx:67:      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} show={showBottomNav} />
src/App.tsx:68:      <QuickAddMaterialSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
src/components/BottomNav.tsx:4:interface BottomNavProps {
src/components/BottomNav.tsx:18:export function BottomNav({ currentPage, onPageChange, show }: BottomNavProps) {
src/components/PageShell.tsx:6:  showBottomNav: boolean;
src/components/PageShell.tsx:9:export function PageShell({ title, children, showBottomNav }: PageShellProps) {
src/components/PageShell.tsx:11:    <div className={`min-h-screen bg-bg-base ${showBottomNav ? 'pb-24' : 'pb-8'}`}>
src/components/VideoPlayerCard.tsx:5:interface VideoEpisodePickerProps {
src/components/VideoPlayerCard.tsx:12:export function VideoEpisodePicker({ bvid, currentPage, onPageChange, customEpisodes }: VideoEpisodePickerProps) {
src/components/VideoPlayerCard.tsx:136:        <VideoEpisodePicker
src/components/QuickAddMaterialSheet.tsx:7:interface QuickAddMaterialSheetProps {
src/components/QuickAddMaterialSheet.tsx:28:export function QuickAddMaterialSheet({ isOpen, onClose }: QuickAddMaterialSheetProps) {
src/pages/VideoStudyPage.tsx:8:interface VideoStudyPageProps {
src/pages/VideoStudyPage.tsx:12:export function VideoStudyPage({ onPageChange }: VideoStudyPageProps) {
src/pages/PracticePage.tsx:9:interface PracticePageProps {
src/pages/PracticePage.tsx:23:export function PracticePage({ onPageChange }: PracticePageProps) {
src/pages/KnowledgePage.tsx:7:interface KnowledgePageProps {
src/pages/KnowledgePage.tsx:25:export function KnowledgePage({ onPageChange }: KnowledgePageProps) {
src/pages/AIFeedbackPage.tsx:6:interface AIFeedbackPageProps {
src/pages/AIFeedbackPage.tsx:10:export function AIFeedbackPage({ onPageChange }: AIFeedbackPageProps) {
src/pages/TodayPage.tsx:8:interface TodayPageProps {
src/pages/TodayPage.tsx:16:export function TodayPage({ onPageChange, onQuickAdd }: TodayPageProps) {
src/pages/ResourcePage.tsx:8:interface ResourcePageProps {
src/pages/ResourcePage.tsx:13:export function ResourcePage({ onPageChange, onQuickAdd }: ResourcePageProps) {
src/store/useAppStore.ts:96:  updateVideoResourcePage: (resourceId: string, page: number) => void;
src/store/useAppStore.ts:218:      updateVideoResourcePage: (resourceId, page) => set((state) => ({
```

## 10. 建议人工重点检查的问题
请重点手动检查：

1. 资料页是否比以前更方便：能不能快速粘贴教程链接、加入素材篮、AI 整理成练习任务。
2. 知识库是否真的变成目录式查阅，而不是普通卡片列表。
3. 视频学习页是否能稳定切换 B站选集；接口失败时是否能手动输入 P 数。
4. 今日页是否能直接进入“高效练习计划”，而不是被 Hero 或其他模块干扰。
5. Cover 目标是否能和资料、练习任务、练习记录、周复盘串起来。
6. 练习完成后是否真的进入 AI 反馈页，并保存 session.aiFeedback。
7. 刷新页面后 localStorage 数据是否还在。
8. 断网时核心演示是否还能跑通。
9. 移动端底部导航是否遮挡按钮。
10. 构建产物 dist 是否能正常部署到 GitHub Pages。

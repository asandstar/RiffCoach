import { useState } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { PageShell } from '@/components/PageShell';
import { QuickAddMaterialSheet } from '@/components/QuickAddMaterialSheet';
import { TodayPage } from '@/pages/TodayPage';
import { CoverPage } from '@/pages/CoverPage';
import { ResourcePage } from '@/pages/ResourcePage';
import { ReviewPage } from '@/pages/ReviewPage';
import { MePage } from '@/pages/MePage';
import { VideoStudyPage } from '@/pages/VideoStudyPage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { PracticePage } from '@/pages/PracticePage';
import { AIFeedbackPage } from '@/pages/AIFeedbackPage';
import type { PageType } from '@/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('today');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const showBottomNav = !['practice', 'ai-feedback', 'video-study', 'review'].includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'today':
        return <TodayPage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
      case 'cover':
        return <CoverPage onPageChange={setCurrentPage} />;
      case 'resource':
        return <ResourcePage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
      case 'review':
        return <ReviewPage onPageChange={setCurrentPage} />;
      case 'me':
        return <MePage onPageChange={setCurrentPage} />;
      case 'video-study':
        return <VideoStudyPage onPageChange={setCurrentPage} />;
      case 'knowledge':
        return <KnowledgePage onPageChange={setCurrentPage} />;
      case 'practice':
        return <PracticePage onPageChange={setCurrentPage} />;
      case 'ai-feedback':
        return <AIFeedbackPage onPageChange={setCurrentPage} />;
      default:
        return <TodayPage onPageChange={setCurrentPage} onQuickAdd={() => setShowQuickAdd(true)} />;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'today': return '今日';
      case 'cover': return 'Cover';
      case 'resource': return '资料';
      case 'review': return '复盘';
      case 'me': return '我的';
      case 'video-study': return '视频学习';
      case 'knowledge': return '知识库';
      case 'practice': return undefined;
      case 'ai-feedback': return undefined;
      default: return 'RiffCoach';
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <PageShell title={getPageTitle()} showBottomNav={showBottomNav}>
        <div key={currentPage} className="page-enter">
          {renderPage()}
        </div>
      </PageShell>
      <BottomNav currentPage={currentPage} onPageChange={setCurrentPage} show={showBottomNav} />
      <QuickAddMaterialSheet isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </div>
  );
}

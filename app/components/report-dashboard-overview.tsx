import { FC, useMemo } from 'react';
import { Card, CardBody } from '@heroui/react';

import { StatChart } from './stat-chart';

import { ReportHistory } from '@/app/lib/storage';

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" x2="9" y1="9" y2="15" />
    <line x1="9" x2="15" y1="9" y2="15" />
  </svg>
);

const AlertTriangleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

const MinusCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </svg>
);

interface ReportDashboardOverviewProps {
  reports: ReportHistory[];
}

const ReportDashboardOverview: FC<ReportDashboardOverviewProps> = ({ reports }) => {
  const aggregateStats = useMemo(() => {
    return reports.reduce(
      (acc, r) => {
        if (!r.stats) return acc;
        acc.expected += r.stats.expected || 0;
        acc.unexpected += r.stats.unexpected || 0;
        acc.flaky += r.stats.flaky || 0;
        acc.skipped += r.stats.skipped || 0;
        acc.total += r.stats.total || 0;

        return acc;
      },
      { expected: 0, unexpected: 0, flaky: 0, skipped: 0, total: 0, ok: true },
    );
  }, [reports]);

  if (!reports?.length || aggregateStats.total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 mt-2 items-center bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/10 p-6 rounded-2xl shadow-sm backdrop-blur-md">
      <div className="w-full md:w-1/3 flex justify-center min-w-[300px]">
        <StatChart stats={aggregateStats} />
      </div>

      <div className="w-full md:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none bg-success/10 shadow-none">
          <CardBody className="flex flex-col items-center justify-center p-4 gap-2">
            <CheckCircleIcon className="w-8 h-8 text-success" />
            <span className="text-3xl font-bold text-success">{aggregateStats.expected}</span>
            <span className="text-xs uppercase font-medium text-success-600">Passed</span>
          </CardBody>
        </Card>

        <Card className="border-none bg-danger/10 shadow-none">
          <CardBody className="flex flex-col items-center justify-center p-4 gap-2">
            <XCircleIcon className="w-8 h-8 text-danger" />
            <span className="text-3xl font-bold text-danger">{aggregateStats.unexpected}</span>
            <span className="text-xs uppercase font-medium text-danger-600">Failed</span>
          </CardBody>
        </Card>

        <Card className="border-none bg-warning/10 shadow-none">
          <CardBody className="flex flex-col items-center justify-center p-4 gap-2">
            <AlertTriangleIcon className="w-8 h-8 text-warning" />
            <span className="text-3xl font-bold text-warning">{aggregateStats.flaky}</span>
            <span className="text-xs uppercase font-medium text-warning-600">Flaky</span>
          </CardBody>
        </Card>

        <Card className="border-none bg-default-100 shadow-none">
          <CardBody className="flex flex-col items-center justify-center p-4 gap-2">
            <MinusCircleIcon className="w-8 h-8 text-default-500" />
            <span className="text-3xl font-bold text-default-600">{aggregateStats.skipped}</span>
            <span className="text-xs uppercase font-medium text-default-500">Skipped</span>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ReportDashboardOverview;

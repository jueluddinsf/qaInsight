import { FC } from 'react';
import { Tooltip } from '@heroui/react';

import { type ReportStats } from '@/app/lib/parser';

interface ReportSummaryBarProps {
  stats?: ReportStats;
}

const ReportSummaryBar: FC<ReportSummaryBarProps> = ({ stats }) => {
  if (!stats || !stats.total) {
    return <span className="text-gray-400 text-xs">No stats</span>;
  }

  const passed = stats.expected || 0;
  const failed = stats.unexpected || 0;
  const flaky = stats.flaky || 0;
  const skipped = stats.skipped || 0;
  const total = stats.total - skipped; // usually progress is out of executed tests, but we'll include skipped in the bar to be safe
  const totalPill = stats.total;

  const getPercent = (value: number) => {
    if (totalPill === 0) return 0;

    return (value / totalPill) * 100;
  };

  return (
    <div className="flex flex-col gap-0.5 w-full min-w-[200px]">
      <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-default-100">
        {passed > 0 && (
          <Tooltip content={`Passed: ${passed}`} placement="top">
            <div className="bg-success h-full" style={{ width: `${getPercent(passed)}%` }} />
          </Tooltip>
        )}
        {failed > 0 && (
          <Tooltip content={`Failed: ${failed}`} placement="top">
            <div className="bg-danger h-full" style={{ width: `${getPercent(failed)}%` }} />
          </Tooltip>
        )}
        {flaky > 0 && (
          <Tooltip content={`Flaky: ${flaky}`} placement="top">
            <div className="bg-warning h-full" style={{ width: `${getPercent(flaky)}%` }} />
          </Tooltip>
        )}
        {skipped > 0 && (
          <Tooltip content={`Skipped: ${skipped}`} placement="top">
            <div className="bg-default-300 h-full" style={{ width: `${getPercent(skipped)}%` }} />
          </Tooltip>
        )}
      </div>
      <div className="flex justify-between items-center text-[9px] text-default-500 px-0.5">
        <span className="text-success font-medium">Pass: {passed}</span>
        <span className="text-danger font-medium">Fail: {failed}</span>
        <span className="text-warning font-medium">Flaky: {flaky}</span>
        <span className="text-default-400 font-medium">Skip: {skipped}</span>
      </div>
    </div>
  );
};

export default ReportSummaryBar;

'use client';

import { Spinner, Card, CardBody } from '@heroui/react';
import { useCallback, useState, useMemo } from 'react';
import { toast } from 'sonner';

import { defaultProjectName } from '../lib/constants';

import ProjectSelect from './project-select';

import { TrendChart } from '@/app/components/trend-chart';
import { DurationChart } from '@/app/components/duration-chart';
import { title as titleStyles } from '@/app/components/primitives';
import useQuery from '@/app/hooks/useQuery';
import { type ReportHistory } from '@/app/lib/storage';
import { withQueryParams } from '@/app/lib/network';

export default function ReportTrends() {
  const [project, setProject] = useState(defaultProjectName);

  const {
    data: reports,
    error,
    isFetching,
    isPending,
  } = useQuery<ReportHistory[]>(
    withQueryParams('/api/report/trend', {
      project,
    }),
    { dependencies: [project] },
  );

  const onProjectChange = useCallback((project: string) => {
    setProject(project);
  }, []);

  const kpis = useMemo(() => {
    if (!reports || reports.length === 0) return null;
    let totalExpected = 0;
    let totalTests = 0;
    let sumDuration = 0;

    reports.forEach((r) => {
      totalExpected += r.stats?.expected || 0;
      totalTests += r.stats?.total || 0;
      sumDuration += r.duration || 0;
    });

    const avgPassRate = totalTests > 0 ? (totalExpected / totalTests) * 100 : 0;
    const avgDuration = sumDuration / reports.length;

    const seconds = Math.floor((avgDuration / 1000) % 60);
    const minutes = Math.floor((avgDuration / (1000 * 60)) % 60);
    const formattedAvgDuration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return {
      runs: reports.length,
      avgPassRate: Math.round(avgPassRate),
      avgDuration: formattedAvgDuration,
      totalSpecs: reports.reduce((acc, r) => acc + (r.files?.length || 0), 0),
    };
  }, [reports]);

  error && toast.error(error.message);

  return (
    <div className="w-[min(100%,1200px)] mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className={titleStyles({ size: 'sm' })}>Trends Dashboard</h1>
        <div className="flex gap-4">
          <ProjectSelect entity="report" onSelect={onProjectChange} />
        </div>
      </div>

      {(isFetching || isPending) && (
        <div className="flex w-full min-h-[300px] justify-center items-center">
          <Spinner size="lg" />
        </div>
      )}

      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-default-200">
            <CardBody className="py-4">
              <div className="text-default-500 text-sm">Total Runs Analyzed</div>
              <div className="text-2xl font-bold">{kpis.runs}</div>
            </CardBody>
          </Card>
          <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-default-200">
            <CardBody className="py-4">
              <div className="text-default-500 text-sm">Average Pass Rate</div>
              <div className="text-2xl font-bold text-success">{kpis.avgPassRate}%</div>
            </CardBody>
          </Card>
          <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-default-200">
            <CardBody className="py-4">
              <div className="text-default-500 text-sm">Average Duration</div>
              <div className="text-2xl font-bold">{kpis.avgDuration}</div>
            </CardBody>
          </Card>
          <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-default-200">
            <CardBody className="py-4">
              <div className="text-default-500 text-sm">Total Spec Files</div>
              <div className="text-2xl font-bold">{kpis.totalSpecs}</div>
            </CardBody>
          </Card>
        </div>
      )}

      {!!reports?.length && (
        <div className="flex flex-col gap-6 w-full">
          <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-default-200 pb-0">
            <CardBody className="overflow-hidden p-6 w-full relative">
              <h3 className="text-lg font-bold mb-4">Pass / Fail Success Rate</h3>
              <div className="w-full">
                <TrendChart reportHistory={reports} />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm border border-default-200 pb-0 mb-8">
            <CardBody className="overflow-hidden p-6 w-full relative">
              <h3 className="text-lg font-bold mb-4">Execution Time Variability</h3>
              <div className="w-full">
                <DurationChart reportHistory={reports} />
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

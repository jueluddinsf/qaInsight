'use client';

import { useCallback, useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Pagination,
  LinkIcon,
  Chip,
  type Selection,
} from '@heroui/react';
import Link from 'next/link';
import { keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';

import { withBase } from '../lib/url';

import TablePaginationOptions from './table-pagination-options';

import { withQueryParams } from '@/app/lib/network';
import { defaultProjectName } from '@/app/lib/constants';
import useQuery from '@/app/hooks/useQuery';
import DeleteReportButton from '@/app/components/delete-report-button';
import FormattedDate from '@/app/components/date-format';
import { BranchIcon, FolderIcon } from '@/app/components/icons';
import { ReadReportsHistory, ReportHistory } from '@/app/lib/storage';
import ReportDashboardOverview from '@/app/components/report-dashboard-overview';
import ReportSummaryBar from '@/app/components/report-summary-bar';

const columns = [{ name: 'Reports', uid: 'card' }];

const formatDurationMs = (ms?: number) => {
  if (!ms) return '0s';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;

  return `${seconds}s`;
};

const coreFields = [
  'reportID',
  'title',
  'project',
  'createdAt',
  'size',
  'sizeBytes',
  'reportUrl',
  'metadata',
  'startTime',
  'duration',
  'files',
  'projectNames',
  'stats',
  'errors',
];

const formatMetadataValue = (value: any): string => {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const getMetadataItems = (item: ReportHistory) => {
  const metadata: Array<{ key: string; value: any; icon?: React.ReactNode }> = [];

  // Cast to any to access dynamic properties that come from resultDetails
  const itemWithMetadata = item as any;

  // Add specific fields in preferred order
  if (itemWithMetadata.environment) {
    metadata.push({ key: 'environment', value: itemWithMetadata.environment });
  }
  if (itemWithMetadata.workingDir) {
    const dirName = itemWithMetadata.workingDir.split('/').pop() || itemWithMetadata.workingDir;

    metadata.push({ key: 'workingDir', value: dirName, icon: <FolderIcon /> });
  }
  if (itemWithMetadata.branch) {
    metadata.push({ key: 'branch', value: itemWithMetadata.branch, icon: <BranchIcon /> });
  }

  // Add any other metadata fields
  Object.entries(itemWithMetadata).forEach(([key, value]) => {
    if (!coreFields.includes(key) && !['environment', 'workingDir', 'branch'].includes(key)) {
      // Skip empty objects
      if (value !== null && typeof value === 'object' && Object.keys(value).length === 0) {
        return;
      }
      metadata.push({ key, value });
    }
  });

  return metadata;
};

interface ReportsTableProps {
  onChange: () => void;
  selected?: string[];
  onSelect?: (reports: ReportHistory[]) => void;
  onDeleted?: () => void;
}

export default function ReportsTable({ onChange, selected, onSelect, onDeleted }: Readonly<ReportsTableProps>) {
  const reportListEndpoint = '/api/report/list';
  const [project, setProject] = useState(defaultProjectName);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getQueryParams = () => ({
    limit: rowsPerPage.toString(),
    offset: ((page - 1) * rowsPerPage).toString(),
    project,
    ...(search.trim() && { search: search.trim() }),
    ...(dateFrom && { dateFrom }),
    ...(dateTo && { dateTo }),
  });

  const {
    data: reportResponse,
    isFetching,
    isPending,
    error,
    refetch,
  } = useQuery<ReadReportsHistory>(withQueryParams(reportListEndpoint, getQueryParams()), {
    dependencies: [project, search, dateFrom, dateTo, rowsPerPage, page],
    placeholderData: keepPreviousData,
  });

  const { reports, total } = reportResponse ?? {};

  const handleDeleted = () => {
    onDeleted?.();
    onChange?.();
    refetch();
  };

  const onChangeSelect = (keys: Selection) => {
    if (keys === 'all') {
      const all = reports ?? [];

      onSelect?.(all);
    }

    if (typeof keys === 'string') {
      return;
    }

    const selectedKeys = Array.from(keys);
    const selectedReports = reports?.filter((r) => selectedKeys.includes(r.reportID)) ?? [];

    onSelect?.(selectedReports);
  };

  const onPageChange = useCallback(
    (page: number) => {
      setPage(page);
    },
    [page, rowsPerPage],
  );

  const onProjectChange = useCallback(
    (project: string) => {
      setProject(project);
      setPage(1);
    },
    [page, rowsPerPage],
  );

  const onSearchChange = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1);
  }, []);

  const onDateFromChange = useCallback((date: string) => {
    setDateFrom(date);
    setPage(1);
  }, []);

  const onDateToChange = useCallback((date: string) => {
    setDateTo(date);
    setPage(1);
  }, []);

  const pages = useMemo(() => {
    return total ? Math.ceil(total / rowsPerPage) : 0;
  }, [project, total, rowsPerPage]);

  error && toast.error(error.message);
  console.log('reports', reports);

  return (
    <>
      <ReportDashboardOverview reports={reports ?? []} />
      <TablePaginationOptions
        dateFrom={dateFrom}
        dateTo={dateTo}
        entity="report"
        rowPerPageOptions={undefined}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        total={total}
        onDateFromChange={onDateFromChange}
        onDateToChange={onDateToChange}
        onProjectChange={onProjectChange}
        onSearchChange={onSearchChange}
      />
      <Table
        hideHeader
        aria-label="Reports"
        bottomContent={
          pages > 1 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={onPageChange}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper:
            'p-4 border-1 border-gray-200 dark:border-gray-800 shadow-sm rounded-xl bg-white/50 dark:bg-black/50 backdrop-blur-md',
          tr: 'border-b-1 border-gray-100 dark:border-gray-800 transition-all hover:bg-default-100/10 hover:shadow-sm hover:scale-[1.01]',
        }}
        radius="none"
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={onChangeSelect}
      >
        <TableHeader columns={columns}>
          {(column) => <TableColumn key={column.uid}>{column.name}</TableColumn>}
        </TableHeader>
        <TableBody
          emptyContent="No reports."
          isLoading={isFetching || isPending}
          items={reports ?? []}
          loadingContent={<Spinner />}
        >
          {(item) => (
            <TableRow key={item.reportID}>
              <TableCell className="w-full">
                <div className="flex flex-col lg:flex-row items-start lg:items-center w-full py-1">
                  {/* Left: Title & basic info */}
                  <div className="flex flex-col gap-0 flex-1 min-w-[200px]">
                    <Link href={withBase(`/report/${item.reportID}`)} prefetch={false}>
                      <div className="flex flex-row items-center font-bold text-[13.5px] hover:underline cursor-pointer group text-black dark:text-white truncate pb-0.5">
                        {item.title || item.reportID}{' '}
                        <span className="ml-1.5 opacity-50 group-hover:opacity-100 scale-75">
                          <LinkIcon />
                        </span>
                      </div>
                    </Link>
                    <div className="text-[10px] text-default-500 flex items-center gap-1.5">
                      <span className="font-semibold text-primary">{item.project}</span>
                      <span className="opacity-50">•</span>
                      <span>{item.files?.length || 0} spec files</span>
                      <span className="opacity-50">•</span>
                      <span>{item.duration ? formatDurationMs(item.duration) : '0s'}</span>
                      {/* Tags array */}
                      <div className="hidden lg:flex flex-wrap gap-1 ml-2">
                        {getMetadataItems(item)
                          .slice(0, 3)
                          .map(({ key, value }, index) => {
                            return (
                              <Chip
                                key={`${key}-${index}`}
                                className="h-4 text-[8px] px-1 border-none bg-default-100 text-default-600"
                                size="sm"
                                variant="flat"
                              >
                                <span className="max-w-[70px] truncate">
                                  {key}: {formatMetadataValue(value)}
                                </span>
                              </Chip>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Stats */}
                  <div className="w-full lg:w-[260px] shrink-0 mt-1 lg:mt-0 mx-0 lg:mx-4">
                    <ReportSummaryBar stats={item.stats} />
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-auto mt-1 lg:mt-0">
                    <div className="hidden xl:flex flex-col items-end mr-1 leading-[1.2]">
                      <span className="text-[10px] text-default-500 whitespace-nowrap">
                        <FormattedDate date={item.createdAt} />
                      </span>
                      <span className="text-[9px] text-default-400">{item.size}</span>
                    </div>
                    <Link href={withBase(`/report/${item.reportID}`)} prefetch={false}>
                      <Button className="h-6 min-h-0 text-[10px] px-2 min-w-0" size="sm" variant="flat">
                        JSON
                      </Button>
                    </Link>
                    <Link href={withBase(item.reportUrl)} prefetch={false} target="_blank">
                      <Button className="h-6 min-h-0 text-[10px] px-2 min-w-0" color="primary" size="sm" variant="flat">
                        HTML
                      </Button>
                    </Link>
                    <DeleteReportButton reportId={item.reportID} onDeleted={handleDeleted} />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
